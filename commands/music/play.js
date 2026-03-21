import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube (audio system coming next)")
    .addStringOption(opt =>
      opt.setName("query")
        .setDescription("Song name or YouTube link")
        .setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString("query");

    await interaction.reply(
      `🎵 You asked me to play: **${query}**\n` +
      `Your bot is now ready for the YouTube audio engine once it's deployed.`
    );
  }
};
