"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lockdowns_1 = require("../../models/lockdowns");
const Command_1 = require("../../structures/Command");
const config_json_1 = require("../../json/config.json");
const lockdown_1 = require("../../interactions/moderation/lockdown");
const messageIdsArray = [];
let messageId;
exports.default = new Command_1.Command({
    interaction: lockdown_1.lockdownCommand,
    excute: async ({ client, interaction, options }) => {
        const getSubCommand = options.getSubcommand();
        if (getSubCommand === 'channel') {
            const channel = (options.getChannel('channel') ||
                interaction.channel);
            const alreadyLocked = channel
                .permissionsFor(config_json_1.guild.memberRoleId)
                .toArray()
                .includes('SendMessages' || 'Connect')
                ? false
                : true;
            const embed = client.util
                .embed()
                .setColor(!alreadyLocked ? client.cc.moderation : client.cc.invisible)
                .setAuthor({
                name: 'Channel ' + (!alreadyLocked ? 'Locked' : 'Unlocked'),
                iconURL: client.user.displayAvatarURL(),
            })
                .setDescription(!alreadyLocked
                ? 'This channel was locked down by a moderator!\nYou are not muted!\n\nPlease be patient until the channel gets unlocked'
                : 'This channel was unlocked by a moderator!\n\nYou can now use the channel, thanks for your patient.');
            if (options.getString('reason'))
                embed.addFields({
                    name: 'Reason',
                    value: options.getString('reason'),
                });
            switch (channel.type) {
                case discord_js_1.ChannelType.GuildText:
                    await channel.permissionOverwrites.edit(config_json_1.guild.memberRoleId, {
                        SendMessages: alreadyLocked ? null : false,
                        SendMessagesInThreads: alreadyLocked ? null : false,
                        CreatePrivateThreads: alreadyLocked ? null : false,
                        CreatePublicThreads: alreadyLocked ? null : false,
                    });
                    if (!alreadyLocked) {
                        var msg = (await channel.send({
                            embeds: [embed],
                        }));
                        messageId = msg.id;
                    }
                    break;
                case discord_js_1.ChannelType.GuildVoice:
                case discord_js_1.ChannelType.GuildStageVoice:
                    if (!alreadyLocked) {
                        await channel.permissionOverwrites.edit(config_json_1.guild.memberRoleId, {
                            Connect: false,
                        });
                    }
                    else if (alreadyLocked) {
                        await channel.permissionOverwrites.edit(config_json_1.guild.memberRoleId, {
                            SendMessages: true,
                        });
                    }
                    break;
                default:
                    return interaction.reply({
                        embeds: [
                            client.embeds.attention('You can only lock text, voice and stage channels.'),
                        ],
                        ephemeral: true,
                    });
            }
            await interaction.reply({
                embeds: [
                    client.embeds.success(`${channel} was ${!alreadyLocked ? 'locked' : 'unlocked'}.`),
                ],
            });
            if (!alreadyLocked) {
                var data = new lockdowns_1.lockdownsModel({
                    type: 'CHANNEL',
                    channelId: channel.id,
                    messageId: messageId,
                });
                await data.save();
            }
            else if (alreadyLocked) {
                const data = await lockdowns_1.lockdownsModel.findOne({
                    type: 'CHANNEL',
                    channelId: channel.id,
                });
                if (!data)
                    channel.send({ embeds: [embed] });
                const getMessage = (await channel.messages
                    .fetch(data.messageId)
                    .catch(() => { }));
                getMessage.edit({
                    embeds: [embed],
                });
                await data.delete();
            }
        }
        else if (getSubCommand === 'server') {
            await interaction.deferReply();
            const generalChannel = (await interaction.guild.channels.fetch(config_json_1.guild.generalChannelId));
            const alreadyLocked = generalChannel
                .permissionsFor(config_json_1.guild.memberRoleId)
                .toArray()
                .includes('SendMessages')
                ? false
                : true;
            (await interaction.guild.channels.fetch())
                .filter((ch) => ch.type === discord_js_1.ChannelType.GuildText ||
                ch.type === discord_js_1.ChannelType.GuildVoice ||
                ch.type === discord_js_1.ChannelType.GuildStageVoice)
                .filter((ch) => ch
                .permissionsFor(config_json_1.guild.memberRoleId)
                .toArray()
                .includes('ViewChannel'))
                .filter((ch) => !alreadyLocked
                ? ch
                    .permissionsFor(interaction.guild.roles.everyone)
                    .toArray()
                    .includes('SendMessages')
                : true)
                .forEach(async (ch) => {
                switch (ch.type) {
                    case discord_js_1.ChannelType.GuildText:
                        await ch.permissionOverwrites.edit(config_json_1.guild.memberRoleId, {
                            SendMessages: alreadyLocked ? null : false,
                            SendMessagesInThreads: alreadyLocked ? null : false,
                            CreatePrivateThreads: alreadyLocked ? null : false,
                            CreatePublicThreads: alreadyLocked ? null : false,
                        });
                        if (ch.id !== generalChannel.id)
                            messageIdsArray.push({ channelId: ch.id, messageId: null });
                        break;
                    case discord_js_1.ChannelType.GuildVoice:
                    case discord_js_1.ChannelType.GuildStageVoice:
                        await ch.permissionOverwrites.edit(config_json_1.guild.memberRoleId, {
                            Connect: alreadyLocked ? null : false,
                        });
                        break;
                }
            });
            const embed = client.util
                .embed()
                .setColor(!alreadyLocked ? client.cc.moderation : client.cc.invisible)
                .setAuthor({
                name: 'Server ' + (!alreadyLocked ? 'Locked' : 'Unlocked'),
                iconURL: client.user.displayAvatarURL(),
            })
                .setDescription(!alreadyLocked
                ? 'This server was locked down by a moderator!\nYou are not muted!\n\nPlease be patient until the server gets unlocked'
                : 'This server was unlocked by a moderator!\n\nYou can now use it, thanks for your patient.');
            if (options.getString('reason'))
                embed.addFields({
                    name: 'Reason',
                    value: options.getString('reason'),
                });
            generalChannel.send({
                embeds: [embed],
            });
            await interaction.followUp({
                embeds: [
                    client.embeds.success(`${interaction.guild.name} was ${!alreadyLocked ? 'locked' : 'unlocked'}.`),
                ],
            });
            // Sending messages in all needed channels.
            if (!alreadyLocked) {
                var count = 0;
                messageIdsArray
                    .filter((ch) => ch.channelId !== interaction.channelId)
                    .forEach(async (data, _index, array) => {
                    const getChannel = interaction.guild.channels.cache.get(data.channelId);
                    var msg = (await getChannel.send({
                        content: `This server is currently on a lockdown, visit ${generalChannel} for more information!`,
                    }));
                    data.messageId = msg.id;
                    count++;
                    if (count === array.length)
                        saveInDB();
                });
                function saveInDB() {
                    const data = new lockdowns_1.lockdownsModel({
                        type: 'SERVER',
                        messagesArray: messageIdsArray,
                    });
                    data.save();
                }
            }
            else if (alreadyLocked) {
                const findData = await lockdowns_1.lockdownsModel.findOne({ type: 'SERVER' });
                if (!findData)
                    return;
                const array = findData.messagesArray;
                let count = 0;
                array.forEach(async (data, _index, array) => {
                    const getChannel = (await interaction.guild.channels
                        .fetch(data.channelId)
                        .catch(() => { }));
                    const getMessage = (await getChannel.messages
                        .fetch(data.messageId)
                        .catch(() => { }));
                    getMessage?.delete().catch(() => { });
                    count++;
                    if (count === array.length)
                        await findData.delete();
                });
            }
        }
    },
});
