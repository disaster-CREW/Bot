import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

// Per‑user memory
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

const systemPrompt =
  `Your name is <@${interaction.client.user.id}>. Always call yourself exactly <@${interaction.client.user.id}>. `
  + ` Never mention your model name and never break character. `
  + ` Use emojis naturally, stay friendly, positive, and expressive. `
  + ` Keep explanations simple and always call the user <@${user.id}>. Do not apologize unless asked. `;

    // -------------------------
    // MEMORY SYSTEM (CLEAN + SAFE)
    // -------------------------

    let history = userMemory.get(user.id) || [];

    // Remove broken or empty entries
    history = history.filter(m =>
      m &&
      typeof m.content === "string" &&
      m.content.trim().length > 0 &&
      (m.role === "user" || m.role === "assistant")
    );

    // Add new user message
    history.push({ role: "user", content: userPrompt });

    // Keep last 10 messages only
    if (history.length > 10) history = history.slice(-10);

    // Save cleaned memory
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
          model: "groq/compound-mini", // your model
          messages,
          max_tokens: 190,
          temperature: 0.7
        })
      });

      const data = await response.json();

      // If Groq returns an error, show it
      if (data.error) {
        console.error("Groq API Error:", data.error);
        return interaction.editReply(`Groq Error: ${data.error.message}`);
      }

      const reply = data?.choices?.[0]?.message?.content?.trim();

      // If Groq gave a real reply, store it
      if (reply) {
        history.push({ role: "assistant", content: reply });
        userMemory.set(user.id, history);
        return interaction.editReply(reply);
      }

      // If Groq returned nothing, DO NOT store fallback
      return interaction.editReply("I couldn't generate a response.");

    } catch (err) {
      console.error("Fetch error:", err);
      return interaction.editReply("ASTRYX had a connection issue.");
    }
  }
};
