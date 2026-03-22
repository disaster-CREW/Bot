import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export default {
  category: "misc",

  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all available commands"),

  async execute(interaction) {
    const client = interaction.client;

    // Organize commands by category
    const categories = {};

    client.commands.forEach(cmd => {
      const cat = cmd.category || "misc";

      // Hide mod commands from non-staff
      if (cat === "mod") {
        const member = interaction.member;
        const guildId = interaction.guild?.id;

        // If user isn't staff, skip mod commands
        if (!client.hasStaffPermission(member, guildId)) return;
      }

      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    });

    // Build the embed
    const embed = new EmbedBuilder()
      .setTitle("ASTRYX Help Menu")
      .setDescription("Here are all available commands you can use")
      .setColor("#5865F2");

    for (const [category, cmds] of Object.entries(categories)) {
      embed.addFields({
        name: `📂 ${category.toUpperCase()}`,
        value: cmds
          .map(c => `**/${c.data.name}** — ${c.data.description}`)
          .join("\n"),
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
