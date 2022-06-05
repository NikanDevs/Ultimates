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
    async updateLogs() {
        const data = await config_1.configModel.findById('logs');
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
            id: getWebhookInfo(data.mod.webhook)[0],
            token: getWebhookInfo(data.mod.webhook)[1],
        });
        this.webhooks.message = new discord_js_1.WebhookClient({
            id: getWebhookInfo(data.message.webhook)[0],
            token: getWebhookInfo(data.message.webhook)[1],
        });
        this.webhooks.modmail = new discord_js_1.WebhookClient({
            id: getWebhookInfo(data.modmail.webhook)[0],
            token: getWebhookInfo(data.modmail.webhook)[1],
        });
        this.webhooks.servergate = new discord_js_1.WebhookClient({
            id: getWebhookInfo(data.servergate.webhook)[0],
            token: getWebhookInfo(data.servergate.webhook)[1],
        });
        this.logging = {
            mod: data.mod.active,
            modmail: data.modmail.active,
            message: data.message.active,
            servergate: data.servergate.active,
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
}
exports.clientConfig = clientConfig;
