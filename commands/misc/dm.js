import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("dm")
    .setDescription("Send a private message to a user")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User to DM").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("message").setDescription("Message to send").setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const message = interaction.options.getString("message");

    try {
      await user.send(message);
      await interaction.reply({ content: "DM sent.", ephemeral: true });
    } catch {
      await interaction.reply({ content: "I couldn't DM that user.", ephemeral: true });
    }
  }
};
