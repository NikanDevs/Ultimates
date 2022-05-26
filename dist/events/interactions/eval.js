"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const node_util_1 = require("node:util");
const __1 = require("../..");
const constants_1 = require("../../constants");
const logger_1 = require("../../logger");
const Event_1 = require("../../structures/Event");
exports.default = new Event_1.Event('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit())
        return;
    if (interaction.customId !== 'eval')
        return;
    const client = __1.client;
    const logger = logger_1.logger;
    const code = interaction.fields.getTextInputValue('eval');
    const async = interaction.fields.getField('eval-async').value
        ? JSON.parse(interaction.fields.getField('eval-async').value)
        : false;
    const silent = interaction.fields.getField('eval-silent').value
        ? JSON.parse(interaction.fields.getField('eval-silent').value)
        : false;
    function formatOutput(str) {
        if (typeof str !== 'string')
            str = (0, node_util_1.inspect)(str, { depth: 0 });
        return str;
    }
    try {
        let evaled = eval(async ? `(async () => {\n${code}\n})()` : code);
        evaled = formatOutput(evaled);
        switch (evaled) {
            case 'Promise { <pending> }':
                const sucessEmbed = client.util
                    .embed()
                    .setColor(client.colors.success)
                    .setDescription(`**Evaluation succeded:**\n\`\`\`ts\n${client.util.splitText(code, {
                    splitCustom: constants_1.EMBED_DESCRIPTION_MAX_LENGTH - 40,
                })}\n\`\`\``);
                interaction.reply({ embeds: [sucessEmbed], ephemeral: silent });
                break;
            default:
                let resultEmbed = client.util
                    .embed()
                    .setColor(client.colors.success)
                    .setDescription(`**Output:**\`\`\`ts\n${client.util.splitText(evaled, {
                    splitCustom: constants_1.EMBED_DESCRIPTION_MAX_LENGTH - 30,
                })}\n\`\`\``);
                if (evaled.length < constants_1.EMBED_DESCRIPTION_MAX_LENGTH - 25)
                    return interaction.reply({ embeds: [resultEmbed], ephemeral: silent });
                // If the result is too big to be shown in a single embed
                const [first, ...rest] = discord_js_1.Util.splitMessage(evaled, {
                    maxLength: 1935,
                });
                await interaction.channel.send({
                    content: `\`\`\`ts\n${first}\n\`\`\``,
                });
                rest.forEach(async (result) => await interaction.channel.send({
                    content: `\`\`\`ts\n${result}\n\`\`\``,
                }));
                break;
        }
    }
    catch (error) {
        const errorEmbed = client.util
            .embed()
            .setColor(client.colors.error)
            .setDescription(`**An error has occured**\n\`\`\`xl\n${client.util.splitText(error?.message, {
            splitCustom: constants_1.EMBED_DESCRIPTION_MAX_LENGTH - 40,
        })}\n\`\`\``);
        await interaction.reply({ embeds: [errorEmbed], ephemeral: silent });
    }
});
