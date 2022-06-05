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
        const removedWords = [];
        const wordsArray = words
            .split(',')
            .map((word) => {
            if (currentWords.includes(word.trim().toUpperCase())) {
                currentWords.splice(currentWords.indexOf(word.trim().toUpperCase()));
                removedWords.push(word);
                word = null;
            }
            return word !== null ? word?.trim()?.toUpperCase() : 'null';
        })
            .filter((word) => word !== 'null');
        await config_1.configModel.findByIdAndUpdate('automod', {
            $set: {
                filteredWords: currentWords.concat(wordsArray),
            },
        });
        await __1.client.config.updateAutomod();
        await interaction.reply({
            embeds: [
                new discord_js_1.EmbedBuilder({
                    description: [
                        wordsArray.length
                            ? '**Added filtered words:**\n' +
                                wordsArray.join(', ').toLowerCase()
                            : '',
                        removedWords.length
                            ? '\n\n**Removed filtered words:**\n' +
                                removedWords.map((word) => word.toLowerCase()).join(', ')
                            : '',
                    ].join('\n'),
                    color: __1.client.cc.successC,
                }),
            ],
            ephemeral: true,
        });
    }
});
