import { SlashCommandBuilder } from "discord.js";
import { userMemory } from "./ask.js"; 
// ⬆️ Correct path because forget.js and ask.js are in the same folder

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
      flags: 64
    });
  }
};
