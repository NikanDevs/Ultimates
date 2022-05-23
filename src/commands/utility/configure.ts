import { ApplicationCommandOptionType, ChannelType, TextChannel, Webhook } from 'discord.js';
import { WEBHOOK_NAMES } from '../../constants';
import { configModel } from '../../models/config';
import { Command } from '../../structures/Command';
enum logsNames {
	'mod' = 'Moderation Logging',
	'message' = 'Message Logging',
	'modmail' = 'Modmail Logging',
	'servergate' = 'Joins and Leaves',
	'error' = 'Errors Loggings',
}

export default new Command({
	name: 'configure',
	description: 'Configure different modules of the bot.',
	directory: 'utility',
	cooldown: 5000,
	permission: ['Administrator'],
	options: [
		{
			name: 'logs',
			description: 'Configure the settings of the logging system.',
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: 'module',
					description: 'The log module you want to configure.',
					type: ApplicationCommandOptionType.String,
					required: false,
					choices: [
						{ name: 'Moderation', value: 'mod' },
						{ name: 'Message', value: 'message' },
						{ name: 'Modmail', value: 'modmail' },
						{ name: 'Joins & Leaves', value: 'servergate' },
					],
				},
				{
					name: 'channel',
					description: 'The channel you want the module to be posting on.',
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
					required: false,
				},
				{
					name: 'active',
					description: 'The channel you want the module to be active on.',
					type: ApplicationCommandOptionType.Boolean,
					required: false,
				},
			],
		},
	],

	excute: async ({ client, interaction, options }) => {
		const subcommand = options.getSubcommand();
		await interaction.deferReply({ ephemeral: false });

		if (subcommand === 'logs') {
			const module = options.getString('module');
			const channel = options.getChannel('channel') as TextChannel;
			const active = options.getBoolean('active') || false;
			let newWebhook: Webhook;

			const data = await configModel.findById('logs');
			if (!data) {
				const newData = new configModel({
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
						await client.webhooks.mod?.delete().catch(() => {});
						break;
					case 'message':
						await client.webhooks.message?.delete().catch(() => {});
						break;
					case 'modmail':
						await client.webhooks.modmail?.delete().catch(() => {});
						break;
					case 'servergate':
						await client.webhooks.servergate?.delete().catch(() => {});
						break;
				}
				newWebhook = await channel.createWebhook(WEBHOOK_NAMES[module], {
					avatar: client.user.displayAvatarURL({ extension: 'png' }),
					reason: '/configure was excuted.',
				});
			}

			if (module) {
				await configModel.findByIdAndUpdate(
					{ _id: 'logs' },
					{
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
					}
				);
				await client.updateWebhookData();
			}

			const embed = client.util
				.embed()
				.setTitle('Logging Configuration')
				.setColor(client.colors.ultimates)
				.addFields(
					await formatLogField('mod'),
					await formatLogField('message'),
					await formatLogField('modmail'),
					await formatLogField('servergate')
				);

			await interaction.followUp({ embeds: [embed] });
		}

		async function formatLogField(module: 'mod' | 'message' | 'modmail' | 'servergate') {
			const data = await configModel.findById('logs');
			let channel = (await client.channels
				.fetch(data[module].channelId)
				.catch(() => {})) as TextChannel;
			return {
				name: logsNames[module],
				value: data[module].webhook
					? `${
							data[module].active
								? '<:online:886215547249913856>'
								: '<:offline:906867114126770186>'
					  } • ${channel ? channel : "The logs channel wasn't found."}`
					: '<:idle:906867112612601866> • This module is not set, yet...',
			};
		}
	},
});

