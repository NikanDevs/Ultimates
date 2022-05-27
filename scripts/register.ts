import { REST } from '@discordjs/rest';
import { ApplicationCommandType, Routes } from 'discord-api-types/v9';
import { ApplicationCommandDataResolvable } from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { interactionType } from '../src/typings/Command';
import { enabledModules, guild as guildConfig, clientId } from '../src/json/config.json';
const globPromise = promisify(glob);
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN.toString());
const commands: ApplicationCommandDataResolvable[] = [];
const interactions: interactionType[] = [];

(async () => {
	const slashFiles = await globPromise(`${process.cwd()}/src/commands/**/*{.ts,.js}`);
	slashFiles
		.filter((file) => (!enabledModules.modmail ? !file.includes('modmail') : true))
		.forEach(async (filePaths) => {
			const command: interactionType = await importFile(filePaths);
			if (!command.interaction.name) return;
			if (
				(command.interaction.type as number) === ApplicationCommandType.User ||
				(command.interaction.type as number) === ApplicationCommandType.Message
			)
				command.interaction.description = null;

			interactions.push(command);
			commands.push(command.interaction);
		});

	setTimeout(async () => {
		await rest.put(Routes.applicationGuildCommands(clientId, guildConfig.id), {
			body: commands,
		});
		console.log('Registered Interactions!');
	}, 5000);
})();

async function importFile(file: string) {
	return (await import(file))?.default;
}

