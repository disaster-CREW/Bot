import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

// Shared memory map now stores an object: { history: [], timezone: "UTC" }
export const userMemory = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask ASTRYX a question ✨")
    .addStringOption(option =>
      option
        .setName("prompt")
        .setDescription("What do you want to ask?")
        .setRequired(true)
    )
    // 🌍 Dropdown to set or change their timezone context
    .addStringOption(option =>
      option
        .setName("timezone")
        .setDescription("Select your timezone to let ASTRYX remember your local time 🕒")
        .setRequired(false)
        .addChoices(
          { name: "London / GMT (UK)", value: "Europe/London" },
          { name: "New York / EST (US East)", value: "America/New_York" },
          { name: "Los Angeles / PST (US West)", value: "America/Los_Angeles" },
          { name: "Tokyo / JST (Japan)", value: "Asia/Tokyo" },
          { name: "Sydney / AEST (Australia)", value: "Australia/Sydney" }
        )
    ),

  async execute(interaction) {
    const userPrompt = interaction.options.getString("prompt");
    const user = interaction.user;
    const chosenTimezone = interaction.options.getString("timezone");

    // 👀 Start the "ASTRYX is typing..." indicator in the channel
    try {
      await interaction.channel.sendTyping();
    } catch (typingErr) {
      console.error("Could not send typing indicator:", typingErr);
    }

    await interaction.deferReply();

    // -------------------------
    // PERSISTENT MEMORY FETCH
    // -------------------------
    let userData = userMemory.get(user.id) || { history: [], timezone: "UTC" };
    let history = userData.history || [];

    // 🕒 If they explicitly picked a new timezone in the command, overwrite the saved one
    if (chosenTimezone) {
      userData.timezone = chosenTimezone;
    }

    const savedTimezone = userData.timezone;

    // 🕒 Calculate real-time contexts using the saved or updated preference
    const now = new Date();
    const serverTimeStr = now.toLocaleString("en-US", { timeZone: "UTC" });
    let localizedTimeStr = "";

    if (savedTimezone !== "UTC") {
      const formattedUserTime = now.toLocaleString("en-US", {
        timeZone: savedTimezone,
        dateStyle: "full",
        timeStyle: "long"
      });
      localizedTimeStr = `The user has explicitly consented to share their location/time context. Their saved local timezone is ${savedTimezone} and their current exact local date and time is ${formattedUserTime}.`;
    } else {
      localizedTimeStr = "The user has not provided a specific timezone, so treat their timezone as default UTC.";
    }

    // -------------------------
    // SYSTEM PROMPT (4 lines, spaced)
    // -------------------------
    const systemPrompt = 
     `Your name is <@${interaction.client.user.id}>. Always call yourself exactly <@${interaction.client.user.id}>. ` +
     `You are an expressive Discord bot who uses emojis naturally. ` +
     `Never mention your model name or break character; stay friendly and positive. ` +
     `Keep explanations simple and always call the user <@${user.id}>. Do not apologize unless asked. ` +
     `CURRENT TIME CONTEXT: The base server universal time is ${serverTimeStr} (UTC). ${localizedTimeStr}`;

    // Remove corrupted entries
    history = history.filter(m =>
      m &&
      typeof m.content === "string" &&
      m.content.trim().length > 0 &&
      (m.role === "user" || m.role === "assistant")
    );

    // Add new user message
    history.push({ role: "user", content: userPrompt });

    // Keep last 8 messages only (Groq-safe)
    if (history.length > 8) history = history.slice(-8);

    // Save history back into the structured data object
    userData.history = history;
    userMemory.set(user.id, userData);

    // 🛠️ FIXED: For browsing tools, system instructions work best when pre-pended directly to the conversational block array items
    const messages = [
      { role: "user", content: `[SYSTEM RULES: ${systemPrompt}]\n\nUser Question: ${userPrompt}` },
      ...history.slice(0, -1) // Exclude the duplicated last prompt item
    ];

    try {
      const response = await fetch("https://groq.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b", 
          messages,
          max_tokens: 300, 
          temperature: 0.7,
          tools: [
            {
              type: "browser_search"
            }
          ],
          tool_choice: "auto"
        })
      });

      // 🛡️ Safety fallback: If Groq complains about anything, log it directly without crashing
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Groq API Error Code ${response.status}:`, errorBody);
        return interaction.editReply("⚠️ Groq had an internal error processing the search.");
      }

      const data = await response.json();

      if (data.error) {
        console.error("Groq API Error:", data.error);
        return interaction.editReply(`Groq Error: ${data.error.message}`);
      }

      // 🛠️ FIXED: Restored to standard single optional chain formatting
      const reply = data?.choices?.[0]?.message?.content?.trim();

      if (reply) {
        if (reply.length > 2000) {
          reply = reply.substring(0, 1997) + "...";
        }

        let postFetchData = userMemory.get(user.id) || userData;
        postFetchData.history.push({ role: "assistant", content: reply });
        userMemory.set(user.id, postFetchData);
        
        return interaction.editReply(reply);
      }

      return interaction.editReply("I couldn't generate a response.");

    } catch (err) {
      console.error("Fetch error:", err);
      return interaction.editReply("ASTRYX had a connection issue.");
    }
  }
};
