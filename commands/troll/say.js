import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make the bot say something.")
    .addStringOption(option =>
      option.setName("message")
        .setDescription("What should the bot say?")
        .setRequired(true)
    ),

  async execute(interaction) {
    const msg = interaction.options.getString("message");

    // Bot sends the message publicly
    await interaction.channel.send(msg);

    // Private confirmation to the user
    await interaction.reply({
      content: "Message sent.",
      flags: MessageFlags.Ephemeral
    });
  }
};
