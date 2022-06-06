"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modmailCooldown = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const modmail_1 = require("../../models/modmail");
const Event_1 = require("../../structures/Event");
const createModmailLog_1 = require("../../functions/logs/createModmailLog");
const Modmail_1 = require("../../typings/Modmail");
const ModmailCase_1 = require("../../functions/cases/ModmailCase");
const generateModmailInfoEmbed_1 = require("../../utils/generateModmailInfoEmbed");
const config_json_1 = require("../../json/config.json");
const convertTime_1 = require("../../functions/convertTime");
exports.modmailCooldown = new discord_js_1.Collection();
let confirmationExists = false;
let canDM = true;
let canSend = true;
exports.default = new Event_1.Event('messageCreate', async (message) => {
    const guild = __1.client.guilds.cache.get(config_json_1.guild.id) ||
        (await __1.client.guilds.fetch(config_json_1.guild.id));
    if (!message?.guild && message.channel.type === discord_js_1.ChannelType.DM && !message.author?.bot) {
        // Checking for blacklist
        const data = await modmail_1.modmailModel.findById(message.author.id);
        const blacklistedEmbed = new discord_js_1.EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
            .setTitle('Blacklisted from using modmail')
            .setDescription([
            'Sorry, but looks like you were blacklisted from using the modmail.',
            "If you think that this is not fair and you don't deserve it, please contact a moderator!",
        ].join('\n'))
            .addFields([{ name: 'Reason', value: `${data?.reason}` }])
            .setColor(__1.client.cc.errorC);
        if (data)
            return message.channel?.send({
                embeds: [blacklistedEmbed],
            });
        if (confirmationExists === true)
            return message.channel.send({
                content: 'Please accept or cancel the existing confirmation.',
            });
        // Checking for cooldowns
        const getOpenCooldownRamaining = `${~~(exports.modmailCooldown.get(`open_${message.author.id}`) - Date.now())}`;
        if (exports.modmailCooldown.has(`open_${message.author.id}`))
            return message.channel.send({
                content: `You need to wait **${(0, convertTime_1.convertTime)(+getOpenCooldownRamaining)}** to open a ticket again.`,
            });
        if (exports.modmailCooldown.has(`send-message_${message.author.id}`))
            return;
        const openedThread = guild.channels.cache
            .filter((channel) => channel.parentId === __1.client.config.general.guild.modmailCategoryId &&
            channel.type === discord_js_1.ChannelType.GuildText)
            .find((channel) => channel?.topic?.endsWith(message.author.id));
        if (openedThread) {
            if (__1.client.config.automod.filteredWords.some((word) => message.content.toLowerCase().includes(word)))
                return message.reply({
                    content: "You're not allowed to use this word in modmails.",
                });
            exports.modmailCooldown.set(`send-message_${message.author.id}`, Date.now() + 500);
            setTimeout(() => {
                exports.modmailCooldown.delete(`send-message_${message.author.id}`);
            }, 500);
            const finalEmbeds = [];
            const toSendEmbed = new discord_js_1.EmbedBuilder()
                .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL(),
                url: `https://discord.com/users/${message.author.id}`,
            })
                .setImage(message.attachments?.first()?.proxyURL)
                .setColor(__1.client.cc.ultimates);
            if (message.content)
                toSendEmbed.setDescription(message.content);
            finalEmbeds.push(toSendEmbed);
            if (message.attachments?.size > 1) {
                let attachmentCounter = 2;
                message.attachments
                    ?.map((attach) => attach)
                    .slice(1, message.attachments?.size)
                    .forEach((attachment) => {
                    const attachmentEmbed = new discord_js_1.EmbedBuilder()
                        .setAuthor({ name: `Attachment #${attachmentCounter}` })
                        .setImage(attachment.proxyURL)
                        .setColor(__1.client.util.resolve.color('Orange'));
                    finalEmbeds.push(attachmentEmbed);
                    attachmentCounter = attachmentCounter + 1;
                });
            }
            openedThread
                .send({ embeds: finalEmbeds })
                .catch(() => {
                canSend = false;
            })
                .then(async () => {
                switch (canSend) {
                    case true:
                        await message.react(__1.client.config.general.success);
                        break;
                    case false:
                        await message.react(__1.client.config.general.error);
                        await message.reply({
                            content: 'Something went wrong while trying to send your message, try again!',
                        });
                        break;
                }
                canSend = true;
            });
        }
        else if (!openedThread) {
            const confirmationEmbed = new discord_js_1.EmbedBuilder()
                .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
                .setTitle('Are you sure that you want to create a ticket?')
                .setColor(__1.client.cc.ultimates)
                .setDescription([
                `Confirming this message creates a tunnel between you and **${guild.name}** staff members.`,
                'Please consider creating a ticket if you have an important question or you need support!',
            ].join(' '));
            let msg = await message.channel.send({
                embeds: [confirmationEmbed],
                components: [__1.client.util.build.confirmationButtons('Create', 'Cancel')],
            });
            confirmationExists = true;
            const confirmationColloctor = msg.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 30000,
                filter: (msg) => msg.user.id === message.author.id,
            });
            confirmationColloctor.on('collect', async (collected) => {
                collected.deferUpdate();
                switch (collected.customId) {
                    // If the person choice is cancel
                    case '2':
                        confirmationColloctor.stop('fail');
                        break;
                    // If the person choice is create
                    case '1':
                        confirmationColloctor.stop('success');
                        await msg.edit({
                            content: 'Please wait...',
                            embeds: [],
                            components: [],
                        });
                        const threadChannel = await guild.channels.create(message.author.username, {
                            type: discord_js_1.ChannelType.GuildText,
                            parent: __1.client.config.general.guild.modmailCategoryId,
                            topic: `A tunnel to contact **${message.author.username}**, they requested this ticket to be opened through DMs. | ID: ${message.author.id}`,
                            reason: `Modmail ticket open request.`,
                        });
                        await threadChannel.send({
                            embeds: [await (0, generateModmailInfoEmbed_1.generateModmailInfoEmbed)(message.author)],
                        });
                        (0, createModmailLog_1.createModmailLog)({
                            action: Modmail_1.ModmailActionType.Open,
                            user: message.author,
                            ticket: {
                                type: 'REQUEST',
                                channel: threadChannel,
                            },
                            ticketId: await (0, ModmailCase_1.getModmailTicket)(),
                        });
                        // Thread Created
                        const createdEmbed = new discord_js_1.EmbedBuilder()
                            .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
                            .setTitle('Ticket created')
                            .setColor(__1.client.util.resolve.color('Green'))
                            .setDescription([
                            'The ticket you requested has been created.',
                            'Please consider asking your question and wait for a staff member to respond.',
                            `\n• If your message wasn't reacted with ${__1.client.cc.successC}, it was not sent.`,
                        ].join('\n'));
                        msg?.delete();
                        message.author.send({ embeds: [createdEmbed] });
                        break;
                }
            });
            confirmationColloctor.on('end', (_, reason) => {
                confirmationExists = false;
                if (reason == 'success')
                    return;
                msg?.delete();
            });
        }
    }
    else if (message?.guild &&
        message.channel.type === discord_js_1.ChannelType.GuildText &&
        !message.author?.bot &&
        message.channel.parentId === __1.client.config.general.guild.modmailCategoryId) {
        const channelTopic = message.channel.topic;
        const usersThread = guild.members.cache.find((user) => user.id === channelTopic.slice(channelTopic.length - user.id.length));
        if (!usersThread)
            return message.channel.send({
                content: 'The user was not found.',
            });
        const finalEmbeds = [];
        const toSendEmbed = new discord_js_1.EmbedBuilder()
            .setAuthor({
            name: 'Staff Member',
            iconURL: 'https://cdn.discordapp.com/attachments/870637449158742057/909825851225427978/staff-icon.png',
        })
            .setImage(message.attachments?.first()?.proxyURL)
            .setColor(__1.client.cc.ultimates);
        if (message.content)
            toSendEmbed.setDescription(message.content);
        finalEmbeds.push(toSendEmbed);
        if (message.attachments?.size > 1) {
            let attachmentCounter = 2;
            message.attachments
                ?.map((attach) => attach)
                .slice(1, message.attachments?.size)
                .forEach((attachment) => {
                const attachmentEmbed = new discord_js_1.EmbedBuilder()
                    .setAuthor({ name: `Attachment #${attachmentCounter}` })
                    .setImage(attachment.proxyURL)
                    .setColor(__1.client.util.resolve.color('Orange'));
                finalEmbeds.push(attachmentEmbed);
                attachmentCounter = attachmentCounter + 1;
            });
        }
        usersThread
            .send({ embeds: finalEmbeds })
            ?.catch(() => {
            canDM = false;
        })
            .then(async () => {
            switch (canDM) {
                case true:
                    await message.react(__1.client.config.general.success);
                    break;
                case false:
                    await message.react(__1.client.config.general.error);
                    await message.reply({
                        content: "I wasn't able to DM the user.",
                    });
                    break;
            }
            canDM = true;
        });
    }
});
