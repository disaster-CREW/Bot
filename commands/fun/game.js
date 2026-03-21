import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("game")
    .setDescription("Guess a number between 1 and 5"),
  async execute(interaction) {
    const target = Math.floor(Math.random() * 5) + 1;
    const guess = Math.floor(Math.random() * 5) + 1;

    await interaction.reply(
      `I picked **${target}** and you got **${guess}** — ` +
      (guess === target ? "you win 🎉" : "you lose 😈")
    );
  }
};
