import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("fakeinject")
    .setDescription("Shows a silly fake injection process.")
    .addStringOption(option =>
      option
        .setName("what")
        .setDescription("What should be injected?")
        .setRequired(true)
    ),

  async execute(interaction) {
    const what = interaction.options.getString("what");

    // Step 1: Public starting message
    await interaction.reply(`💉 Starting injection of **${what}**...`);

    // Step 2: Fake progress steps
    const steps = [
      "Preparing syringe...",
      "Drawing substance...",
      "Calibrating dosage...",
      "Injecting...",
      "Finalizing..."
    ];

    for (const step of steps) {
      await new Promise(res => setTimeout(res, 900));
      await interaction.editReply(step);
    }

    // Step 3: Final public message using the user's input
    await interaction.editReply(`💉 **Injected ${what}.**`);
  }
};
