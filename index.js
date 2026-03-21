import express from "express";
import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits, REST, Routes } from "discord.js";

// ---------------------------
// UPTIME WEB SERVER
// ---------------------------
const app = express();
app.get("/", (req, res) => res.send("Bot is alive"));
app.listen(3000, () => console.log("Uptime server running"));

// ---------------------------
// DISCORD CLIENT
// ---------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ---------------------------
// COMMAND LOADER
// ---------------------------
const commands = [];
client.commands = new Map();

const commandsPath = path.join(process.cwd(), "commands");
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = (await import(`file://${filePath}`)).default;

    if (command?.data && command?.execute) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name}`);
    } else {
      console.log(`❌ Invalid command file: ${file}`);
    }
  }
}

// ---------------------------
// REGISTER SLASH COMMANDS
// ---------------------------
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log("Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
});

// ---------------------------
// COMMAND HANDLER
// ---------------------------
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.reply({
      content: "There was an error executing this command.",
      ephemeral: true
    });
  }
});

// ---------------------------
// LOGIN
// ---------------------------
client.login(process.env.TOKEN);
