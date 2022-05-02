import { ActivityType, Client, Embed, TextChannel } from 'discord.js';
import { connect } from 'mongoose';
import { logsModel } from '../src/models/logs';
import { modmailModel } from '../src/models/modmail';
require('dotenv').config();

export const client = new Client({
	intents: 32767,
	presence: {
		status: 'idle',
		activities: [
			{
				name: 'Starting up slowly...',
				type: ActivityType.Streaming,
				url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
			},
		],
	},
});

client.login(process.env.TOKEN);

client.on('ready', async (client) => {
	console.log('[SETUP]: Logged in to ' + client.user.tag);
	const mongoDBConnection = process.env.MONGODB;
	if (!mongoDBConnection) {
		console.log('Missing mongoDB connection string at .env (mongoose)');
		process.exit();
	}
	await connect(mongoDBConnection)
		.then(() => console.log('Connected to MongoDB!'))
		.catch((err) => {
			'MongoDB error: ' + err;
			process.exit();
		});
	console.log('[SETUP]: Use "SETUP START" in a channel to start the setup.');
	console.log(
		[
			'Make sure to use this format in the order.',
			'Please mention (#channel) the channels you want to set and replace them in the []s',
			'After that, type a "|" and type your emojis in the order.',
		].join('\n') +
			`\n\n\nSETUP START [errors] - [mod-logs] - [message-logs] - [warn-remove-logs] - [modmail-logs] - [join-leaves-logs] - | [sucess] | [error] | [attention]\n\n`
	);
});

client.on('messageCreate', async (message) => {
	let alreadySetUp = false;

	if (
		!message.content ||
		message.author.bot ||
		alreadySetUp ||
		!message.member.permissions.has('Administrator')
	)
		return;

	const args = message.content.replace('SETUP START', '');
	if (message.content.startsWith('SETUP START')) {
		const dataArray: string[] = [];
		if (!message.guild.me.permissions.has('ManageWebhooks')) {
			console.log('I need manage webhook permissions to do this.');
			process.exit();
		}

		if (!message.mentions || !message.mentions.channels.size) {
			console.log(
				[
					"We've noticed that you are missing some arguments in your command.",
					'Make sure to use this format in the order.',
					'Please mention (#channel) the channels you want to set and replace them in the []s',
					'After that, type a "|" and type your emojis in the order.',
				].join('\n') +
					`\n\n\nSETUP START [errors] - [mod-logs] - [message-logs] - [warn-remove-logs] - [modmail-logs] - [join-leaves-logs] - | [sucess] | [error] | [attention]`
			);
			process.exit();
		}

		const msg = await message.channel.send({
			embeds: [{ description: 'Please wait...' }],
		});

		await (
			client.channels.cache.get(args.split('-')[0].replace(/[<#!>, ]/g, '')) as TextChannel
		)
			.createWebhook(`${client.user.username} Error Handler`, {
				avatar: client.user.displayAvatarURL(),
				reason: `${client.user.username} setup`,
			})
			.then((webhook) => dataArray.push(webhook.url));

		await (
			client.channels.cache.get(args.split('-')[1].replace(/[<#!>, ]/g, '')) as TextChannel
		)
			.createWebhook(`Mod-Logs`, {
				avatar: client.user.displayAvatarURL(),
				reason: `${client.user.username} setup`,
			})
			.then((webhook) => dataArray.push(webhook.url));

		await (
			client.channels.cache.get(args.split('-')[2].replace(/[<#!>, ]/g, '')) as TextChannel
		)
			.createWebhook(`Message-Logs`, {
				avatar: client.user.displayAvatarURL(),
				reason: `${client.user.username} setup`,
			})
			.then((webhook) => dataArray.push(webhook.url));

		await (
			client.channels.cache.get(args.split('-')[3].replace(/[<#!>, ]/g, '')) as TextChannel
		)
			.createWebhook(`Punishment-Remove-Logs`, {
				avatar: client.user.displayAvatarURL(),
				reason: `${client.user.username} setup`,
			})
			.then((webhook) => dataArray.push(webhook.url));

		await (
			client.channels.cache.get(args.split('-')[4].replace(/[<#!>, ]/g, '')) as TextChannel
		)
			.createWebhook(`Modmail-Logs`, {
				avatar: client.user.displayAvatarURL(),
				reason: `${client.user.username} setup`,
			})
			.then((webhook) => dataArray.push(webhook.url));

		await (
			client.channels.cache.get(args.split('-')[5].replace(/[<#!>, ]/g, '')) as TextChannel
		)
			.createWebhook(`Server Gate`, {
				avatar: client.user.displayAvatarURL(),
				reason: `${client.user.username} setup`,
			})
			.then((webhook) => dataArray.push(webhook.url));

		const emoji1 = args.toString().split('|')[1].replace(' ', '');
		const emoji2 = args.toString().split('|')[2].replace(' ', '');
		const emoji3 = args.toString().split('|')[3].replace(' ', '');

		dataArray.push(emoji1);
		dataArray.push(emoji2);
		dataArray.push(emoji3);

		const modlogs = new logsModel({
			_id: 'substance',
			currentCase: 1,
		});
		await modlogs.save();
		const modmailLogs = new modmailModel({
			_id: 'substance',
			currentTicket: 1,
			openedTickets: [],
		});
		await modmailLogs.save();

		const doneEmbed = new Embed()
			.setTitle('Almost there!')
			.setColor('Green')
			.setDescription(
				`Now, you may go to \`${process.cwd()}/src/json/database.json\` and paste this.\n` +
					'```json\n' +
					[
						'{',
						'	"webhooks": {',
						`		"error-handler": "${dataArray[0]}",`,
						`		"mod-logs": "${dataArray[1]}",`,
						`		"message-logs": "${dataArray[2]}",`,
						`		"rmpunish-logs": "${dataArray[3]}",`,
						`		"modmail": "${dataArray[4]}",`,
						`		"server-gate": "${dataArray[5]}"`,
						'	},',
						'	"emojis": {',
						`		"sucess": "${dataArray[6]}",`,
						`		"error": "${dataArray[7]}",`,
						`		"attention": "${dataArray[8]}"`,
						'	}',
						'}',
					].join('\n') +
					'\n```'
			);

		await msg.edit({ embeds: [doneEmbed] });
		console.log(
			"\n\n\nSetup was successful, you can now run 'npm start' after you save the config in the file."
		);
		process.exit();
	}
});

