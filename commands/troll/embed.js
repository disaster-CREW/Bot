import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("sayembed")
    .setDescription("Make the bot send an embed.")
    .addStringOption(option =>
      option.setName("title")
        .setDescription("Embed title")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("description")
        .setDescription("Embed description")
        .setRequired(true)
    ),

  async execute(interaction) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor("Random");

    // Bot sends the embed publicly
    await interaction.channel.send({ embeds: [embed] });

    // Private confirmation
    await interaction.reply({
      content: "Embed sent.",
      flags: MessageFlags.Ephemeral
    });
  }
};
