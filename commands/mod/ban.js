import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server")
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("User to ban")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason")
        .setDescription("Reason for ban")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    await interaction.guild.members.ban(user.id, { reason });

    // PRIVATE message only visible to the person who ran the command
    await interaction.reply({
      content: `🔨 Banned **${user.tag}** — ${reason}`,
      ephemeral: true
    });
  }
};
