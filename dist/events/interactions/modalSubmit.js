"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const config_1 = require("../../models/config");
const Event_1 = require("../../structures/Event");
exports.default = new Event_1.Event('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit())
        return;
    if (interaction.customId === 'add-badwords') {
        const words = interaction.fields.getTextInputValue('input');
        const currentWords = (await config_1.configModel.findById('automod')).filteredWords;
        let removed = 0;
        const input = words
            .split(',')
            .map((word) => word.trim().toUpperCase())
            .map((word) => {
            if (currentWords.includes(word)) {
                currentWords.splice(currentWords.indexOf(word), 1);
                word = null;
                removed++;
            }
            return word;
        })
            .filter((word) => word);
        await config_1.configModel.findByIdAndUpdate('automod', {
            $set: {
                filteredWords: currentWords.concat(input),
            },
        });
        await __1.client.config.updateAutomod();
        await interaction.reply({
            embeds: [
                new discord_js_1.EmbedBuilder({
                    description: `Added **${input.length}** and removed **${removed}** words.`,
                    color: __1.client.cc.successC,
                }),
            ],
            ephemeral: true,
        });
    }
    if (interaction.customId.startsWith('add-reason')) {
        const words = interaction.fields.getTextInputValue('input');
        const module = interaction.customId.replaceAll('add-reason-', '');
        const currentReasons = (await config_1.configModel.findById('moderation')).reasons[module];
        let removed = 0;
        const input = words
            .split('--')
            .map((reason) => reason.trim())
            .map((reason) => {
            // Checking if a reason already exists
            if (currentReasons.includes(reason)) {
                currentReasons.splice(currentReasons.indexOf(reason), 1);
                removed++;
                reason = null;
            }
            return reason;
        })
            .filter((word) => word);
        await config_1.configModel.findByIdAndUpdate('moderation', {
            $set: {
                reasons: {
                    ...(await config_1.configModel.findById('moderation')).reasons,
                    [module]: currentReasons.concat(input),
                },
            },
        });
        await __1.client.config.updateModeration();
        await interaction.reply({
            embeds: [
                new discord_js_1.EmbedBuilder({
                    description: `Added **${input.length}** and removed **${removed}** reasons.`,
                    color: __1.client.cc.successC,
                }),
            ],
            ephemeral: true,
        });
    }
});
