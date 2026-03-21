import { SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Make the bot join your voice channel"),

  async execute(interaction) {
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: "You need to be in a voice channel first.",
        ephemeral: true
      });
    }

    joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator
    });

    await interaction.reply(`Joined **${channel.name}**`);
  }
};
