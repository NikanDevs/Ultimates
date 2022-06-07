"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const constants_1 = require("../../constants");
const interactions_1 = require("../../interactions");
const config_1 = require("../../models/config");
const Command_1 = require("../../structures/Command");
var logsNames;
(function (logsNames) {
    logsNames["mod"] = "Moderation Logging";
    logsNames["message"] = "Message Logging";
    logsNames["modmail"] = "Modmail Logging";
    logsNames["servergate"] = "Joins and Leaves";
    logsNames["error"] = "Errors Loggings";
})(logsNames || (logsNames = {}));
var automodModulesNames;
(function (automodModulesNames) {
    automodModulesNames["badwords"] = "Filtered words";
    automodModulesNames["invites"] = "Discord invites";
    automodModulesNames["largeMessage"] = "Large messages";
    automodModulesNames["massMention"] = "Mass mentions";
    automodModulesNames["massEmoji"] = "Mass emoji";
    automodModulesNames["spam"] = "Spam";
    automodModulesNames["capitals"] = "Too many caps";
    automodModulesNames["urls"] = "Urls and links";
})(automodModulesNames || (automodModulesNames = {}));
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.configure,
    excute: async ({ client, interaction, options }) => {
        const subcommand = options.getSubcommand();
        await interaction.deferReply({ ephemeral: false });
        if (subcommand === 'logs') {
            const module = options.getString('module');
            const channel = options.getChannel('channel');
            const active = options.getBoolean('active');
            let newWebhook;
            const data = await config_1.configModel.findById('logging');
            if (!data) {
                const newData = new config_1.configModel({
                    _id: 'logging',
                    logging: {
                        mod: { channelId: null, webhook: null, active: null },
                        modmail: { channelId: null, webhook: null, active: null },
                        message: { channelId: null, webhook: null, active: null },
                        servergate: { channelId: null, webhook: null, active: null },
                        error: { channelId: null, webhook: null, active: null },
                    },
                });
                await newData.save();
            }
            if (channel && channel?.id !== data.logging[module].channelId) {
                switch (module) {
                    case 'mod':
                        await client.config.webhooks.mod?.delete().catch(() => { });
                        break;
                    case 'message':
                        await client.config.webhooks.message?.delete().catch(() => { });
                        break;
                    case 'modmail':
                        await client.config.webhooks.modmail?.delete().catch(() => { });
                        break;
                    case 'servergate':
                        await client.config.webhooks.servergate?.delete().catch(() => { });
                        break;
                }
                newWebhook = await channel.createWebhook(constants_1.WEBHOOK_NAMES[module], {
                    avatar: client.user.displayAvatarURL({ extension: 'png' }),
                    reason: '/configure was excuted.',
                });
            }
            if (module && (channel || active !== null)) {
                await config_1.configModel.findByIdAndUpdate('logging', {
                    $set: {
                        logging: {
                            [module]: {
                                channelId: channel
                                    ? channel.id === data.logging[module].channelId
                                        ? data.logging[module].channelId
                                        : channel.id
                                    : data[module].channelId,
                                webhook: channel
                                    ? channel.id === data.logging[module].channelId
                                        ? data.logging[module].webhook
                                        : newWebhook.url
                                    : data.logging[module].webhook,
                                active: active === null ? data.logging[module].active : active,
                            },
                        },
                    },
                });
                await client.config.updateLogs();
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Logging Configuration')
                .setColor(client.cc.ultimates)
                .addFields([
                await formatLogField('mod'),
                await formatLogField('message'),
                await formatLogField('modmail'),
                await formatLogField('servergate'),
            ]);
            await interaction.followUp({ embeds: [embed] });
            // Functions
            async function formatLogField(module) {
                const data = await config_1.configModel.findById('logging');
                let channel = (await client.channels
                    .fetch(data.logging[module].channelId)
                    .catch(() => { }));
                return {
                    name: logsNames[module],
                    value: data.logging[module].webhook
                        ? `${data.logging[module].active
                            ? '<:online:886215547249913856>'
                            : '<:offline:906867114126770186>'} • ${channel ? channel : "The logs channel wasn't found."}`
                        : '<:idle:906867112612601866> • This module is not set, yet...',
                };
            }
        }
        else if (subcommand === 'automod') {
            const module = options.getString('module');
            const active = options.getBoolean('active');
            var data = await config_1.configModel.findById('automod');
            if (!data) {
                const newData = new config_1.configModel({
                    _id: 'automod',
                    filteredWords: [],
                    modules: {
                        badwords: false,
                        invites: false,
                        largeMessage: false,
                        massMention: false,
                        massEmoji: false,
                        spam: false,
                        capitals: false,
                        urls: false,
                    },
                });
                await newData.save();
            }
            data = await config_1.configModel.findById('automod');
            if (module && active !== null) {
                await config_1.configModel.findByIdAndUpdate('automod', {
                    $set: {
                        automod: {
                            modules: {
                                ...(await config_1.configModel.findById('automod')).modules,
                                [module]: active,
                            },
                        },
                    },
                });
                await client.config.updateAutomod();
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('Automod Configuration')
                .setColor(client.cc.ultimates)
                .setDescription([
                await formatDescription('badwords'),
                await formatDescription('invites'),
                await formatDescription('largeMessage'),
                await formatDescription('massMention'),
                await formatDescription('massEmoji'),
                await formatDescription('spam'),
                await formatDescription('capitals'),
                await formatDescription('urls'),
            ].join('\n'));
            if (data.filteredWords.length)
                embed.addFields([
                    {
                        name: 'Filtered Words',
                        value: client.util.splitText(data.filteredWords
                            .map((word) => word.toLowerCase())
                            .join(', '), { splitFor: 'Embed Field Value' }),
                    },
                ]);
            const button = new discord_js_1.ActionRowBuilder().addComponents([
                new discord_js_1.ButtonBuilder()
                    .setLabel('Add filtered words')
                    .setStyle(discord_js_1.ButtonStyle.Secondary)
                    .setCustomId('badwords'),
            ]);
            const sentInteraction = (await interaction.followUp({
                embeds: [embed],
                components: [button],
            }));
            const collector = sentInteraction.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 1000 * 60 * 1,
            });
            collector.on('collect', async (collected) => {
                if (collected.user.id !== interaction.user.id)
                    return collected.reply({
                        content: 'You can not use this.',
                        ephemeral: true,
                    });
                if (collected.customId !== 'badwords')
                    return;
                const modal = new discord_js_1.ModalBuilder()
                    .setTitle('Add filtered words')
                    .setCustomId('add-badwords')
                    .addComponents([
                    {
                        type: discord_js_1.ComponentType.ActionRow,
                        components: [
                            {
                                type: discord_js_1.ComponentType.TextInput,
                                custom_id: 'input',
                                label: 'Separate words with commas',
                                style: discord_js_1.TextInputStyle.Paragraph,
                                required: true,
                                max_length: 4000,
                                min_length: 1,
                                placeholder: 'badword1, frick, pizza, cake - type an existing word to remove it',
                            },
                        ],
                    },
                ]);
                await collected.showModal(modal);
                collector.stop();
            });
            collector.on('end', () => {
                interaction.editReply({ components: [] });
            });
            // Functions
            async function formatDescription(module) {
                const data = await config_1.configModel.findById('automod');
                return `${data.modules[module]
                    ? '<:online:886215547249913856>'
                    : '<:offline:906867114126770186>'} - ${automodModulesNames[module]}`;
            }
        }
        else if (subcommand === 'general') {
            const module = options.getString('module');
            let newvalue = options.getString('new-value');
            let data = await config_1.configModel.findById('general');
            if (!data) {
                const newData = new config_1.configModel({
                    _id: 'general',
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
                });
                await newData.save();
            }
            data = await config_1.configModel.findById('general');
            if (module && newvalue) {
                if (module === 'developers') {
                    const currentDevs = (await config_1.configModel.findById('general')).developers;
                    if (currentDevs.includes(newvalue)) {
                        currentDevs.splice(currentDevs.indexOf(newvalue));
                        newvalue = 'null';
                    }
                    await config_1.configModel.findByIdAndUpdate('general', {
                        $set: {
                            developers: currentDevs.concat([newvalue].filter((value) => value !== 'null')),
                        },
                    });
                }
                else if (module.startsWith('guild')) {
                    await config_1.configModel.findByIdAndUpdate('general', {
                        $set: {
                            guild: {
                                ...(await config_1.configModel.findById('general')).guild,
                                [module.replaceAll('guild_', '')]: newvalue,
                            },
                        },
                    });
                }
                else {
                    await config_1.configModel.findByIdAndUpdate('general', {
                        $set: {
                            [module]: newvalue,
                        },
                    });
                }
                await client.config.updateGeneral();
            }
            data = await config_1.configModel.findById('general');
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle('General Configuration')
                .setColor(client.cc.ultimates)
                .setDescription([
                `• ${discord_js_1.Formatters.bold('Owner')} - ${(await client.users.fetch(data.ownerId).catch(() => { })) || '✖︎'}`,
                `• ${discord_js_1.Formatters.bold('Success')} - ${data.success || '✖︎'}`,
                `• ${discord_js_1.Formatters.bold('Error')} - ${data.error || '✖︎'}`,
                `• ${discord_js_1.Formatters.bold('Attention')} - ${data.attention || '✖︎'}`,
                `• ${discord_js_1.Formatters.bold('Appeal Link')} - ${data.guild.appealLink || '✖︎'}`,
                `• ${discord_js_1.Formatters.bold('Member Role')} - ${data.guild.memberRoleId
                    ? await interaction.guild.roles
                        .fetch(data.guild.memberRoleId)
                        .catch(() => { })
                    : '✖︎'}`,
                `• ${discord_js_1.Formatters.bold('Modmail Category')} - ${data.guild.modmailCategoryId
                    ? await interaction.guild.channels
                        .fetch(data.guild.modmailCategoryId)
                        .catch(() => { })
                    : '✖︎'}`,
                `• ${discord_js_1.Formatters.bold('Developers')} - ${data.developers.length
                    ? data.developers
                        .map((dev) => `${client.users.cache.get(dev)
                        ?.tag === undefined
                        ? `Not found, ID: ${dev}`
                        : client.users.cache.get(dev)
                            ?.tag}`)
                        .join(' `|` ')
                    : 'No developers.'}`,
            ].join('\n'));
            await interaction.followUp({ embeds: [embed] });
        }
    },
});
