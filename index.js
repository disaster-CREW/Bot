import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client, GatewayIntentBits, REST, Routes, MessageFlags } from "discord.js";

// ---------------------------
// FIX __dirname FOR ES MODULES
// ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// UPTIME WEB SERVER
// ---------------------------
const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(3000, () => console.log("🌐 Uptime server running on port 3000"));

// ---------------------------
// DISCORD CLIENT (NO MUSIC INTENTS)
// ---------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// ---------------------------
// COMMAND LOADER
// ---------------------------
client.commands = new Map();
const commands = [];

const commandsPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = (await import(`file://${filePath}`)).default;

    if (command?.data && command?.execute) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.log(`❌ Invalid command file: ${file}`);
    }
  }
}

// ---------------------------
// REGISTER SLASH COMMANDS
// ---------------------------
client.once("ready", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log("📌 Slash commands registered globally.");
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
});

// ---------------------------
// COMMAND + BUTTON HANDLER
// ---------------------------
client.on("interactionCreate", async interaction => {
  // Slash commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error("❌ Command error:", error);

      if (!interaction.replied) {
        interaction.reply({
          content: "There was an error executing this command.",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }

  // Button interactions (for Tic Tac Toe + future button games)
  if (interaction.isButton()) {
    for (const cmd of client.commands.values()) {
      if (typeof cmd.button === "function") {
        try {
          await cmd.button(interaction);
        } catch (error) {
          console.error("❌ Button error:", error);
        }
      }
    }
  }
});

// ---------------------------
// LOGIN
// ---------------------------
client.login(process.env.TOKEN);
