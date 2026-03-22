import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  category: "misc",

  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all bot commands"),

  async execute(interaction) {
    const client = interaction.client;

    const categories = {};

    // Group commands by category
    client.commands.forEach(cmd => {
      const cat = cmd.category || "misc";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    });

    const embed = new EmbedBuilder()
      .setTitle("ASTRYX Help Menu")
      .setDescription("Here are all commands (some might not be usable depending on your permissions)")
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
