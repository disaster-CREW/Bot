import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Challenge someone to a Tic Tac Toe duel")
    .setDMPermission(false)
    .addUserOption(opt =>
      opt.setName("opponent")
        .setDescription("Who do you want to duel?")
        .setRequired(true)
    ),

  async execute(interaction) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser("opponent");

    if (opponent.bot) {
      return interaction.reply("You can't duel a bot.");
    }

    if (opponent.id === challenger.id) {
      return interaction.reply("You can't duel yourself.");
    }

    // Initial empty board
    let board = [" ", " ", " ", " ", " ", " ", " ", " ", " "];

    // Players
    const players = {
      X: challenger,
      O: opponent
    };

    let current = "X";

    // Create buttons for the board
    const getBoardButtons = () => {
      const rows = [];
      for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 3; j++) {
          const index = i * 3 + j;
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(index.toString())
              .setLabel(board[index])
              .setStyle(
                board[index] === " "
                  ? ButtonStyle.Secondary
                  : board[index] === "X"
                  ? ButtonStyle.Danger
                  : ButtonStyle.Primary
              )
              .setDisabled(board[index] !== " ")
          );
        }
        rows.push(row);
      }
      return rows;
    };

    // Win check function
    const checkWin = () => {
      const wins = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
      ];

      return wins.some(([a, b, c]) =>
        board[a] !== " " &&
        board[a] === board[b] &&
        board[a] === board[c]
      );
    };

    // Check draw
    const checkDraw = () => board.every(cell => cell !== " ");

    // Send initial board
    const message = await interaction.reply({
      content: `🎮 **Tic Tac Toe Duel!**  
❌ ${challenger} vs ⭕ ${opponent}  
**${players[current]} goes first!**`,
      components: getBoardButtons()
    });

    // Create collector
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000 // 2 minutes
    });

    collector.on("collect", async btn => {
      // Only allow the correct player to move
      if (btn.user.id !== players[current].id) {
        return btn.reply({ content: "It's not your turn.", ephemeral: true });
      }

      const index = parseInt(btn.customId);

      // If tile is taken
      if (board[index] !== " ") {
        return btn.reply({ content: "That spot is already taken.", ephemeral: true });
      }

      // Place mark
      board[index] = current;

      // Check win
      if (checkWin()) {
        collector.stop("win");
        return btn.update({
          content: `🎉 **${players[current]} wins the duel!**`,
          components: getBoardButtons()
        });
      }

      // Check draw
      if (checkDraw()) {
        collector.stop("draw");
        return btn.update({
          content: `🤝 **It's a draw!**`,
          components: getBoardButtons()
        });
      }

      // Switch turn
      current = current === "X" ? "O" : "X";

      // Update board
      await btn.update({
        content: `🎮 **Tic Tac Toe Duel!**  
❌ ${challenger} vs ⭕ ${opponent}  
**It's ${players[current]}'s turn!**`,
        components: getBoardButtons()
      });
    });

    collector.on("end", async (_, reason) => {
      if (reason === "win" || reason === "draw") return;

      // Time ran out
      await message.edit({
        content: "⏳ Duel ended due to inactivity.",
        components: getBoardButtons().map(row =>
          new ActionRowBuilder().addComponents(
            row.components.map(btn => ButtonBuilder.from(btn).setDisabled(true))
          )
        )
      });
    });
  }
};
