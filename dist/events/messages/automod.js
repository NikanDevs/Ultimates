"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const constants_1 = require("../../constants");
const Event_1 = require("../../structures/Event");
const automod_json_1 = require("../../json/automod.json");
const automod_1 = require("../../models/automod");
const constants_2 = require("../../constants");
const PunishmentType_1 = require("../../typings/PunishmentType");
const generatePunishmentId_1 = require("../../utils/generatePunishmentId");
const modCase_1 = require("../../functions/cases/modCase");
const createModLog_1 = require("../../functions/logs/createModLog");
const timeoutMember_1 = require("../../utils/timeoutMember");
const sendModDM_1 = require("../../utils/sendModDM");
const config_json_1 = require("../../json/config.json");
const convertTime_1 = require("../../functions/convertTime");
const bypassRoleId = automod_json_1.ignore['bypass-roleId'];
const categoryIgnores = automod_json_1.ignore['categoryIds'];
const channelIgnores = automod_json_1.ignore['channelNames'];
const roleIgnores = automod_json_1.ignore['roleIds'];
const permissionIgnores = automod_json_1.ignore['permissions'];
exports.default = new Event_1.Event('messageCreate', async (message) => {
    const guildMember = message.member;
    const textChannel = message.channel;
    // Main Reqs
    if (!message.guild ||
        message.guildId !== config_json_1.guild.id ||
        message.author.bot ||
        !message.content ||
        guildMember.roles.cache.has(bypassRoleId))
        return;
    // Spam Collector
    if (automod_json_1.enabledModules.spam && !(await getsIgnored('spam'))) {
        switch (constants_2.automodSpamCollection.get(message.author.id)) {
            case undefined:
                constants_2.automodSpamCollection.set(message.author.id, 1);
                break;
            default:
                const currectCount = constants_2.automodSpamCollection.get(message.author.id);
                constants_2.automodSpamCollection.set(message.author.id, currectCount + 1);
                setTimeout(() => {
                    switch (currectCount) {
                        case undefined:
                            break;
                        case 1:
                            constants_2.automodSpamCollection.delete(message.author.id);
                            break;
                        default:
                            constants_2.automodSpamCollection.set(message.author.id, currectCount - 1);
                            break;
                    }
                }, 2000);
                break;
        }
    }
    if (message.content.length > 550 &&
        automod_json_1.enabledModules['large-message'] &&
        !(await getsIgnored('large-message'))) {
        message?.delete();
        textChannel
            .send({
            content: `${message.author} you may not send large messages here.`,
            allowedMentions: { parse: ['users'] },
        })
            .then((msg) => setTimeout(() => {
            msg?.delete();
        }, 7000));
        const data = new automod_1.automodModel({
            _id: (0, generatePunishmentId_1.generateAutomodId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: message.author.id,
            reason: reasons['large-message'],
            date: new Date(),
            expire: constants_1.automodPunishmentExpiry,
        });
        await data.save();
        (0, sendModDM_1.sendModDM)(message.member, {
            action: PunishmentType_1.PunishmentType.Warn,
            punishment: data,
            expire: constants_1.automodPunishmentExpiry,
            automod: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: data._id,
            user: message.author,
            moderator: __1.client.user,
            reason: reasons['large-message'],
            expire: constants_1.automodPunishmentExpiry,
        }).then(() => checkForAutoPunish(data));
    }
    else if (isDiscordInvite(message.content) &&
        automod_json_1.enabledModules.invites &&
        !(await getsIgnored('invites'))) {
        message?.delete();
        textChannel
            .send({
            content: `${message.author} you may not send discord invites here.`,
            allowedMentions: { parse: ['users'] },
        })
            .then((msg) => setTimeout(() => {
            msg?.delete();
        }, 7000));
        const data = new automod_1.automodModel({
            _id: (0, generatePunishmentId_1.generateAutomodId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: message.author.id,
            reason: reasons['invites'],
            date: new Date(),
            expire: constants_1.automodPunishmentExpiry,
        });
        await data.save();
        (0, sendModDM_1.sendModDM)(message.member, {
            action: PunishmentType_1.PunishmentType.Warn,
            punishment: data,
            expire: constants_1.automodPunishmentExpiry,
            automod: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: data._id,
            user: message.author,
            moderator: __1.client.user,
            reason: reasons['invites'],
            expire: constants_1.automodPunishmentExpiry,
        }).then(() => checkForAutoPunish(data));
    }
    else if (isURL(message.content) && automod_json_1.enabledModules.urls && !(await getsIgnored('urls'))) {
        message?.delete();
        textChannel
            .send({
            content: `${message.author} you may not send links and urls.`,
            allowedMentions: { parse: ['users'] },
        })
            .then((msg) => setTimeout(() => {
            msg?.delete();
        }, 7000));
        const data = new automod_1.automodModel({
            _id: (0, generatePunishmentId_1.generateAutomodId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: message.author.id,
            reason: reasons['urls'],
            date: new Date(),
            expire: constants_1.automodPunishmentExpiry,
        });
        await data.save();
        (0, sendModDM_1.sendModDM)(message.member, {
            action: PunishmentType_1.PunishmentType.Warn,
            punishment: data,
            expire: constants_1.automodPunishmentExpiry,
            automod: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: data._id,
            user: message.author,
            moderator: __1.client.user,
            reason: reasons['urls'],
            expire: constants_1.automodPunishmentExpiry,
        }).then(() => checkForAutoPunish(data));
    }
    else if (message.mentions?.members.size > 4 &&
        automod_json_1.enabledModules['mass-mention'] &&
        !(await getsIgnored('mass-mention'))) {
        message?.delete();
        textChannel
            .send({
            content: `${message.author} you may not mention more than 4 people.`,
            allowedMentions: { parse: ['users'] },
        })
            .then((msg) => setTimeout(() => {
            msg?.delete();
        }, 7000));
        const data = new automod_1.automodModel({
            _id: (0, generatePunishmentId_1.generateAutomodId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: message.author.id,
            reason: reasons['mass-mention'],
            date: new Date(),
            expire: constants_1.automodPunishmentExpiry,
        });
        await data.save();
        (0, sendModDM_1.sendModDM)(message.member, {
            action: PunishmentType_1.PunishmentType.Warn,
            punishment: data,
            expire: constants_1.automodPunishmentExpiry,
            automod: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: data._id,
            user: message.author,
            moderator: __1.client.user,
            reason: reasons['mass-mention'],
            expire: constants_1.automodPunishmentExpiry,
        }).then(() => checkForAutoPunish(data));
    }
    else if (mostIsCap(message.content) &&
        automod_json_1.enabledModules.capitals &&
        !(await getsIgnored('capitals'))) {
        message?.delete();
        textChannel
            .send({
            content: `${message.author} you may not use this many capital letters.`,
            allowedMentions: { parse: ['users'] },
        })
            .then((msg) => setTimeout(() => {
            msg?.delete();
        }, 7000));
        const data = new automod_1.automodModel({
            _id: (0, generatePunishmentId_1.generateAutomodId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: message.author.id,
            reason: reasons['capitals'],
            date: new Date(),
            expire: constants_1.automodPunishmentExpiry,
        });
        await data.save();
        (0, sendModDM_1.sendModDM)(message.member, {
            action: PunishmentType_1.PunishmentType.Warn,
            punishment: data,
            expire: constants_1.automodPunishmentExpiry,
            automod: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: data._id,
            user: message.author,
            moderator: __1.client.user,
            reason: reasons['capitals'],
            expire: constants_1.automodPunishmentExpiry,
        }).then(() => checkForAutoPunish(data));
    }
    else if (mostIsEmojis(message.content) &&
        automod_json_1.enabledModules['mass-emoji'] &&
        !(await getsIgnored('mass-emoji'))) {
        message?.delete();
        textChannel
            .send({
            content: `${message.author} you may not use this many emojis.`,
            allowedMentions: { parse: ['users'] },
        })
            .then((msg) => setTimeout(() => {
            msg?.delete();
        }, 7000));
        const data = new automod_1.automodModel({
            _id: (0, generatePunishmentId_1.generateAutomodId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: message.author.id,
            reason: reasons['mass-emoji'],
            date: new Date(),
            expire: constants_1.automodPunishmentExpiry,
        });
        await data.save();
        (0, sendModDM_1.sendModDM)(message.member, {
            action: PunishmentType_1.PunishmentType.Warn,
            punishment: data,
            expire: constants_1.automodPunishmentExpiry,
            automod: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: data._id,
            user: message.author,
            moderator: __1.client.user,
            reason: reasons['mass-emoji'],
            expire: constants_1.automodPunishmentExpiry,
        }).then(() => checkForAutoPunish(data));
    }
    else if (automod_json_1.badwords.some((word) => message.content.toUpperCase().includes(word)) &&
        automod_json_1.enabledModules.badwords &&
        !(await getsIgnored('badwords'))) {
        message?.delete();
        textChannel
            .send({
            content: `${message.author} you may not use that word in the chat.`,
            allowedMentions: { parse: ['users'] },
        })
            .then((msg) => setTimeout(() => {
            msg?.delete();
        }, 7000));
        const data = new automod_1.automodModel({
            _id: (0, generatePunishmentId_1.generateAutomodId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: message.author.id,
            reason: reasons['badwords'],
            date: new Date(),
            expire: constants_1.automodPunishmentExpiry,
        });
        await data.save();
        (0, sendModDM_1.sendModDM)(message.member, {
            action: PunishmentType_1.PunishmentType.Warn,
            punishment: data,
            expire: constants_1.automodPunishmentExpiry,
            automod: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: data._id,
            user: message.author,
            moderator: __1.client.user,
            reason: reasons['badwords'],
            expire: constants_1.automodPunishmentExpiry,
        }).then(() => checkForAutoPunish(data));
    }
    else if (constants_2.automodSpamCollection.get(message.author.id) === automod_json_1.amounts['spam_count'] &&
        automod_json_1.enabledModules.spam &&
        !(await getsIgnored('spam'))) {
        constants_2.automodSpamCollection.delete(message.author.id);
        let sentMessage = (await textChannel.send({
            content: `${message.author} you may not send messages this quick.`,
            allowedMentions: { parse: ['users'] },
        }));
        setTimeout(() => {
            sentMessage?.delete();
        }, 7000);
        var fetchMessage = await textChannel.messages.fetch({ limit: 9, before: message.id });
        var filteredMessage = fetchMessage.filter((msg) => !msg.pinned && msg.author.id === message.author.id);
        await textChannel.bulkDelete(filteredMessage, true);
        const data = new automod_1.automodModel({
            _id: (0, generatePunishmentId_1.generateAutomodId)(),
            case: await (0, modCase_1.getModCase)(),
            type: PunishmentType_1.PunishmentType.Warn,
            userId: message.author.id,
            reason: reasons['spam'],
            date: new Date(),
            expire: constants_1.automodPunishmentExpiry,
        });
        await data.save();
        (0, sendModDM_1.sendModDM)(message.member, {
            action: PunishmentType_1.PunishmentType.Warn,
            punishment: data,
            expire: constants_1.automodPunishmentExpiry,
            automod: true,
        });
        await (0, createModLog_1.createModLog)({
            action: PunishmentType_1.PunishmentType.Warn,
            punishmentId: data._id,
            user: message.author,
            moderator: __1.client.user,
            reason: reasons['spam'],
            expire: constants_1.automodPunishmentExpiry,
        }).then(() => checkForAutoPunish(data));
    }
    // Functions
    async function getsIgnored(type) {
        if (channelIgnores[type.toString()].includes(textChannel.name) ||
            categoryIgnores[type.toString()].includes(textChannel.parentId) ||
            roleIgnores[type.toString()].some((roleId) => guildMember.roles.cache.get(roleId)) ||
            permissionIgnores[type.toString()].some((permission) => guildMember.permissions.has(permission)))
            return true;
        else
            return false;
    }
    async function checkForAutoPunish(warnData) {
        const punishmentFind = await automod_1.automodModel.find({
            userId: message.author.id,
            type: PunishmentType_1.PunishmentType.Warn,
        });
        const punishmentCount = punishmentFind.length;
        if (punishmentCount == 2) {
            const timeoutDurationAt2 = +(0, convertTime_1.convertTime)(automod_json_1.amounts.timeoutDurationAt2Warns);
            await (0, timeoutMember_1.timeoutMember)(message.member, {
                reason: 'Reaching 2 automod warnings.',
                duration: timeoutDurationAt2,
            });
            const data = new automod_1.automodModel({
                _id: (0, generatePunishmentId_1.generateAutomodId)(),
                case: await (0, modCase_1.getModCase)(),
                type: PunishmentType_1.PunishmentType.Timeout,
                userId: message.author.id,
                date: new Date(),
                expire: constants_1.automodPunishmentExpiry,
                reason: 'Reaching 2 automod warnings.',
            });
            data.save();
            (0, sendModDM_1.sendModDM)(message.member, {
                action: PunishmentType_1.PunishmentType.Timeout,
                punishment: data,
                expire: new Date(Date.now() + timeoutDurationAt2),
                automod: true,
            });
            await (0, createModLog_1.createModLog)({
                action: PunishmentType_1.PunishmentType.Timeout,
                punishmentId: data._id,
                user: message.author,
                moderator: __1.client.user,
                duration: timeoutDurationAt2,
                reason: 'Reaching 2 automod warnings.',
                referencedPunishment: warnData,
                expire: constants_1.automodPunishmentExpiry,
            });
        }
        else if (punishmentCount > 2) {
            const timeoutDurationAtmore2 = +(0, convertTime_1.convertTime)(automod_json_1.amounts['timeoutDurationAt+2Warns']);
            await (0, timeoutMember_1.timeoutMember)(message.member, {
                reason: `Reaching ${punishmentCount} automod warnings.`,
                duration: timeoutDurationAtmore2,
            });
            const data = new automod_1.automodModel({
                _id: (0, generatePunishmentId_1.generateAutomodId)(),
                case: await (0, modCase_1.getModCase)(),
                type: PunishmentType_1.PunishmentType.Timeout,
                userId: message.author.id,
                date: new Date(),
                expire: constants_1.automodPunishmentExpiry,
                reason: `Reaching ${punishmentCount} automod warnings.`,
            });
            data.save();
            await (0, sendModDM_1.sendModDM)(message.member, {
                action: PunishmentType_1.PunishmentType.Timeout,
                punishment: data,
                expire: new Date(Date.now() + timeoutDurationAtmore2),
                automod: true,
            });
            await (0, createModLog_1.createModLog)({
                action: PunishmentType_1.PunishmentType.Timeout,
                punishmentId: data._id,
                user: message.author,
                moderator: __1.client.user,
                duration: timeoutDurationAtmore2,
                reason: `Reaching ${punishmentCount} automod warnings.`,
                referencedPunishment: warnData,
                expire: constants_1.automodPunishmentExpiry,
            });
        }
    }
});
// Functions
function isDiscordInvite(str) {
    var res = str.match(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?pp?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/);
    return res !== null;
}
function isURL(str) {
    var res = str.match(/(?:https?:\/\/)(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/gi);
    return res !== null;
}
function mostIsCap(str) {
    if (str.length <= 30)
        return false;
    const capitals = [], nonCapitals = [], allStr = str
        .replaceAll(' ', '')
        .split('')
        .filter((foo) => foo.match(/^[A-Za-z]+$/));
    if (!allStr)
        return false;
    allStr.forEach((str) => {
        if (str === str.toUpperCase())
            capitals.push(str);
        else if (str === str.toLowerCase())
            nonCapitals.push(str);
    });
    if (capitals.length > nonCapitals.length) {
        if ((capitals.length / nonCapitals.length) * 100 > automod_json_1.amounts['max_caps_percentage'])
            return true;
        else
            return false;
    }
    else
        return false;
}
function mostIsEmojis(str) {
    const countEmojis = [];
    for (const rawStr of str.trim().split(/ +/g)) {
        const parseEmoji = discord_js_1.Util.parseEmoji(rawStr);
        if (parseEmoji?.id)
            countEmojis.push(rawStr);
    }
    if (countEmojis.length > automod_json_1.amounts['max_emoji']) {
        return true;
    }
    else {
        return false;
    }
}
var reasons;
(function (reasons) {
    reasons["badwords"] = "Sending filtered words in the chat.";
    reasons["invites"] = "Sending discord invite links in the chat.";
    reasons["large-message"] = "Sending a large message in content.";
    reasons["mass-mention"] = "Mentioning more than 4 people.";
    reasons["mass-emoji"] = "Sending too many emojis at once.";
    reasons["spam"] = "Sending messages too quickly.";
    reasons["capitals"] = "Using too many capital letters.";
    reasons["urls"] = "Sending links and urls.";
})(reasons || (reasons = {}));
