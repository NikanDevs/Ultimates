import { ButtonStyle, ComponentType, TextChannel, version } from 'discord.js';
import { Command } from '../../structures/Command';
import { arch, freemem, hostname, platform, totalmem, type, cpus } from 'os';
import { models, connection } from 'mongoose';
import cpuUsage from '../../functions/cpu';

export default new Command({
	name: 'stats',
	description: 'Shows information about the bot.',
	directory: 'developer',
	aliases: ['botinfo', 'botstats'],
	cooldown: 10000,

	excute: async ({ client, message }) => {
		await (message.channel as TextChannel).sendTyping();

		// MongoDB entries
		const values = Object.values(models);
		const totalData = await values.reduce(async (accumulator, model) => {
			const countDocument = await model.countDocuments();
			return (await accumulator) + countDocument;
		}, Promise.resolve(0));

		// Stats Texts
		const statsText = {
			ping: `• \`${Date.now() - message.createdTimestamp}ms\``,
			lastRestart: `<t:${~~(Date.now() / 1000 - client.uptime / 1000).toFixed(0)}:R>`,
			commandSize: `• \`${client.commands.size} commands\``,
			databaseState: `• \`${switchTo(connection.readyState)}\``,
			cpuUsage: `• \`${await cpuUsage.usage()}%\``,
			memoryUsage: `• \`${Math.floor(100 - (+freemem() / +totalmem()) * 100)}%\``,
			nodeVersion: `• \`${process.version}\``,
			discordjsVersion: `• \`v${version}\``,
		};

		// Emoji
		const statsEmoji = {
			ping: '<:ping:894097855759912970>',
			lastRestart: '🕐',
			memory: '<:memory:894097854484860939>',
			database: '<:database:915823830423982140>',
			cmd: '<:command:915820101947781141>',
			slashCmd: '<:slashcommands:897085046710763550>',
			cpu: '<:cpu:894097794405646346>',
			node: '<:node:894097855269208085>',
			discordjs: '<:discordjs:915821441843343381>',
		};

		const statsEmbed = client.util
			.embed()
			.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
			.setColor(client.colors.ultimates)
			.addFields(
				{
					name: `${statsEmoji.discordjs} Discord.js`,
					value: statsText.discordjsVersion,
					inline: true,
				},
				{
					name: `${statsEmoji.lastRestart} Node.js`,
					value: statsText.nodeVersion,
					inline: true,
				},
				{
					name: `${statsEmoji.lastRestart} Last Restart`,
					value: statsText.lastRestart,
					inline: true,
				},
				{
					name: `${statsEmoji.database} Database`,
					value: statsText.databaseState,
					inline: true,
				},
				{
					name: `${statsEmoji.cmd} Commands`,
					value: statsText.commandSize,
					inline: true,
				},
				{ name: `${statsEmoji.ping} Latency`, value: statsText.ping, inline: true },
				{ name: `${statsEmoji.cpu} Cpu`, value: statsText.cpuUsage, inline: true },
				{
					name: `${statsEmoji.memory} Memory`,
					value: statsText.memoryUsage,
					inline: true,
				}
			);

		const moreStatsRow = client.util
			.actionRow()
			.addComponents(
				client.util
					.button()
					.setLabel('More Stats')
					.setStyle(ButtonStyle['Secondary'])
					.setCustomId('stats')
			);

		let msg = await message.reply({
			embeds: [statsEmbed],
			components: [moreStatsRow],
		});

		const collector = msg.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30000,
			filter: (m) => m.customId === 'stats',
		});

		collector.on('collect', async (collected) => {
			if (collected.user.id !== message.author.id)
				return collected.reply(client.cc.cannotInteract);

			const moreStatsEmbed = client.util
				.embed()
				.setAuthor({
					name: client.user.username,
					iconURL: client.user.displayAvatarURL(),
				})
				.setColor(client.colors.ultimates)
				.addFields(
					{
						name: `${statsEmoji.node} Operating System`,
						value: [
							`• **Host Name:** ${client.util.capitalize(hostname())}`,
							`• **Platform:** ${client.util.capitalize(platform())}`,
							`• **Type:** ${type()}`,
							`• **Architecture:** ${arch()}`,
						].join('\n'),
					},
					{
						name: `${statsEmoji.cpu} Cpu`,
						value: [
							`• **Model:** ${cpus()[0].model}`,
							`• **Core Count:** ${cpus().length}`,
							`• **Usage:** ${~~(await cpuUsage.usage())}%`,
							`• **Free:** ${~~(100 - +(await cpuUsage.usage()))}%`,
						].join('\n'),
					},
					{
						name: `${statsEmoji.database} Database`,
						value: [
							`• **Name:** [MongoDB](https://www.mongodb.com/)`,
							`• **Status:** ${switchTo(connection.readyState)}`,
							`• **Total Data:** ${totalData}`,
						].join('\n'),
					},
					{
						name: `${statsEmoji.memory} Memory`,
						value: [
							`• **Total Memory:** ${bytesConvertFunction(totalmem())}`, // I'm a math god ;)
							`• **Used Memory:** ${bytesConvertFunction(
								totalmem() - freemem()
							)} \`|\` ${Math.ceil(100 - (+freemem() / +totalmem()) * 100)}%`,
							`• **Free Memory:** ${bytesConvertFunction(
								freemem()
							)} \`|\` ${Math.ceil((+freemem() / +totalmem()) * 100)}%`,
						].join('\n'),
					},
					{
						name: `${client.cc.success} Credits`,
						value: [
							`• **Emojis:** [discord.gg/9AtkECMX2P](https://discord.gg/9AtkECMX2P)`,
						].join('\n'),
					}
				);

			await collected.reply({
				embeds: [moreStatsEmbed],
				content: null,
				ephemeral: true,
			});
		});

		collector.on('end', async () => {
			msg.edit({ components: [] });
		});

		// Mongoose connection status
		function switchTo(val: number) {
			let status = '';
			switch (val) {
				case 0:
					status = `Disconnected`;
					break;
				case 1:
					status = `Connected`;
					break;
				case 2:
					status = `Connecting`;
					break;
				case 3:
					status = `Disconnecting`;
					break;
			}
			return status;
		}
	},
});

function bytesConvertFunction(bytes: number) {
	if (bytes === 0) return '0 Bytes';
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}
