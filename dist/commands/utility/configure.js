"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
            const data = await config_1.configModel.findById('logs');
            if (!data) {
                const newData = new config_1.configModel({
                    _id: 'logs',
                    mod: { channelId: null, webhook: null, active: null },
                    modmail: { channelId: null, webhook: null, active: null },
                    message: { channelId: null, webhook: null, active: null },
                    servergate: { channelId: null, webhook: null, active: null },
                    error: { channelId: null, webhook: null, active: null },
                });
                await newData.save();
            }
            if (channel && channel?.id !== data.channelId) {
                switch (module) {
                    case 'mod':
                        await client.webhooks.mod?.delete().catch(() => { });
                        break;
                    case 'message':
                        await client.webhooks.message?.delete().catch(() => { });
                        break;
                    case 'modmail':
                        await client.webhooks.modmail?.delete().catch(() => { });
                        break;
                    case 'servergate':
                        await client.webhooks.servergate?.delete().catch(() => { });
                        break;
                }
                newWebhook = await channel.createWebhook(constants_1.WEBHOOK_NAMES[module], {
                    avatar: client.user.displayAvatarURL({ extension: 'png' }),
                    reason: '/configure was excuted.',
                });
            }
            if (module && (channel || active !== null)) {
                await config_1.configModel.findByIdAndUpdate({ _id: 'logs' }, {
                    $set: {
                        [module]: {
                            channelId: channel
                                ? channel.id === data[module].channelId
                                    ? data[module].channelId
                                    : channel.id
                                : data[module].channelId,
                            webhook: channel
                                ? channel.id === data[module].channel
                                    ? data[module].webhook
                                    : newWebhook.url
                                : data[module].webhook,
                            active: active === null ? data[module].active : active,
                        },
                    },
                });
                await client.updateWebhookData();
            }
            const embed = client.util
                .embed()
                .setTitle('Logging Configuration')
                .setColor(client.cc.ultimates)
                .addFields(await formatLogField('mod'), await formatLogField('message'), await formatLogField('modmail'), await formatLogField('servergate'));
            await interaction.followUp({ embeds: [embed] });
        }
        async function formatLogField(module) {
            const data = await config_1.configModel.findById('logs');
            let channel = (await client.channels
                .fetch(data[module].channelId)
                .catch(() => { }));
            return {
                name: logsNames[module],
                value: data[module].webhook
                    ? `${data[module].active
                        ? '<:online:886215547249913856>'
                        : '<:offline:906867114126770186>'} • ${channel ? channel : "The logs channel wasn't found."}`
                    : '<:idle:906867112612601866> • This module is not set, yet...',
            };
        }
    },
});
