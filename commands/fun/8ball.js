import { SlashCommandBuilder } from "discord.js";

const answers = [
  "Yes", "No", "Definitely", "Absolutely not",
  "Ask again later", "Probably", "Unlikely",
  "100% yes", "100% no", "I can't tell"
];

export default {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8ball a question")
    .addStringOption(opt =>
      opt.setName("question")
        .setDescription("Your question")
        .setRequired(true)
    ),

  async execute(interaction) {
    const answer = answers[Math.floor(Math.random() * answers.length)];
    interaction.reply(`🎱 **${answer}**`);
  }
};
