import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from './commands/command';
import * as dotenv from 'dotenv';
dotenv.config()

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("Error: Required environment variables are not set.");
  process.exit(1);
}

// Read command files
const commandFiles = readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js') && file !== 'command.js');

const commands = [];

// Loop over each command file
for (const file of commandFiles) {
  const command: Command = require(`./commands/${file}`).default;
  if (command.data) {
    commands.push(command.data.toJSON());
  } else {
    console.error(`Error: command ${file} is missing a 'data' property.`);
  }
}

const rest = new REST().setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Register guild-specific commands
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();