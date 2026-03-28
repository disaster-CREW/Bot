import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Privately warn a user in DMs.")
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("The user to warn")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for the warning")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const embed = new EmbedBuilder()
      .setTitle("⚠️ You Have Been Warned")
      .setDescription(`You received a moderation warning in **${interaction.guild.name}**.`)
      .addFields({ name: "Reason", value: reason })
      .setColor("Yellow")
      .setTimestamp();

    let dmSuccess = true;
    try {
      await target.send({ embeds: [embed] });
    } catch {
      dmSuccess = false;
    }

    // PRIVATE confirmation message
    await interaction.reply({
      content: dmSuccess
        ? `📨 Warning sent to **${target.tag}** in DMs.`
        : `⚠️ Could not DM **${target.tag}**. Their DMs may be closed.`,
      flags: 64
    });
  }
};
