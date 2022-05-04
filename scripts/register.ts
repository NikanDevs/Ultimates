import { REST } from '@discordjs/rest';
import { ApplicationCommandType, Routes } from 'discord-api-types/v9';
import { ApplicationCommandDataResolvable } from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { commandType } from '../src/typings/Command';
import { enabledModules, guildId, clientId } from '../src/json/config.json';
const globPromise = promisify(glob);
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN.toString());
const commands: ApplicationCommandDataResolvable[] = [];
const interactions: commandType[] = [];

(async () => {
	const slashFiles = await globPromise(`${process.cwd()}/src/commands/**/*{.ts,.js}`);
	slashFiles
		.filter((file) => !file.includes('developer'))
		.filter((file) => (!enabledModules.modmail ? !file.includes('modmail') : true))
		.forEach(async (filePaths) => {
			const command: commandType = await importFile(filePaths);
			if (!command.name) return;
			if (
				(command.type as number) === ApplicationCommandType.User ||
				(command.type as number) === ApplicationCommandType.Message
			)
				command.description = null;

			interactions.push(command);
			commands.push(command);
		});

	setTimeout(async () => {
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: commands,
		});
		console.log('Registered Interactions!');
	}, 5000);
})();

async function importFile(file: string) {
	return (await import(file))?.default;
}

