import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("reactroles")
    .setDescription("Create a reaction role message with 2 roles")
    .addRoleOption(opt =>
      opt.setName("role1").setDescription("First role").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("emoji1").setDescription("Emoji for role1").setRequired(true)
    )
    .addRoleOption(opt =>
      opt.setName("role2").setDescription("Second role").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("emoji2").setDescription("Emoji for role2").setRequired(true)
    ),

  async execute(interaction) {
    const role1 = interaction.options.getRole("role1");
    const emoji1 = interaction.options.getString("emoji1");

    const role2 = interaction.options.getRole("role2");
    const emoji2 = interaction.options.getString("emoji2");

    // Send the message
    const msg = await interaction.reply({
      content: "Choose your roles:",
      fetchReply: true
    });

    // Add reactions
    await msg.react(emoji1);
    await msg.react(emoji2);

    // Save everything automatically
    const data = {
      messageId: msg.id,
      channelId: msg.channel.id,
      guildId: msg.guild.id,
      role1: role1.id,
      emoji1: emoji1,
      role2: role2.id,
      emoji2: emoji2
    };

    fs.writeFileSync("./reactroles.json", JSON.stringify(data, null, 2));

    console.log("Reaction roles saved:", data);
  }
};
