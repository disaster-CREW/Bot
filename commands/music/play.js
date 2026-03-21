import { SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import play from "play-dl";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube")
    .addStringOption(opt =>
      opt.setName("query")
        .setDescription("Song name or YouTube link")
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString("query");
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: "You must be in a voice channel.",
        ephemeral: true
      });
    }

    await interaction.reply(`🎵 Searching for **${query}**...`);

    // Search or use URL
    const ytInfo = await play.search(query, { limit: 1 });
    if (!ytInfo.length) return interaction.editReply("❌ No results found.");

    const stream = await play.stream(ytInfo[0].url);

    // Join VC
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    // Create player
    const player = createAudioPlayer();
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(resource);
    connection.subscribe(player);

    interaction.editReply(`▶️ Now playing: **${ytInfo[0].title}**`);
  }
};
