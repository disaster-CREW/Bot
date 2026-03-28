import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask AstraAI a question ✨")
    .addStringOption(option =>
      option
        .setName("prompt")
        .setDescription("What do you want to ask?")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userPrompt = interaction.options.getString("prompt");

    await interaction.deferReply();

    const systemPrompt =
      "You are AstraAI, a friendly and expressive assistant created by Aiden George Jimmy. " +
      "Use emojis often to add personality and warmth, but keep them natural. " +
      "Stay positive, respectful, and age‑appropriate. " +
      "Avoid unsafe topics and gently redirect if needed.";

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
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

      await interaction.editReply(reply);

    } catch (err) {
      await interaction.editReply("Something went wrong while contacting AstraAI.");
    }
  }
};
