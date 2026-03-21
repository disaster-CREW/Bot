import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Rock Paper Scissors")
    .addStringOption(opt =>
      opt.setName("choice")
        .setDescription("rock, paper, or scissors")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getString("choice").toLowerCase();
    const choices = ["rock", "paper", "scissors"];
    const bot = choices[Math.floor(Math.random() * choices.length)];

    let result = "draw";
    if (
      (user === "rock" && bot === "scissors") ||
      (user === "paper" && bot === "rock") ||
      (user === "scissors" && bot === "paper")
    ) {
      result = "win";
    } else if (user !== bot) {
      result = "lose";
    }

    interaction.reply(`You chose **${user}**, I chose **${bot}** — You **${result}**`);
  }
};
