import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt =>
      opt.setName("user").setDescription("User to ban").setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.options.getMember("user");

    if (!member) {
      return interaction.reply({ content: "I can't find that member.", ephemeral: true });
    }

    try {
      await member.ban();
      await interaction.reply(`Banned ${member.user.tag}`);
    } catch {
      await interaction.reply({ content: "I couldn't ban that member.", ephemeral: true });
    }
  }
};
