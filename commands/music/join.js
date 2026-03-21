import { SlashCommandBuilder } from "discord.js";

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

    await interaction.reply(`Joining **${channel.name}**… (audio system coming next)`);
  }
};
