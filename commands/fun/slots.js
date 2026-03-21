import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Spin the slot machine"),

  async execute(interaction) {
    const icons = ["🍒", "🍋", "🍇", "⭐", "💎"];
    const slot1 = icons[Math.floor(Math.random() * icons.length)];
    const slot2 = icons[Math.floor(Math.random() * icons.length)];
    const slot3 = icons[Math.floor(Math.random() * icons.length)];

    const win = slot1 === slot2 && slot2 === slot3;

    interaction.reply(
      `🎰 **SLOTS** 🎰\n${slot1} | ${slot2} | ${slot3}\n\n${
        win ? "🎉 You win!" : "😢 You lose!"
      }`
    );
  }
};
