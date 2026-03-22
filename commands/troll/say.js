import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  MessageFlags 
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make the bot say something.")

    // Choice: text or embed
    .addStringOption(option =>
      option
        .setName("type")
        .setDescription("Choose how the bot should send the message.")
        .setRequired(true)
        .addChoices(
          { name: "Text", value: "text" },
          { name: "Embed", value: "embed" }
        )
    )

    // Message (used for text OR embed description)
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("The message or embed description.")
        .setRequired(true)
    )

    // Optional embed title (only used if type = embed)
    .addStringOption(option =>
      option
        .setName("title")
        .setDescription("Embed title (only for embed mode).")
        .setRequired(false)
    ),

  async execute(interaction) {
    const type = interaction.options.getString("type");
    const message = interaction.options.getString("message");
    const title = interaction.options.getString("title");

    // TEXT MODE
    if (type === "text") {
      await interaction.channel.send(message);

      return interaction.reply({
        content: "Message sent.",
        flags: MessageFlags.Ephemeral
      });
    }

    // EMBED MODE
    if (type === "embed") {
      const embed = new EmbedBuilder()
        .setDescription(message)
        .setColor("Random");

      if (title) embed.setTitle(title);

      await interaction.channel.send({ embeds: [embed] });

      return interaction.reply({
        content: "Embed sent.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
