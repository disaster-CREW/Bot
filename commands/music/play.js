import { SlashCommandBuilder } from "discord.js";
import { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus 
} from "@discordjs/voice";
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

    try {
      let url = query;

      // If it's not a URL, search YouTube
      if (!query.startsWith("http")) {
        const results = await play.search(query, { limit: 1 });
        if (!results.length) {
          return interaction.editReply("❌ No results found.");
        }
        url = results[0].url;
      }

      // Get stream
      const stream = await play.stream(url, { discordPlayerCompatibility: true });

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

      player.on(AudioPlayerStatus.Playing, () => {
        console.log("Audio is playing");
      });

      player.on("error", error => {
        console.error("Audio player error:", error);
      });

      interaction.editReply(`▶️ Now playing: **${url}**`);
    } catch (err) {
      console.error("Play command error:", err);
      interaction.editReply("❌ Something went wrong while trying to play that.");
    }
  }
};
