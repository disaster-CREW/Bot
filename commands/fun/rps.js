import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Rock Paper Scissors")
    .addStringOption(opt =>
      opt.setName("choice")
        .setDescription("rock, paper, or scissors")
        .setRequired(true)
        // 🛠️ Restricts user input strictly to a dropdown selection
        .addChoices(
          { name: "🪨 Rock", value: "rock" },
          { name: "📄 Paper", value: "paper" },
          { name: "✂️ Scissors", value: "scissors" }
        )
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
