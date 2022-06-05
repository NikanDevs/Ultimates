"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const Event_1 = require("../../structures/Event");
const leftMembers_1 = require("../../models/leftMembers");
const checkActivity_1 = require("../../functions/logs/checkActivity");
const config_json_1 = require("../../json/config.json");
const discord_js_1 = require("discord.js");
exports.default = new Event_1.Event('guildMemberAdd', async (member) => {
    if (!(0, checkActivity_1.logActivity)('servergate'))
        return;
    if (member.guild.id !== config_json_1.guild.id)
        return;
    // If the member has any previous experience joining the server
    const findData = await leftMembers_1.leftMembersModel.findOne({ userId: member.user.id });
    if (findData) {
        const { roles } = findData;
        await member.roles.set(roles);
        await findData.delete();
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setAuthor({ name: member.guild.name, iconURL: member.guild.iconURL() })
        .setColor(__1.client.util.resolve.color('#529e79'))
        .setDescription([
        `• **Mention:** ${member}\n`,
        `• **User:** ${member.user.tag} • ${member.user.id}`,
        `• **Registered:** <t:${~~(member.user.createdTimestamp / 1000)}:R>`,
        `• **Joined:** <t:${~~(member.joinedTimestamp / 1000)}:R>`,
        `• **Member Count:** ${member.guild.memberCount}`,
        `\n\n${findData ? 'A user has joined back!' : 'A user has joined!'}`,
    ].join('\n'));
    // Sending the member joined message.
    __1.client.config.webhooks.servergate?.send({ embeds: [embed] });
});
