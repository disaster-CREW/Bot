import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server")
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("User to kick")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason")
        .setDescription("Reason for kick")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        ephemeral: true
      });
    }

    await member.kick(reason);

    // Private confirmation message
    await interaction.reply({
      content: `🦵 Kicked **${user.tag}** — ${reason}`,
      flags: 64
    });
  }
};
