import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  category: "misc",

  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all available commands"),

  async execute(interaction) {
    const client = interaction.client;

    const categories = {};

    client.commands.forEach(cmd => {
      const cat = cmd.category || "misc";

      // Hide mod commands from non-staff using Discord perms only
      if (cat === "mod") {
        if (!interaction.member.permissions.has("ManageGuild")) return;
      }

      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    });

    const embed = new EmbedBuilder()
      .setTitle("ASTRYX Help Menu")
      .setDescription("Here are all available commands you can use")
      .setColor("#5865F2");

    for (const [category, cmds] of Object.entries(categories)) {
      embed.addFields({
        name: `📂 ${category.toUpperCase()}`,
        value: cmds.length
          ? cmds
              .map(c => `**/${c.data.name}** — ${c.data.description}`)
              .join("\n")
          : "No commands available.",
        inline: false
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
