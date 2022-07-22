import { Client, Collection, ClientEvents, Partials, GatewayIntentBits } from 'discord.js';
import { commandType } from '../typings';
import { connect } from 'mongoose';
import { Event } from './Event';
import { cc, clientEmbeds } from '../functions/other/client';
import { logger } from '../logger';
import { logsModel } from '../models/logs';
import { modmailModel } from '../models/modmail';
import { Config } from './Config';
import { readdirSync } from 'fs';

export class UltimatesClient extends Client {
	public commands: Collection<string, commandType> = new Collection();
	public config = new Config();
	public embeds = clientEmbeds;
	public cc = cc;

	// Constructor
	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildBans,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildVoiceStates, // event:logs:voiceStateUpdate
				GatewayIntentBits.GuildPresences, // command:userinfo
				GatewayIntentBits.GuildMessages, // event:automod:messageCreate
				GatewayIntentBits.GuildMessageTyping, // event:modmail:typingStart
				GatewayIntentBits.DirectMessages, // event:modmail:messageCreate
				GatewayIntentBits.DirectMessageTyping, // event:modmail:typingStart
				GatewayIntentBits.MessageContent, // event:automod:messageCreate
			],
			partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User],
			failIfNotExists: true,
			allowedMentions: { repliedUser: false },
			presence: { status: 'idle' },
		});

		this.born();
	}

	private async born() {
		// Connecting to mongoDB
		const mongoDBConnection = process.env.MONGODB;
		if (!mongoDBConnection) return;
		await connect(mongoDBConnection).then(() => logger.info('MongoDB connected', { showDate: false }));
		await this.checkSubstance();
		await this.config.setConfig();
		await this.registerModules();

		await this.login(process.env.DISCORD_TOKEN).then(() => {
			this.handlerErrors();
		});
	}

	private async importFiles(filePath: string) {
		return (await import(filePath))?.default;
	}

	/** Registers commands and events if called. */
	private async registerModules() {
		// Commands
		logger.info('Registering commands...', { showDate: false });
		for (const category of readdirSync(`${__dirname}/../commands`)) {
			for (const fileName of readdirSync(`${__dirname}/../commands/${category}`)) {
				const filePath = `${__dirname}/../commands/${category}/${fileName}`;
				const command: commandType = await this.importFiles(filePath.toString());

				this.commands.set(command.interaction.name, command);
			}
		}
		logger.info('Registered commands', { showDate: false });

		// Events
		logger.info('Registering events...', { showDate: false });
		for (const category of readdirSync(`${__dirname}/../events`)) {
			if (category.endsWith('.ts') || category.endsWith('.js')) {
				const filePath = `${__dirname}/../events/${category}`;
				const event: Event<keyof ClientEvents> = await this.importFiles(filePath.toString());
				this.on(event.event, event.run);
			} else {
				for (const fileName of readdirSync(`${__dirname}/../events/${category}`)) {
					const filePath = `${__dirname}/../events/${category}/${fileName}`;
					const event: Event<keyof ClientEvents> = await this.importFiles(filePath.toString());
					this.on(event.event, event.run);
				}
			}
		}
		logger.info('Registered events', { showDate: false });
	}

	/** Handles process errors and exits if called. */
	private handlerErrors() {
		process.on('unhandledRejection', (reason: Error) => {
			logger.error({ source: 'unhandledRejection', reason: reason });
		});
		process.on('uncaughtException', (reason: Error) => {
			logger.error({ source: 'unhandledRejection', reason: reason });
		});
		process.on('warning', (reason: Error) => {
			logger.error({ source: 'warning', reason: reason });
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

	private async checkSubstance() {
		const logs = await logsModel.findById('substance');
		const modmail = await modmailModel.findById('substance');

		if (!logs) {
			const data = new logsModel({
				_id: 'substance',
				currentCase: 1,
			});
			await data.save();
		}
		if (!modmail) {
			const data = new modmailModel({
				_id: 'substance',
				currentTicket: 1,
				openedTickets: [],
			});
			await data.save();
		}
	}
}
