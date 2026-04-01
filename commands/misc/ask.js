import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

// Simple in‑memory memory store
export const userMemory = new Map();   // <-- FIXED (now exported)

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

const systemPrompt = `
You are <@${interaction.client.user.id}>, a friendly Discord bot who talks in smooth modern slang.
Your tone is casual, confident, expressive, and mature — using slang like “bro”, “lmao”, “nah”, “fr”, “lowkey”, “highkey”, “no shot”, etc.
Use emojis naturally. Stay positive, helpful, and safe. Keep explanations simple. Always refer to the user as <@${user.id}>. Do NOT apologize unless the user directly asks you to.`;


    // --- MEMORY SYSTEM ---
    let history = userMemory.get(user.id) || [];

    // Add the new user message to memory
    history.push({ role: "user", content: userPrompt });

    // Limit memory to last 10 messages
    if (history.length > 10) history = history.slice(-10);

    // Save updated memory
    userMemory.set(user.id, history);

    // Build messages for the AI
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

      let reply = "I couldn't generate a response.";

      if (data?.choices?.[0]?.message?.content) {
        reply = data.choices[0].message.content.trim();
      }

      // Add assistant reply to memory
      history.push({ role: "assistant", content: reply });
      userMemory.set(user.id, history);

      await interaction.editReply(reply);

    } catch (err) {
      await interaction.editReply("Something went wrong while contacting ASTRYX.");
    }
  }
};
