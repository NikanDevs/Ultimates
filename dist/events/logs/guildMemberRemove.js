"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const Event_1 = require("../../structures/Event");
const leftMembers_1 = require("../../models/leftMembers");
const constants_1 = require("../../constants");
const checkActivity_1 = require("../../functions/logs/checkActivity");
const config_json_1 = require("../../json/config.json");
exports.default = new Event_1.Event('guildMemberRemove', async (member) => {
    if (!(0, checkActivity_1.logActivity)('servergate'))
        return;
    if (member.guild.id !== config_json_1.guild.id)
        return;
    const roles = member.roles.cache
        .filter((r) => r.id !== member.guild.id)
        .map((role) => role.id);
    const embed = __1.client.util
        .embed()
        .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
        .setColor(__1.client.util.resolve.color('#b55c4e'))
        .setDescription([
        `• **Mention:** ${member}\n`,
        `• **Member:** ${member.user.tag} • ${member.user.id}`,
        `• **Registered:** <t:${~~(member.user.createdTimestamp / 1000)}:R>`,
        `• **Joined:** <t:${~~(member.joinedTimestamp / 1000)}:R>`,
        `• **Left:** <t:${~~(Date.now() / 1000)}:R>`,
        `• **Member Count:** ${member.guild.memberCount}`,
        '\nThe member has left!',
    ].join('\n'));
    // Saving the roles if the member has any
    if (roles.length !== 0) {
        new leftMembers_1.leftMembersModel({
            userId: member.user.id,
            roles: roles,
            expire: constants_1.leftMemberExpiry,
        }).save();
    }
    // Sending the left message
    __1.client.webhooks.servergate?.send({ embeds: [embed] });
});
