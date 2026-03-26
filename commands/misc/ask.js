export default {
  data: {
    name: "ask",
    description: "Ask the AI a question",
    options: [
      {
        name: "question",
        description: "What do you want to ask?",
        type: 3,
        required: true
      }
    ]
  },

  async execute(interaction) {
    const question = interaction.options.getString("question");

    await interaction.deferReply(); // PUBLIC reply

    // --- AI LOGIC (safe, high-level example) ---
    const response = `Here's a helpful answer to your question: **${question}**`;

    await interaction.editReply(response);
  }
};
