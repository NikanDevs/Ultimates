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
const config = __1.client.config.automod;
const bypassRoleId = automod_json_1.ignore['bypass-roleId'];
const categoryIgnores = automod_json_1.ignore['categoryIds'];
const channelIgnores = automod_json_1.ignore['channelNames'];
const roleIgnores = automod_json_1.ignore['roleIds'];
const permissionIgnores = automod_json_1.ignore['permissions'];
exports.default = new Event_1.Event('messageCreate', async (message) => {
    const member = message.member;
    const textChannel = message.channel;
    // Main Reqs
    if (!message.guild ||
        message.guildId !== config_json_1.guild.id ||
        message.author.bot ||
        !message.content ||
        member.roles.cache.has(bypassRoleId))
        return;
    // Spam Collector
    if (config.modules.spam && !getsIgnored('spam')) {
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
        config.modules.largeMessage &&
        !getsIgnored('large-message')) {
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
        config.modules.invites &&
        !getsIgnored('invites')) {
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
    else if (isURL(message.content) && config.modules.urls && !getsIgnored('urls')) {
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
        config.modules.massMention &&
        !getsIgnored('mass-mention')) {
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
    else if (mostIsCap(message.content) && config.modules.capitals && !getsIgnored('capitals')) {
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
        config.modules.massEmoji &&
        !getsIgnored('mass-emoji')) {
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
    else if (config.filteredWords.some((word) => message.content.toUpperCase().includes(word)) &&
        config.modules.badwords &&
        !getsIgnored('badwords')) {
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
    else if (constants_2.automodSpamCollection.get(message.author.id) === constants_1.AUTOMOD_SPAM_COUNT &&
        config.modules.spam &&
        !getsIgnored('spam')) {
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
    function getsIgnored(type) {
        if (member.permissions?.has('Administrator') ||
            channelIgnores[type.toString()].includes(textChannel.name) ||
            categoryIgnores[type.toString()].includes(textChannel.parentId) ||
            roleIgnores[type.toString()].some((roleId) => member.roles.cache.get(roleId)) ||
            permissionIgnores[type.toString()].some((permission) => member.permissions.has(permission)))
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
        if (punishmentCount % __1.client.config.moderation.count.automod === 0) {
            await (0, timeoutMember_1.timeoutMember)(message.member, {
                reason: `Reaching ${punishmentCount} automod warnings.`,
                duration: __1.client.config.moderation.duration.automod,
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
            (0, sendModDM_1.sendModDM)(message.member, {
                action: PunishmentType_1.PunishmentType.Timeout,
                punishment: data,
                expire: new Date(Date.now() + __1.client.config.moderation.duration.automod),
                automod: true,
            });
            await (0, createModLog_1.createModLog)({
                action: PunishmentType_1.PunishmentType.Timeout,
                punishmentId: data._id,
                user: message.author,
                moderator: __1.client.user,
                duration: __1.client.config.moderation.duration.automod,
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
        if ((capitals.length / nonCapitals.length) * 100 > constants_1.AUTOMOD_MAX_CAPS)
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
    if (countEmojis.length > constants_1.AUTOMOD_MAX_EMOJI_COUNT) {
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
