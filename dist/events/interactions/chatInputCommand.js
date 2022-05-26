"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = require("../../structures/Event");
const __1 = require("../..");
const discord_js_1 = require("discord.js");
const mongoose_1 = require("mongoose");
const logger_1 = require("../../logger");
const cooldown = new discord_js_1.Collection();
exports.default = new Event_1.Event('interactionCreate', async (interaction) => {
    if (!interaction.inGuild())
        return;
    if (!interaction.inCachedGuild())
        return;
    if (interaction?.isChatInputCommand()) {
        const member = interaction.member;
        const command = __1.client.commands.get(interaction.commandName);
        if (!command)
            return interaction.reply({
                embeds: [
                    __1.client.embeds.error(`No commands were found matching \`/${interaction.commandName}\``),
                ],
                ephemeral: true,
            });
        if (!__1.client.config.developers.includes(interaction.user.id) &&
            command.directory === 'developer')
            return;
        // Permission Check
        if (command.permission?.some((perm) => !member.permissions.has(perm)) &&
            interaction.user.id !== __1.client.config.owner)
            return interaction.reply({
                embeds: [
                    __1.client.embeds.attention("You don't have permissions to use this context menu."),
                ],
                ephemeral: true,
            });
        // Cooldowns
        if (cooldown.has(`${command.name}${interaction.user.id}`)) {
            const cooldownRemaining = `${~~(+cooldown.get(`${command.name}${interaction.user.id}`) - +Date.now())}`;
            const cooldownEmbed = __1.client.util
                .embed()
                .setColor(__1.client.colors.error)
                .setDescription(`You need to wait \`${__1.client.util.convertTime(~~(+cooldownRemaining / 1000))}\` to use this context menu.`);
            return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
        }
        if (command.directory !== 'developer' && mongoose_1.connection.readyState !== 1) {
            interaction.reply({
                embeds: [
                    __1.client.embeds.attention('MongoDB is not connected properly, please contact a developer.'),
                ],
                ephemeral: true,
            });
            return logger_1.logger.warn({
                source: `/${interaction.commandName} command`,
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
            source: `/${interaction.commandName} command`,
            reason: err,
        }));
        if (command.cooldown &&
            !__1.client.config.developers.includes(interaction.user.id) &&
            __1.client.config.owner !== interaction.user.id) {
            cooldown.set(`${command.name}${interaction.user.id}`, Date.now() + command.cooldown);
            setTimeout(() => {
                cooldown.delete(`${command.name}${interaction.user.id}`);
            }, command.cooldown);
        }
    }
});
