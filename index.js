import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  MessageFlags
} from "discord.js";

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
// PERMISSION CHECK
// ---------------------------
function hasStaffPermission(member, guildId) {
  if (member.id === member.guild.ownerId) return true;
  if (member.permissions.has("Administrator")) return true;

  const file = path.join(__dirname, "guildConfig.json");
  if (!fs.existsSync(file)) return false;

  const config = JSON.parse(fs.readFileSync(file));
  const guildConfig = config[guildId];
  if (!guildConfig) return false;

  const adminRole = guildConfig.adminRole;
  const modRole = guildConfig.modRole;

  return (
    member.roles.cache.has(adminRole) ||
    member.roles.cache.has(modRole)
  );
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

app.listen(3000, () =>
  console.log("🌐 Website + Bot server running on port 3000")
);

// ---------------------------
// DISCORD CLIENT
// ---------------------------
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
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
        },
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 1,
              label: "Done",
              custom_id: "setup_done"
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
  const commandFiles = fs
    .readdirSync(folderPath)
    .filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = (await import(`file://${filePath}`)).default;

    if (command?.data && command?.execute) {
      command.category = folder;
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
      console.log(
        `✅ Loaded command: ${command.data.name} (Category: ${folder})`
      );
    } else {
      console.log(`❌ Invalid command file: ${file}`);
    }
  }
}

// ---------------------------
// REGISTER SLASH COMMANDS + STARTUP MESSAGE
// ---------------------------
client.once("ready", async () => {
  console.log(`
=========================================
        🎉🎉🥳 ASTRYX HAS BEEN BORN 🥳🎉🎉
=========================================
`);
}, 800);
  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands
    });

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

    if (command.category === "mod") {
      if (!interaction.guild) {
        return interaction.reply({
          content: "Moderation commands cannot be used in DMs.",
          ephemeral: true
        });
      }

      if (!hasStaffPermission(interaction.member, interaction.guild.id)) {
        return interaction.reply({
          content: "You do not have permission to use this command.",
          ephemeral: true
        });
      }
    }

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

  if (interaction.isStringSelectMenu()) {
    const guildId = interaction.guild.id;

    if (interaction.customId === "setup_admin_role") {
      const adminRole = interaction.values[0];
      saveGuildConfig(guildId, { adminRole });

      await interaction.reply({
        content: `Admin role set to <@&${adminRole}>`,
        ephemeral: true
      });
    }

    if (interaction.customId === "setup_mod_role") {
      const modRole = interaction.values[0];
      saveGuildConfig(guildId, { modRole });

      await interaction.reply({
        content: `Moderator role set to <@&${modRole}>`,
        ephemeral: true
      });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === "setup_done") {
      const guildId = interaction.guild.id;

      const file = path.join(__dirname, "guildConfig.json");
      const config = JSON.parse(fs.readFileSync(file));
      const guildConfig = config[guildId];

      if (!guildConfig?.adminRole || !guildConfig?.modRole) {
        return interaction.reply({
          content:
            "Please select both an Admin and Moderator role before finishing setup.",
          ephemeral: true
        });
      }

      await interaction.message.delete();

      await interaction.channel.send({
        embeds: [
          {
            title: "✅ Setup Complete",
            description: "ASTRYX is now fully configured and ready to use.",
            color: 0x00ff99,
            fields: [
              {
                name: "Admin Role",
                value: `<@&${guildConfig.adminRole}>`,
                inline: true
              },
              {
                name: "Moderator Role",
                value: `<@&${guildConfig.modRole}>`,
                inline: true
              }
            ],
            footer: {
              text: "ASTRYX • Setup System"
            }
          }
        ]
      });
    }
  }
});

// ---------------------------
// LOGIN
// ---------------------------
client.login(process.env.TOKEN);
