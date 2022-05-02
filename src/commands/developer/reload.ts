import glob from 'glob';
import { promisify } from 'util';
import { Command } from '../../structures/Command';
import { commandType } from '../../typings/Command';
const globPromise = promisify(glob);

export default new Command({
	name: 'reload',
	description: 'Reloads the bot or the modules.',
	directory: 'developer',
	aliases: ['refresh'],
	cooldown: 2000,

	excute: async ({ client, message, args }) => {
		enum types {
			'BOT' = 1,
			'CLIENT' = 1,
			'APPLICATION' = 1,
			'COMMANDS' = 2,
			'INTERACTIONS' = 2,
		}

		let reloadType = args[0]?.toUpperCase();

		switch (types[reloadType]) {
			case undefined:
				message.reply({
					embeds: [
						client.embeds.attention(
							'Choose between `client` or `commands` to refresh.'
						),
					],
				});
				break;
			case 1:
				const clientMsg = await message.channel.send({
					embeds: [
						client.util.embed({
							description: 'Refreshing the client...',
							color: client.colors.wait,
						}),
					],
				});
				const clientFirstTime: number = Date.now();
				let clientSecondTime: number;

				client.destroy();
				client
					.login(process.env.DISCORD_TOKEN)
					.then(() => (clientSecondTime = Date.now()))
					.then(() => {
						clientMsg?.edit({
							embeds: [
								client.util.embed({
									description: `The client was refreshed in \`${
										clientSecondTime - clientFirstTime
									}ms\`.`,
									color: client.colors.success,
								}),
							],
						});
					});
				break;

			case 2:
				const modulesMsg = await message.channel.send({
					embeds: [
						client.util.embed({
							description: 'Refreshing the modules...',
							color: client.colors.wait,
						}),
					],
				});
				const modulesFirstTime: number = Date.now();
				let modulesSecondTime: number;

				// Commands
				client.commands.sweep(() => true);
				const commandFiles = await globPromise(
					`${process.cwd()}/src/commands/**/*{.ts,.js}`
				);
				commandFiles.forEach(async (filePaths) => {
					const command: commandType = await client.importFiles(filePaths);
					if (!command.name) return;

					client.commands.set(command.name, command);
				});
				await message
					.fetch()
					.then(() => (modulesSecondTime = Date.now()))
					.then(() => {
						modulesMsg?.edit({
							embeds: [
								client.util.embed({
									description: `Commands were refreshed in \`${
										modulesSecondTime - modulesFirstTime
									}ms\`.`,
									color: client.colors.success,
								}),
							],
						});
					});
				break;
		}
	},
});
