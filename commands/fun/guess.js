import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("guess")
    .setDescription("Guess a number between 1 and 10")
    .addIntegerOption(opt =>
      opt.setName("number")
        .setDescription("Your guess")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guess = interaction.options.getInteger("number");
    const answer = Math.floor(Math.random() * 10) + 1;

    if (guess === answer) {
      interaction.reply(`🎉 Correct! The number was **${answer}**`);
    } else {
      interaction.reply(`❌ Wrong! The number was **${answer}**`);
    }
  }
};
