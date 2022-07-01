require('dotenv').config();
import { Client, Collection, ClientEvents, Partials } from 'discord.js';
import { commandType } from '../typings';
import { glob } from 'glob';
import { promisify } from 'util';
import { connect } from 'mongoose';
import { Event } from './Event';
import { cc, clientEmbeds } from '../functions/other/client';
import { logger } from '../logger';
import { logsModel } from '../models/logs';
import { modmailModel } from '../models/modmail';
import { Config } from './Config';
const globPromise = promisify(glob);

export class UltimatesClient extends Client {
	public commands: Collection<string, commandType> = new Collection();
	public config = new Config();
	public embeds = clientEmbeds;
	public cc = cc;

	// Constructor
	constructor() {
		super({
			intents: 131071,
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

		this.born();
	}

	private async born() {
		// Connecting to mongoDB
		const mongoDBConnection = process.env.MONGODB;
		if (!mongoDBConnection) return;
		await connect(mongoDBConnection).then(() =>
			logger.info('MongoDB connected', { showDate: false })
		);
		await this.checkSubstance();
		await this.config.setConfig();
		await this.registerModules();

		await this.login(process.env.DISCORD_TOKEN).then(() => {
			this.handlerErrors();
		});
	}

	private async importFiles(filePath: string) {
		return (await import(filePath as string))?.default;
	}

	/** Registers commands and events if called. */
	private async registerModules() {
		// Commands
		const slashFiles = await globPromise(`${__dirname}/../commands/**/*{.ts,.js}`);
		slashFiles.forEach(async (filePaths) => {
			const command: commandType = await this.importFiles(filePaths);

			this.commands.set(command.interaction.name, command);
		});

		const eventFiles =
			(await globPromise(`${__dirname}/../events/**/*{.ts,.js}`)) ||
			(await globPromise(`${__dirname}/../events/**{.ts,.js}`));
		eventFiles.forEach(async (filePaths) => {
			const event: Event<keyof ClientEvents> = await this.importFiles(filePaths);
			this.on(event.event, event.run);
		});
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
			logger.info('Set logs substance data', { showDate: false });
		}
		if (!modmail) {
			const data = new modmailModel({
				_id: 'substance',
				currentTicket: 1,
				openedTickets: [],
			});
			await data.save();
			logger.info('Set modmail substance data', { showDate: false });
		}
	}
}
