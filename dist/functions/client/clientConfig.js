"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientConfig = void 0;
const discord_js_1 = require("discord.js");
const config_1 = require("../../models/config");
class clientConfig {
    /** Logging system webhook clients */
    webhooks = {
        mod: null,
        message: null,
        modmail: null,
        servergate: null,
    };
    /** Logging system active status */
    logging = {
        mod: null,
        message: null,
        modmail: null,
        servergate: null,
    };
    /** Automod data */
    automod = {
        /** Automod activity status */
        modules: {
            badwords: null,
            invites: null,
            largeMessage: null,
            massMention: null,
            massEmoji: null,
            spam: null,
            capitals: null,
            urls: null,
        },
        /** Automod Array of filtered words */
        filteredWords: [],
    };
    /** General data */
    general = {
        ownerId: null,
        developers: [],
        success: '',
        error: '',
        attention: '',
        guild: {
            appealLink: null,
            memberRoleId: null,
            modmailCategoryId: null,
        },
    };
    async updateLogs() {
        const data = await config_1.configModel.findById('logging');
        if (!data)
            return;
        function getWebhookInfo(url) {
            if (!url)
                return [undefined];
            const filtered = url.replaceAll('https://discord.com/api/webhooks/', '');
            const returns = [];
            returns.push(filtered.split('/')[0]);
            returns.push(filtered.split('/')[1]);
            return returns;
        }
        this.webhooks.mod = new discord_js_1.WebhookClient({
            id: getWebhookInfo(data.logging.mod.webhook)[0],
            token: getWebhookInfo(data.logging.mod.webhook)[1],
        });
        this.webhooks.message = new discord_js_1.WebhookClient({
            id: getWebhookInfo(data.logging.message.webhook)[0],
            token: getWebhookInfo(data.logging.message.webhook)[1],
        });
        this.webhooks.modmail = new discord_js_1.WebhookClient({
            id: getWebhookInfo(data.logging.modmail.webhook)[0],
            token: getWebhookInfo(data.logging.modmail.webhook)[1],
        });
        this.webhooks.servergate = new discord_js_1.WebhookClient({
            id: getWebhookInfo(data.logging.servergate.webhook)[0],
            token: getWebhookInfo(data.logging.servergate.webhook)[1],
        });
        this.logging = {
            mod: data.logging.mod.active,
            modmail: data.logging.modmail.active,
            message: data.logging.message.active,
            servergate: data.logging.servergate.active,
        };
    }
    async updateAutomod() {
        const data = await config_1.configModel.findById('automod');
        if (!data)
            return;
        this.automod.modules = {
            badwords: data.modules.badwords,
            invites: data.modules.invites,
            largeMessage: data.modules.largeMessage,
            massMention: data.modules.massMention,
            massEmoji: data.modules.massEmoji,
            spam: data.modules.spam,
            capitals: data.modules.capitals,
            urls: data.modules.urls,
        };
        this.automod.filteredWords = data.filteredWords;
    }
    async updateGeneral() {
        const data = await config_1.configModel.findById('general');
        if (!data)
            return;
        this.general = {
            ownerId: data.ownerId,
            developers: data.developers,
            success: data.success,
            error: data.error,
            attention: data.attention,
            guild: {
                appealLink: data.guild.appealLink,
                memberRoleId: data.guild.memberRoleId,
                modmailCategoryId: data.guild.modmailCategoryId,
            },
        };
    }
}
exports.clientConfig = clientConfig;
