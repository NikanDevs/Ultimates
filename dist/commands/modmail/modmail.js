"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const sourcebin_1 = require("sourcebin");
const messageCreate_1 = require("../../events/modmail/messageCreate");
const ModmailCase_1 = require("../../functions/cases/ModmailCase");
const createModmailLog_1 = require("../../functions/logs/createModmailLog");
const modmail_1 = require("../../models/modmail");
const Command_1 = require("../../structures/Command");
const Modmail_1 = require("../../typings/Modmail");
const generateModmailInfoEmbed_1 = require("../../utils/generateModmailInfoEmbed");
const config_json_1 = require("../../json/config.json");
const interactions_1 = require("../../interactions");
const constants_1 = require("../../constants");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.modmail,
    excute: async ({ client, interaction, options }) => {
        const subCommands = options.getSubcommand();
        const guild = client.guilds.cache.get(config_json_1.guildId) || (await client.guilds.fetch(config_json_1.guildId));
        if (subCommands === 'close') {
            const currentTextChannel = interaction.channel;
            if (currentTextChannel.guildId !== config_json_1.guildId ||
                currentTextChannel.parentId !== client.config.general.guild.modmailCategoryId ||
                currentTextChannel.id === '885266382235795477' ||
                currentTextChannel.id === '880538350740725850')
                return interaction.reply({
                    embeds: [
                        client.embeds.attention('You should run this command in a ticket channel.'),
                    ],
                    ephemeral: true,
                });
            const user = await client.users.fetch(currentTextChannel.topic?.slice(currentTextChannel.topic?.length - client.user.id.length));
            if (!user)
                return interaction.reply({
                    embeds: [client.embeds.error("I wasn't able to find the user.")],
                    ephemeral: true,
                });
            await interaction.deferReply();
            const userId = currentTextChannel.topic.slice(currentTextChannel.topic.length - client.user.id.length);
            let fetchMessages = await interaction.channel.messages.fetch({
                limit: 100,
            });
            fetchMessages = fetchMessages.filter((fetchedMessage) => !fetchedMessage.author.bot || fetchedMessage.author.id === client.user.id);
            let filtered = fetchMessages
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
                .map((msg) => {
                if (msg.author.bot && msg.author.id !== client.user.id)
                    return 'LINE_BREAK';
                if (msg.author.id === client.user.id) {
                    if (!msg.embeds[0]?.author?.url?.endsWith(userId))
                        return 'LINE_BREAK';
                    return `${msg.embeds[0]?.author.name} :: ${msg.embeds[0]?.description || 'No content.'}`;
                }
                else if (!msg.author.bot) {
                    return `${msg?.author?.tag} :: ${msg?.content || 'No content.'}`;
                }
            })
                .join('\n')
                .replaceAll('LINE_BREAK', '');
            const openedTickets = (await modmail_1.modmailModel.findById('substance')).openedTickets;
            const ticketData = openedTickets.find((data) => data.userId === userId);
            const transcript = await (0, sourcebin_1.create)([
                {
                    content: filtered.toString(),
                    language: 'AsciiDoc',
                },
            ], {
                title: `Modmail Transcript`,
                description: `Modmail Transcript for the user: ${user.tag}`,
            });
            (0, createModmailLog_1.createModmailLog)({
                action: Modmail_1.ModmailActionType.Close,
                user: await client.users.fetch(userId),
                moderator: interaction.user,
                referencedCaseUrl: ticketData.url,
                transcript: transcript.url,
                ticketId: ticketData.id,
            });
            await interaction
                .followUp({
                embeds: [
                    client.embeds.attention('This ticket is going to be deleted in 10 seconds...'),
                ],
                components: [],
            })
                .then(() => {
                setTimeout(() => {
                    interaction?.channel?.delete();
                    const closedEmbed = new discord_js_1.EmbedBuilder()
                        .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
                        .setTitle('Ticket closed')
                        .setDescription('Your ticket was closed by a staff member. If you got other questions in the future, feel free to ask them!')
                        .setColor(client.util.resolve.color('Red'));
                    user?.send({ embeds: [closedEmbed] }).catch(() => { });
                    messageCreate_1.modmailCooldown.set(`open_${user?.id}`, Date.now() + 600000);
                    setTimeout(() => {
                        messageCreate_1.modmailCooldown.delete(`open_${user?.id}`);
                    }, 600000);
                }, 10000);
            });
        }
        else if (subCommands === 'blacklist') {
            // Final user
            let user = options.getUser('user');
            const findData = await modmail_1.modmailModel.findById(user.id);
            if (!findData && !options.getString('reason'))
                return interaction.reply({
                    embeds: [client.embeds.attention('You have to provide a reason.')],
                    ephemeral: true,
                });
            if (!findData) {
                const blacklistAdd = new modmail_1.modmailModel({
                    _id: user.id,
                    moderatorId: interaction.id,
                    reason: client.util.splitText(options.getString('reason'), constants_1.MAX_REASON_LENGTH),
                    url: null,
                });
                blacklistAdd.save();
                await interaction.reply({
                    embeds: [
                        client.embeds.success(`**${user.tag}** was added to the modmail blacklist.`),
                    ],
                    components: [],
                });
                (0, createModmailLog_1.createModmailLog)({
                    action: Modmail_1.ModmailActionType.BlacklistAdd,
                    user: user,
                    moderator: interaction.user,
                    reason: client.util.splitText(options.getString('reason'), constants_1.MAX_REASON_LENGTH),
                });
            }
            else if (findData) {
                await findData.delete();
                await interaction.reply({
                    embeds: [
                        client.embeds.success(`**${user.tag}** was removed from the modmail blacklist.`),
                    ],
                    components: [],
                });
                (0, createModmailLog_1.createModmailLog)({
                    action: Modmail_1.ModmailActionType.BlacklistRemove,
                    user: user,
                    moderator: interaction.user,
                    reason: client.util.splitText(options.getString('reason'), constants_1.MAX_REASON_LENGTH),
                    referencedCaseUrl: findData.url,
                });
            }
        }
        else if (subCommands === 'open') {
            const member = options.getMember('user');
            if (!member)
                return interaction.reply({
                    embeds: [client.embeds.error("I couldn't find this user in the server.")],
                    ephemeral: true,
                });
            let canOpen = true;
            // Checking bot
            if (member.user.bot)
                return interaction.reply({
                    embeds: [
                        client.embeds.attention("You can't open modmail threads for bots."),
                    ],
                    ephemeral: true,
                });
            // Checking already exists
            const guildCategory = client.guilds.cache
                .get(config_json_1.guildId)
                .channels.cache.get(client.config.general.guild.modmailCategoryId);
            const findExisting = guildCategory.children.cache.find(
            /* child? sus af */ (child) => child.topic?.slice(child.topic?.length - client.user.id.length) ===
                member.id);
            if (findExisting)
                return interaction.reply({
                    embeds: [
                        client.embeds.attention('Looks like this user already has a ticket opened at ' +
                            findExisting.toString()),
                    ],
                    ephemeral: true,
                });
            // Checking blacklist
            const data = await modmail_1.modmailModel.findById(member.id);
            if (data)
                return interaction.reply({
                    embeds: [
                        client.embeds.attention(`${member.user.tag} is blacklisted from opening modmails.`),
                    ],
                    ephemeral: true,
                });
            const openedModmailEmbed = new discord_js_1.EmbedBuilder()
                .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
                .setTitle('Modmail opened')
                .setColor(client.util.resolve.color('Yellow'))
                .setDescription([
                '**A wild ticket has appeared!**',
                `You've received a direct modmail from a staff member in ${guild.name}. If you're wondering of how this ticket got opened, be patient until the moderator contact from through this ticket.`,
            ].join('\n'));
            if (options?.getString('reason'))
                openedModmailEmbed.addFields([
                    {
                        name: 'Reason',
                        value: options?.getString('reason'),
                    },
                ]);
            member.user
                .send({ embeds: [openedModmailEmbed] })
                .catch(() => {
                canOpen = false;
            })
                .then(async () => {
                switch (canOpen) {
                    case false:
                        interaction.reply({
                            embeds: [
                                client.embeds.error("This user doesn't accept direct messages or has blacked the bot. Could not open the modmail."),
                            ],
                            ephemeral: true,
                        });
                        break;
                    case true:
                        await interaction.reply({
                            embeds: [
                                new discord_js_1.EmbedBuilder({
                                    description: "Please wait while we're trying to set this ticket up...",
                                    color: client.cc.attentionC,
                                }),
                            ],
                        });
                        const threadChannel = await guild.channels.create(member.user.username, {
                            type: discord_js_1.ChannelType.GuildText,
                            parent: client.config.general.guild.modmailCategoryId,
                            topic: `A tunnel to contact **${member.user.username}**, ${interaction.user.username} requested this ticket to be opened using /modmail open | ID: ${member.id}`,
                            reason: `Direct modmail thread opened.`,
                        });
                        await threadChannel.send({
                            embeds: [await (0, generateModmailInfoEmbed_1.generateModmailInfoEmbed)(member.user)],
                        });
                        // Deleting any cooldowns from past
                        messageCreate_1.modmailCooldown.delete(`open_${member.user.id}`);
                        await interaction.editReply({
                            embeds: [
                                client.embeds.success(`Thread was created at ${threadChannel}`),
                            ],
                        });
                        (0, createModmailLog_1.createModmailLog)({
                            action: Modmail_1.ModmailActionType.Open,
                            ticketId: await (0, ModmailCase_1.getModmailTicket)(),
                            user: member.user,
                            moderator: interaction.user,
                            ticket: { type: 'DIRECT', channel: threadChannel },
                            reason: client.util.splitText(options.getString('reason'), constants_1.MAX_REASON_LENGTH),
                        });
                        break;
                }
            });
        }
    },
});
