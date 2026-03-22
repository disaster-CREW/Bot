import { SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and leave the voice channel'),

    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guild.id);

        if (!connection) {
            return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
        }

        connection.destroy();
        interaction.reply('🛑 Music stopped.');
    }
};
