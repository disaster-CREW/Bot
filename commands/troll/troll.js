import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("troll")
    .setDescription("Send a silly troll message")
    .addStringOption(opt =>
      opt.setName("message").setDescription("Message to send").setRequired(true)
    ),
  async execute(interaction) {
    const msg = interaction.options.getString("message");
    await interaction.reply(`😈 **Troll message:** ${msg}`);
  }
};
