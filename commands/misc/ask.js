import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

// Shared memory map (used by /ask and /forget)
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
    ),

  async execute(interaction) {
    const userPrompt = interaction.options.getString("prompt");
    const user = interaction.user;

    await interaction.deferReply();

    // -------------------------
    // SYSTEM PROMPT (4 lines, spaced)
    // -------------------------
    const systemPrompt = 
     `Your name is <@${interaction.client.user.id}>. Always call yourself exactly <@${interaction.client.user.id}>. ` +
     ` You are an expressive Discord bot who uses emojis naturally. ` +
     ` Never mention your model name or break character; stay friendly and positive. ` +
     ` Keep explanations simple and always call the user <@${user.id}>. Do not apologize unless asked. `;

    // -------------------------
    // MEMORY SYSTEM (8 messages)
    // -------------------------
    let history = userMemory.get(user.id) || [];

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

    // Save updated memory
    userMemory.set(user.id, history);

    // Build messages for Groq
    const messages = [
      { role: "system", content: systemPrompt },
      ...history
    ];

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "groq/compound-mini",
          messages,
          max_tokens: 190,
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (data.error) {
        console.error("Groq API Error:", data.error);
        return interaction.editReply(`Groq Error: ${data.error.message}`);
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();

      if (reply) {
        history.push({ role: "assistant", content: reply });
        userMemory.set(user.id, history);
        return interaction.editReply(reply);
      }

      return interaction.editReply("I couldn't generate a response.");

    } catch (err) {
      console.error("Fetch error:", err);
      return interaction.editReply("ASTRYX had a connection issue.");
    }
  }
};
