import { SlashCommandBuilder } from "discord.js";
import { userMemory } from "../../misc/ask.js"; 
// ^ This path is correct because this file will be inside commands/<category>/forget.js
//   and ask.js is inside commands/misc/ask.js

export default {
  data: new SlashCommandBuilder()
    .setName("forget")
    .setDescription("Clear ASTRYX's memory of your past conversations 🧹"),

  async execute(interaction) {
    const user = interaction.user;

    // Delete this user's memory
    userMemory.delete(user.id);

    await interaction.reply({
      content: `🧹 ASTRYX has forgotten everything we talked about, <@${user.id}>.  
You’re starting fresh now.`,
      ephemeral: true
    });
  }
};
