"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ultimates = void 0;
const discord_js_1 = require("discord.js");
const glob_1 = require("glob");
const util_1 = require("util");
const mongoose_1 = require("mongoose");
const clientUtil_1 = require("../functions/client/clientUtil");
const properties_1 = require("../functions/client/properties");
const logger_1 = require("../logger");
const logs_1 = require("../models/logs");
const modmail_1 = require("../models/modmail");
const clientConfig_1 = require("../functions/client/clientConfig");
const globPromise = (0, util_1.promisify)(glob_1.glob);
class Ultimates extends discord_js_1.Client {
    commands = new discord_js_1.Collection();
    util = new clientUtil_1.clientUtil();
    config = new clientConfig_1.clientConfig();
    embeds = properties_1.clientEmbeds;
    cc = properties_1.cc;
    // Constructor
    constructor() {
        super({
            intents: 131071,
            partials: [
                discord_js_1.Partials.Channel,
                discord_js_1.Partials.GuildMember,
                discord_js_1.Partials.Message,
                discord_js_1.Partials.Reaction,
                discord_js_1.Partials.User,
                discord_js_1.Partials.GuildScheduledEvent,
                discord_js_1.Partials.ThreadMember,
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
        if (!mongoDBConnection)
            return;
        await (0, mongoose_1.connect)(mongoDBConnection).then(() => logger_1.logger.info('MongoDB connected', { showDate: false }));
        await this.checkSubstance();
        await this.config.updateLogs();
        await this.config.updateAutomod();
        await this.config.updateGeneral();
        await this.config.updateModeration();
        await this.registerModules();
        await this.login(process.env.DISCORD_TOKEN).then(() => {
            this.handlerErrors();
        });
    }
    async importFiles(filePath) {
        return (await Promise.resolve().then(() => __importStar(require(filePath))))?.default;
    }
    /** Registers commands and events if called. */
    async registerModules() {
        // Commands
        const slashFiles = await globPromise(`${__dirname}/../commands/**/*{.ts,.js}`);
        slashFiles.forEach(async (filePaths) => {
            const command = await this.importFiles(filePaths);
            this.commands.set(command.interaction.name, command);
        });
        const eventFiles = (await globPromise(`${__dirname}/../events/**/*{.ts,.js}`)) ||
            (await globPromise(`${__dirname}/../events/**{.ts,.js}`));
        eventFiles.forEach(async (filePaths) => {
            const event = await this.importFiles(filePaths);
            this.on(event.event, event.run);
        });
    }
    /** Handles process errors and exits if called. */
    handlerErrors() {
        let betterTexts;
        (function (betterTexts) {
            betterTexts["unhandledRejection"] = "Unhandled Rejection";
            betterTexts["uncaughtException"] = "Uncaught Exception";
            betterTexts["warning"] = "Warning";
        })(betterTexts || (betterTexts = {}));
        process.on('unhandledRejection', (reason) => {
            logger_1.logger.error({ source: betterTexts.unhandledRejection, reason: reason });
        });
        process.on('uncaughtException', (reason) => {
            logger_1.logger.error({ source: betterTexts.unhandledRejection, reason: reason });
        });
        process.on('warning', (reason) => {
            logger_1.logger.error({ source: betterTexts.warning, reason: reason });
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
    async checkSubstance() {
        const logs = await logs_1.logsModel.findById('substance');
        const modmail = await modmail_1.modmailModel.findById('substance');
        if (!logs) {
            const data = new logs_1.logsModel({
                _id: 'substance',
                currentCase: 1,
            });
            await data.save();
            logger_1.logger.info('Set logs substance data', { showDate: false });
        }
        if (!modmail) {
            const data = new modmail_1.modmailModel({
                _id: 'substance',
                currentTicket: 1,
                openedTickets: [],
            });
            await data.save();
            logger_1.logger.info('Set modmail substance data', { showDate: false });
        }
    }
}
exports.Ultimates = Ultimates;
