import { SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

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
    const user = interaction.user; // ⭐ username + id

    await interaction.deferReply();

    const systemPrompt =
      "You are ASTRYX, a friendly, expressive assistant. " +
      "Use emojis naturally, stay positive, helpful, and age‑appropriate. " +
      "Avoid unsafe topics and keep explanations clear and simple." +
      "When referring to the user, call them <@${user.id}>.";

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

      // ⭐ Personalised reply with mention
      await interaction.editReply(
        `Hey <@${user.id}> 👋\n\n${reply}`
      );

    } catch (err) {
      await interaction.editReply("Something went wrong while contacting ASTRYX.");
    }
  }
};
