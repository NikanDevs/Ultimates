"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const automod_1 = require("../../models/automod");
const punishments_1 = require("../../models/punishments");
const Command_1 = require("../../structures/Command");
const PunishmentType_1 = require("../../typings/PunishmentType");
const generateDiscordTimestamp_1 = require("../../utils/generateDiscordTimestamp");
exports.default = new Command_1.Command({
    name: 'warnings',
    description: 'View your active punishments in the server.',
    directory: 'moderation',
    cooldown: 5000,
    permission: [],
    available: true,
    options: [
        {
            name: 'type',
            description: 'Choose if you want to view your automod or manual warnings.',
            type: discord_js_1.ApplicationCommandOptionType['Number'],
            required: false,
            choices: [
                {
                    name: 'Manual warnings',
                    value: 1,
                },
                {
                    name: 'Auto moderation warnings',
                    value: 2,
                },
            ],
        },
    ],
    excute: async ({ client, interaction, options }) => {
        const user = interaction.user;
        const warningsEmbed = client.util
            .embed()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setColor(client.cc.invisible)
            .setThumbnail(user.displayAvatarURL());
        // Finding the warnings [option]
        const optionChoice = options.getNumber('type');
        var warningsMap = [];
        if (!optionChoice) {
            const findWarningsNormal = await punishments_1.punishmentModel.find({
                userId: user.id,
            });
            const findWarningsAutomod = await automod_1.automodModel.find({ userId: user.id });
            let warnCounter = 0;
            findWarningsNormal.forEach((data) => {
                warnCounter = warnCounter + 1;
                warningsMap.push([
                    `\`${warnCounter}\` **${client.util.capitalize(data.type)}** | **ID: ${data._id}**`,
                    `• **Date:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(data.date, 'Short Date/Time')}`,
                    data.type === PunishmentType_1.PunishmentType.Warn
                        ? `• **Expire:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(data.expire)}`
                        : 'LINE_BREAK',
                    `• **Reason:** ${data.reason}`,
                ]
                    .join('\n')
                    .replaceAll('\nLINE_BREAK', ''));
            });
            findWarningsAutomod.forEach((data) => {
                warnCounter = warnCounter + 1;
                warningsMap.push([
                    `\`${warnCounter}\` **${client.util.capitalize(data.type)}** | Auto Moderation`,
                    `• **Date:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(data.date, 'Short Date/Time')}`,
                    data.type === PunishmentType_1.PunishmentType.Warn
                        ? `• **Expire:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(data.expire)}`
                        : 'LINE_BREAK',
                    `• **Reason:** ${data.reason}`,
                ]
                    .join('\n')
                    .replaceAll('\nLINE_BREAK', ''));
            });
        }
        else if (optionChoice === 1) {
            const findWarningsNormal = await punishments_1.punishmentModel.find({
                userId: user.id,
            });
            let warnCounter = 0;
            warningsMap = findWarningsNormal.map((data) => {
                warnCounter = warnCounter + 1;
                return [
                    `\`${warnCounter}\` **${client.util.capitalize(data.type)}** | **ID: ${data._id}**`,
                    `• **Date:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(data.date, 'Short Date/Time')}`,
                    data.type === PunishmentType_1.PunishmentType.Warn
                        ? `• **Expire:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(data.expire)}`
                        : 'LINE_BREAK',
                    `• **Reason:** ${data.reason}`,
                ]
                    .join('\n')
                    .replaceAll('\nLINE_BREAK', '');
            });
        }
        else if (optionChoice === 2) {
            const findWarningsAutomod = await automod_1.automodModel.find({ userId: user.id });
            let warnCounter = 0;
            warningsMap = findWarningsAutomod.map((data) => {
                warnCounter = warnCounter + 1;
                return [
                    `\`${warnCounter}\` **${client.util.capitalize(data.type)}** | Auto Moderation`,
                    `• **Date:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(data.date, 'Short Date/Time')}`,
                    data.type === PunishmentType_1.PunishmentType.Warn
                        ? `• **Expire:** ${(0, generateDiscordTimestamp_1.generateDiscordTimestamp)(data.date)}`
                        : 'LINE_BREAK',
                    `• **Reason:** ${data.reason}`,
                ]
                    .join('\n')
                    .replaceAll('\nLINE_BREAK', '');
            });
        }
        // Sending the results
        if (warningsMap.length === 0)
            return interaction.reply({
                embeds: [
                    client.util.embed({
                        description: `No ${optionChoice ? (optionChoice === 1 ? 'manual ' : 'automod ') : ''}warnings were found for you, you're clean!`,
                        color: client.cc.invisible,
                    }),
                ],
                ephemeral: true,
            });
        await interaction.deferReply();
        if (warningsMap.length <= 3) {
            warningsEmbed.setDescription(warningsMap.map((data) => data.toString()).join('\n\n'));
            interaction.followUp({ embeds: [warningsEmbed] });
        }
        else if (warningsMap.length > 3) {
            const totalPages = Math.ceil(warningsMap.length / 3);
            let currentSlice1 = 0;
            let currentSlice2 = 3;
            let currentPage = 1;
            let sliced = warningsMap
                .map((data) => data.toString())
                .slice(currentSlice1, currentSlice2);
            warningsEmbed
                .setDescription(sliced.join('\n\n'))
                .setFooter({ text: `Page ${currentPage}/${totalPages}` });
            var sentInteraction = (await interaction.followUp({
                embeds: [warningsEmbed],
                components: [client.util.build.paginator()],
            }));
            const collector = sentInteraction.createMessageComponentCollector({
                time: 60000,
                componentType: discord_js_1.ComponentType['Button'],
            });
            collector.on('collect', (collected) => {
                if (interaction.user.id !== collected.user.id)
                    return collected.reply({
                        content: 'You can not use this.',
                        ephemeral: true,
                    });
                switch (collected.customId) {
                    case '1':
                        if (currentPage === 1)
                            return collected.deferUpdate();
                        currentSlice1 = currentSlice1 - 3;
                        currentSlice2 = currentSlice2 - 3;
                        currentPage = currentPage - 1;
                        sliced = warningsMap
                            .map((data) => data.toString())
                            .slice(currentSlice1, currentSlice2);
                        warningsEmbed
                            .setDescription(sliced.map((data) => data.toString()).join('\n\n'))
                            .setFooter({ text: `Page ${currentPage}/${totalPages}` });
                        interaction.editReply({ embeds: [warningsEmbed] });
                        collected.deferUpdate();
                        break;
                    case '2':
                        if (currentPage === totalPages)
                            return collected.deferUpdate();
                        currentSlice1 = currentSlice1 + 3;
                        currentSlice2 = currentSlice2 + 3;
                        currentPage = currentPage + 1;
                        sliced = warningsMap
                            .map((data) => data.toString())
                            .slice(currentSlice1, currentSlice2);
                        warningsEmbed
                            .setDescription(sliced.map((data) => data.toString()).join('\n\n'))
                            .setFooter({ text: `Page ${currentPage}/${totalPages}` });
                        interaction.editReply({ embeds: [warningsEmbed] });
                        collected.deferUpdate();
                        break;
                }
            });
            collector.on('end', () => {
                interaction.editReply({ components: [] });
            });
        }
    },
});
