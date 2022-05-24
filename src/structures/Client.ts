import { Client, Collection, ClientEvents, Partials, WebhookClient } from 'discord.js';
import { commandType } from '../typings/Command';
import { glob } from 'glob';
import { promisify } from 'util';
import { connect } from 'mongoose';
import { Event } from './Event';
import botConfig, { enabledModules as configEnabledModules } from '../json/config.json';
import { clientUtil } from '../functions/client/clientUtil';
import {
	clientCc,
	clientColors,
	clientEmbeds,
	clientServer,
	databaseConfig,
} from '../functions/client/prototypes';
import { configModel } from '../models/config';
const globPromise = promisify(glob);

export class Ultimates extends Client {
	commands = new Collection() as Collection<string, commandType>;
	config = botConfig;
	util = new clientUtil();
	embeds = clientEmbeds;
	colors = clientColors;
	cc = clientCc;
	server = clientServer;
	webhooks = {
		mod: null,
		message: null,
		modmail: null,
		servergate: null,
	};
	databaseConfig = databaseConfig;

	// Constructor
	constructor() {
		super({
			intents: 32767,
			partials: [
				Partials.Channel,
				Partials.GuildMember,
				Partials.Message,
				Partials.Reaction,
				Partials.User,
				Partials.GuildScheduledEvent,
				Partials.ThreadMember,
			],
			allowedMentions: { repliedUser: false },
			presence: {
				status: 'idle',
			},
		});
	}

	/** Registers the modules, connects mongoDB and logs into the bot if called. */
	async born() {
		// Connecting to mongoDB
		const mongoDBConnection = process.env.MONGODB;
		if (!mongoDBConnection) return;
		await connect(mongoDBConnection).then(() => console.log('Connected to MongoDB!'));
		await this.updateWebhookData();

		this.registerModules().then(() => console.log('Registered Modules.'));

		await this.login(process.env.DISCORD_TOKEN).then(() => {
			this.handlerErrors();
		});
	}

	async importFiles(filePath: string) {
		return (await import(filePath as string))?.default;
	}

	/** Registers commands and events if called. */
	async registerModules() {
		// Commands
		const slashFiles = await globPromise(`${__dirname}/../commands/**/*{.ts,.js}`);
		slashFiles
			.filter((file) => (!configEnabledModules.modmail ? !file.includes('modmail') : true))
			.forEach(async (filePaths) => {
				const command: commandType = await this.importFiles(filePaths);
				if (!command.name) return;

				this.commands.set(command.name, command);
			});

		const eventFiles =
			(await globPromise(`${__dirname}/../events/**/*{.ts,.js}`)) ||
			(await globPromise(`${__dirname}/../events/**{.ts,.js}`));
		eventFiles
			// automod
			.filter((file) => (!configEnabledModules.automod ? !file.includes('automod') : true))
			// modmail
			.filter((file) => (!configEnabledModules.modmail ? !file.includes('modmail') : true))
			// verification
			.filter((file) =>
				!configEnabledModules.verification ? !file.includes('verify') : true
			)
			.forEach(async (filePaths) => {
				const event: Event<keyof ClientEvents> = await this.importFiles(filePaths);
				this.on(event.event, event.run);
			});
	}

	/** Handles process errors and exits if called. */
	async handlerErrors() {
		enum betterTexts {
			'unhandledRejection' = 'Unhandled Rejection',
			'uncaughtException' = 'Uncaught Exception',
			'warning' = 'Warning',
		}
		type errors = 'unhandledRejection' | 'uncaughtException' | 'warning';

		function sendError(type: errors, reason: Error) {
			return console.log(
				['---------------' + betterTexts[type] + '---------------', reason.stack].join(
					'\n'
				)
			);
		}

		process.on('unhandledRejection', (reason: Error) => {
			sendError('uncaughtException', reason);
		});
		process.on('uncaughtException', (reason: Error) => {
			sendError('uncaughtException', reason);
		});
		process.on('warning', (reason: Error) => {
			sendError('warning', reason);
		});
		process.on('disconnect', () => {
			this.destroy();
		});
		process.on('beforeExit', () => {
			this.destroy();
		});
		process.on('exit', () => {
			this.destroy();
		});
	}

	/** Takes webhook data from the database and updates them in the vars. */
	async updateWebhookData() {
		const data = await configModel.findById('logs');
		if (!data) return;

		function getWebhookInfo(url: string) {
			if (!url) return [undefined];

			const filtered = url.replaceAll('https://discord.com/api/webhooks/', '');
			const returns: string[] = [];
			returns.push(filtered.split('/')[0]);
			returns.push(filtered.split('/')[1]);

			return returns;
		}

		this.webhooks.mod = new WebhookClient({
			id: getWebhookInfo(data.mod.webhook)[0],
			token: getWebhookInfo(data.mod.webhook)[1],
		});
		this.webhooks.message = new WebhookClient({
			id: getWebhookInfo(data.message.webhook)[0],
			token: getWebhookInfo(data.message.webhook)[1],
		});
		this.webhooks.modmail = new WebhookClient({
			id: getWebhookInfo(data.modmail.webhook)[0],
			token: getWebhookInfo(data.modmail.webhook)[1],
		});
		this.webhooks.servergate = new WebhookClient({
			id: getWebhookInfo(data.servergate.webhook)[0],
			token: getWebhookInfo(data.servergate.webhook)[1],
		});

		this.databaseConfig.logsActive = {
			mod: data.mod.active,
			modmail: data.modmail.active,
			message: data.message.active,
			servergate: data.servergate.active,
		};
	}
}
