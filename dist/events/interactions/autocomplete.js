"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const automod_1 = require("../../models/automod");
const punishments_1 = require("../../models/punishments");
const Event_1 = require("../../structures/Event");
const moderation_json_1 = require("../../json/moderation.json");
exports.default = new Event_1.Event('interactionCreate', async (interaction) => {
    if (!interaction)
        return;
    if (!interaction.isAutocomplete())
        return;
    // Checking for the member's permissions
    const getPermissions = __1.client.commands
        .filter((cmd) => cmd.directory !== 'developer')
        .get(interaction.commandName)?.permission;
    if (!getPermissions.some((perm) => interaction.member.permissions.has(perm)))
        return await interaction.respond([
            { name: "You don't have permissions to intract with this.", value: 'NO_PERM' },
        ]);
    // Auto completes
    switch (interaction.commandName) {
        case 'punishment':
            const punishmentFocus = interaction.options.getFocused(true);
            if (interaction.options.getSubcommand() === 'search' ||
                interaction.options.getSubcommand() === 'revoke' ||
                interaction.options.getSubcommand() === 'update') {
                if (punishmentFocus?.name !== 'id')
                    return;
                let warnings = (await punishments_1.punishmentModel.find())
                    .map((data) => {
                    return [
                        `Manual | ${__1.client.util.capitalize(data.type)}`,
                        `${__1.client.users.cache.get(data.userId) === undefined
                            ? `${data.userId}`
                            : __1.client.users.cache.get(data.userId).tag}`,
                        `ID: ${data._id}`,
                    ].join(' • ');
                })
                    .concat((await automod_1.automodModel.find()).map((data) => {
                    return [
                        `Automod | ${__1.client.util.capitalize(data.type)}`,
                        `${__1.client.users.cache.get(data.userId) === undefined
                            ? `${data.userId}`
                            : __1.client.users.cache.get(data.userId).tag}`,
                        `ID: ${data._id}`,
                        `${data.reason}`,
                    ].join(' • ');
                }));
                warnings = warnings
                    .filter((choice) => (choice.split(' • ')[1].startsWith('Automod')
                    ? choice
                        .split(' • ')[2]
                        .slice(4)
                        .startsWith(punishmentFocus.value)
                    : choice
                        .split(' • ')[2]
                        .slice(4)
                        .startsWith(punishmentFocus.value)) ||
                    choice
                        .split(' • ')[1]
                        .startsWith(punishmentFocus.value) ||
                    __1.client.users.cache
                        .find((user) => user.tag === choice.split(' • ')[1])
                        ?.id?.startsWith(punishmentFocus.value))
                    .map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
                    .slice(0, 25);
                if (warnings.length === 0)
                    return interaction.respond([
                        { name: 'No Punishments Found!', value: 'null' },
                    ]);
                await interaction.respond(warnings.map((choice) => ({
                    name: __1.client.util.splitText(choice, { splitCustom: 100 }),
                    value: choice.split(' • ')[1].startsWith('Automod')
                        ? choice.split(' • ')[3].slice(4)
                        : choice.split(' • ')[3].slice(4),
                })));
            }
            break;
        case 'unban':
            const unbanFocus = interaction.options.getFocused(true);
            if (unbanFocus?.name !== 'user-id')
                return;
            const mapBans = (await interaction.guild.bans.fetch()).map((ban) => {
                return [
                    `${ban.user.tag}`,
                    `${ban.user.id}`,
                    `${ban.reason || 'No reason provided.'}`,
                ].join(' • ');
            });
            const availableBannedMembers = [...new Set(mapBans)];
            const filteredBannedMembers = availableBannedMembers
                .filter((data) => data.startsWith(unbanFocus.value))
                .map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
                .slice(0, 25);
            if (!filteredBannedMembers.length)
                return interaction.respond([
                    { name: 'No banned members were found!', value: 'null' },
                ]);
            await interaction.respond(filteredBannedMembers.map((data) => ({
                name: __1.client.util.splitText(data, { splitCustom: 100 }),
                value: data.split(' • ')[2],
            })));
            break;
    }
    // Reason autocomplete
    const getReasonsFocus = interaction.options.getFocused(true);
    if (getReasonsFocus?.name !== 'reason')
        return;
    switch (interaction.commandName) {
        case interaction.commandName:
            const availableReasons = [...new Set(moderation_json_1.reasons[interaction.commandName])];
            const filteredReasons = availableReasons
                .filter((reason) => reason.startsWith(getReasonsFocus.value))
                .map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data);
            if (!moderation_json_1.reasons[interaction.commandName].length &&
                !getReasonsFocus.value.toString().length)
                return interaction.respond([
                    {
                        name: '⭐️' +
                            ' • ' +
                            'No inbuilt reasons were found, type a reason...',
                        value: 'No reason provided.',
                    },
                ]);
            if (filteredReasons.length === 0)
                return interaction.respond([
                    {
                        name: '⭐️' + ' • ' + getReasonsFocus.value.toString(),
                        value: getReasonsFocus.value.toString(),
                    },
                ]);
            await interaction.respond(filteredReasons.map((reason) => ({
                name: __1.client.util.splitText(reason, { splitCustom: 100 }),
                value: reason.split(' • ')[1],
            })));
            break;
    }
});
