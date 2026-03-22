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
// SAVE GUILD CONFIG
// ---------------------------
function saveGuildConfig(guildId, data) {
  const file = path.join(__dirname, "guildConfig.json");
  let config = {};

  if (fs.existsSync(file)) {
    config = JSON.parse(fs.readFileSync(file));
  }

  config[guildId] = {
    ...config[guildId],
    ...data
  };

  fs.writeFileSync(file, JSON.stringify(config, null, 2));
}

// ---------------------------
// EXPRESS WEB SERVER
// ---------------------------
const app = express();

app.use(express.static(path.join(__dirname, "website")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "website", "index.html"));
});

app.get("/tos", (req, res) => {
  res.sendFile(path.join(__dirname, "website", "tos.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "website", "privacy.html"));
});

app.listen(3000, () => console.log("🌐 Website + Bot server running on port 3000"));

// ---------------------------
// DISCORD CLIENT
// ---------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// ---------------------------
// GUILD SETUP EVENT
// ---------------------------
client.on("guildCreate", async guild => {
  try {
    const channel = guild.channels.cache.find(
      c =>
        c.isTextBased() &&
        c.permissionsFor(guild.members.me).has("SendMessages")
    );

    if (!channel) return;

    await channel.send({
      content: `Thanks for adding **ASTRYX**! Let's get your server set up.`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: "setup_admin_role",
              placeholder: "Select an Admin Role",
              min_values: 1,
              max_values: 1,
              options: guild.roles.cache
                .filter(r => r.name !== "@everyone")
                .map(role => ({
                  label: role.name,
                  value: role.id
                }))
                .slice(0, 25)
            }
          ]
        },
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: "setup_mod_role",
              placeholder: "Select a Moderator Role",
              min_values: 1,
              max_values: 1,
              options: guild.roles.cache
                .filter(r => r.name !== "@everyone")
                .map(role => ({
                  label: role.name,
                  value: role.id
                }))
                .slice(0, 25)
            }
          ]
        }
      ]
    });

  } catch (err) {
    console.error("Setup message error:", err);
  }
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
// INTERACTION HANDLER
// ---------------------------
client.on("interactionCreate", async interaction => {
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

  // Setup dropdowns
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "setup_admin_role") {
      const adminRole = interaction.values[0];
      saveGuildConfig(interaction.guild.id, { adminRole });

      await interaction.reply({
        content: `Admin role set to <@&${adminRole}>`,
        ephemeral: true
      });
    }

    if (interaction.customId === "setup_mod_role") {
      const modRole = interaction.values[0];
      saveGuildConfig(interaction.guild.id, { modRole });

      await interaction.reply({
        content: `Moderator role set to <@&${modRole}>`,
        ephemeral: true
      });
    }
  }

  // Button handlers
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
