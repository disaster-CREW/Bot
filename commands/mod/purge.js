import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages in bulk")
    .setDMPermission(false)
    .addIntegerOption(opt =>
      opt.setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: "Amount must be between 1 and 100.",
        flags: 64
      });
    }

    await interaction.channel.bulkDelete(amount, true);

    // Private confirmation message
    await interaction.reply({
      content: `🧹 Deleted **${amount}** messages.`,
      flags: 64
    });
  }
};
