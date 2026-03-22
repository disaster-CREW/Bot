import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("inject")
    .setDescription("Injects something silly and harmless.")
    .addStringOption(option =>
      option
        .setName("what")
        .setDescription("What should the bot inject?")
        .setRequired(true)
    ),

  async execute(interaction) {
    const what = interaction.options.getString("what");

    // Step 1: Private loading message
    await interaction.reply({
      content: `Injecting **${what}**...`,
      flags: MessageFlags.Ephemeral
    });

    // Step 2: Fake progress bar
    const steps = [
      "Initializing syringe...",
      "Drawing substance...",
      "Calibrating dosage...",
      "Preparing injection site...",
      "Injecting...",
      "Finalizing..."
    ];

    for (const step of steps) {
      await new Promise(res => setTimeout(res, 800));
      await interaction.editReply({
        content: `${step}`
      });
    }

    // Step 3: Final public message
    await interaction.channel.send(`💉 **Injected happiness.**`);

    // Step 4: Private confirmation
    await interaction.editReply({
      content: `Injection complete.`
    });
  }
};
