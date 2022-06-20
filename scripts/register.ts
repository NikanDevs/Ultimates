import { REST } from '@discordjs/rest';
import { ApplicationCommandType, Routes } from 'discord-api-types/v9';
import { interactions } from '../src/interactions';
import { logger } from '../src/logger';
require('dotenv').config();

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN.toString());

(async () => {
	const commands = Object.values(interactions).map((interaction) => {
		if (
			(interaction.type as number) === ApplicationCommandType.User ||
			(interaction.type as number) === ApplicationCommandType.Message
		)
			delete interaction.description;

		return interaction;
	});

	await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
		body: commands,
	});
	logger.info('Register interactions', { showDate: false });
})();

