"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = require("../../structures/Event");
const __1 = require("../..");
const discord_js_1 = require("discord.js");
const cooldown = new discord_js_1.Collection();
const mongoose_1 = require("mongoose");
const logger_1 = require("../../logger");
const config_json_1 = require("../../json/config.json");
const convertTime_1 = require("../../functions/convertTime");
exports.default = new Event_1.Event('interactionCreate', async (interaction) => {
    if (!interaction.inGuild())
        return;
    if (!interaction.inCachedGuild())
        return;
    if (interaction?.isContextMenuCommand()) {
        const member = interaction.member;
        const command = __1.client.commands
            .filter((cmd) => cmd.interaction.directory !== 'developer')
            .get(interaction.commandName);
        if (!command)
            return interaction.reply({
                embeds: [
                    __1.client.embeds.error(`No context menus were found matching \`/${interaction.commandName}\``),
                ],
                ephemeral: true,
            });
        // Permission Check
        if (command.interaction.permission?.some((perm) => !member.permissions.has(perm)) &&
            interaction.user.id !== config_json_1.ownerId)
            return interaction.reply({
                embeds: [
                    __1.client.embeds.attention("You don't have permissions to run this command.interaction."),
                ],
                ephemeral: true,
            });
        // Cooldowns
        if (cooldown.has(`${command.interaction.name}${interaction.user.id}`)) {
            const cooldownRemaining = `${~~(+cooldown.get(`${command.interaction.name}${interaction.user.id}`) - +Date.now())}`;
            const cooldownEmbed = new discord_js_1.EmbedBuilder()
                .setColor(__1.client.cc.errorC)
                .setDescription(`You need to wait \`${(0, convertTime_1.convertTime)(~~+cooldownRemaining)}\` to use this command again.`);
            return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
        }
        if (command.interaction.directory !== 'developer' && mongoose_1.connection.readyState !== 1) {
            interaction.reply({
                embeds: [
                    __1.client.embeds.attention('MongoDB is not connected properly, please contact a developer.'),
                ],
                ephemeral: true,
            });
            return logger_1.logger.warn({
                source: `${interaction.commandName} context menu`,
                reason: {
                    name: 'MongoDB',
                    message: 'Mongoose database is not connected properly',
                    stack: `Current ready state: ${mongoose_1.connection.readyState}\nCurrent ready status: ${mongoose_1.ConnectionStates[mongoose_1.connection.readyState]}`,
                },
            });
        }
        await command
            .excute({
            client: __1.client,
            interaction: interaction,
            options: interaction.options,
        })
            .catch((err) => logger_1.logger.error({
            source: `${interaction.commandName} context menu`,
            reason: err,
        }));
        if (command.interaction.cooldown &&
            !config_json_1.developers.includes(interaction.user.id) &&
            config_json_1.ownerId !== interaction.user.id) {
            cooldown.set(`${command.interaction.name}${interaction.user.id}`, Date.now() + command.interaction.cooldown);
            setTimeout(() => {
                cooldown.delete(`${command.interaction.name}${interaction.user.id}`);
            }, command.interaction.cooldown);
        }
    }
});
