import { Client, Collection, ClientEvents, Partials, Colors, Embed } from 'discord.js';
import { commandType } from '../typings/Command';
import { glob } from 'glob';
import { promisify } from 'util';
import { connect } from 'mongoose';
import { Event } from './Event';
import botConfig, { enabledModules as configEnabledModules } from '../json/config.json';
import { clientUtil } from '../functions/client/clientUtil';
import { errorHandler } from '../webhooks';
import { clientCc, clientColors, clientEmbeds, clientServer } from '../functions/client/prototypes';
import { enabledModules as logsEnabledModules } from '../json/logs.json';
const globPromise = promisify(glob);

export class Ultimates extends Client {
	commands = new Collection() as Collection<string, commandType>;
	config = botConfig;
	util = new clientUtil();
	embeds = clientEmbeds;
	colors = clientColors;
	cc = clientCc;
	server = clientServer;

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
	born() {
		// Registering
		this.registerModules().then(() => console.log('Registered Modules.'));
		this.login(process.env.DISCORD_TOKEN);

		// Connecting to mongoDB
		const mongoDBConnection = process.env.MONGODB;
		if (!mongoDBConnection) return;
		// connect(mongoDBConnection).then(() => console.log('Connected to MongoDB!'));

		// Handler Errors And exit
		this.handlerErrors();
	}

	async importFiles(filePath: string) {
		return (await import(filePath))?.default;
	}

	// async registerCommandOptions({ commands }: registerSlashCommandOptions) {
	// 	this.guilds.cache.get(this.server.id).commands.set(commands);
	// 	console.log(
	// 		`Registering interaction commands to ${this.guilds.cache.get(this.server.id).name}`
	// 	);
	// }

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
			// loggings
			.filter((file) =>
				!logsEnabledModules.messageDelete && configEnabledModules.logs
					? !file.includes('logs/messageDelete')
					: true
			)
			.filter((file) =>
				!logsEnabledModules.messageUpdate && configEnabledModules.logs
					? !file.includes('logs/messageUpdate')
					: true
			)
			.filter((file) =>
				!logsEnabledModules.messageDeleteBulk && configEnabledModules.logs
					? !file.includes('logs/messageDeleteBulk')
					: true
			)
			.filter((file) =>
				!logsEnabledModules.guildMemberAdd && configEnabledModules.logs
					? !file.includes('logs/guildMemberAdd')
					: true
			)
			.filter((file) =>
				!logsEnabledModules.guildMemberRemove && configEnabledModules.logs
					? !file.includes('logs/guildMemberRemove')
					: true
			)

			.forEach(async (filePaths) => {
				const event: Event<keyof ClientEvents> = await this.importFiles(filePaths);
				this.on(event.event, event.run);
			});
	}

	/** Handles process errors and exits if called. */
	async handlerErrors() {
		enum urls {
			'unhandledRejection' = 'https://nodejs.org/api/process.html#event-unhandledrejection',
			'uncaughtException' = 'https://nodejs.org/api/process.html#event-uncaughtexception',
			'warning' = 'https://nodejs.org/api/process.html#event-warning',
		}
		enum betterTexts {
			'unhandledRejection' = 'Unhandled Rejection',
			'uncaughtException' = 'Uncaught Exception',
			'warning' = 'Warning',
		}
		type errors = 'unhandledRejection' | 'uncaughtException' | 'warning';

		function sendError(type: errors, reason: Error) {
			const embed = new Embed()
				.setTitle(betterTexts[type])
				.setURL(urls[type])
				.setColor(Colors.Red)
				.setDescription(
					[
						'**Reason:**',
						`\`\`\`\n${
							reason.stack.length <= 4080 ? reason.stack : reason
						}\n\`\`\``,
					].join('\n')
				);

			errorHandler.send({ embeds: [embed] });
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
}
