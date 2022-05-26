"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateModmailInfoEmbed = void 0;
const __1 = require("..");
async function generateModmailInfoEmbed(user) {
    const guild = __1.client.guilds.cache.get(__1.client.server.id) ||
        (await __1.client.guilds.fetch(__1.client.server.id));
    const guildMember = (await guild.members.fetch(user.id));
    return __1.client.util
        .embed()
        .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL(),
    })
        .setColor(__1.client.colors.ultimates)
        .setDescription(`${user} • ID: ${user.id}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields({
        name: 'Account Information',
        value: [
            `• **Username:** ${user.tag}`,
            `• **ID:** ${user.id}`,
            `• **Registered:** <t:${~~(+user?.createdAt / 1000)}:f> | <t:${~~(+user?.createdAt / 1000)}:R>`,
        ].join('\n'),
    }, {
        name: 'Server Information',
        value: [
            `• **Joined**: <t:${~~(+guildMember.joinedAt / 1000)}:f> | <t:${~~(+guildMember.joinedAt / 1000)}:R>`,
            `• **Nickname**: ${user.username == guildMember.displayName
                ? `No Nickname`
                : guildMember.displayName}`,
        ].join('\n'),
    });
}
exports.generateModmailInfoEmbed = generateModmailInfoEmbed;
