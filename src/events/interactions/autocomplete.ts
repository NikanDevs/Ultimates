import { client } from '../..';
import { automodModel } from '../../models/automod';
import { punishmentModel } from '../../models/punishments';
import { Event } from '../../structures/Event';
import { GuildMember, InteractionType } from 'discord.js';
import { convertTime, convertToTime, isValidTime } from '../../functions/convertTime';
import { MAX_AUTOCOMPLETE_LENGTH } from '../../constants';
import { capitalize } from '../../functions/other/capitalize';
import { splitText } from '../../functions/other/splitText';
import { t } from 'i18next';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction) return;
	if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) return;

	// Checking for the member's permissions
	const getPermissions = client.commands.get(interaction.commandName)?.interaction.permission;

	if (!getPermissions.some((perm) => (interaction.member as GuildMember).permissions.has(perm)))
		return await interaction.respond([{ name: t('event.interactions.autocomplete.noPerms'), value: 'NO_PERM' }]);

	const focus = interaction.options.getFocused(true);

	// Auto completes
	switch (interaction.commandName) {
		case 'punishment':
			if (focus?.name !== 'id') return;

			let warnings: string[] = (await punishmentModel.find())
				.map((data) => {
					return t('event.interactions.autocomplete.punishment.manual', {
						type: capitalize(data.type),
						user:
							client.users.cache.get(data.userId) === undefined
								? `${data.userId}`
								: client.users.cache.get(data.userId).tag,
						id: data._id,
					});
				})
				.concat(
					(await automodModel.find()).map((data) => {
						return t('event.interactions.autocomplete.punishment.automod', {
							type: capitalize(data.type),
							user:
								client.users.cache.get(data.userId) === undefined
									? `${data.userId}`
									: client.users.cache.get(data.userId).tag,
							id: data._id,
							reason: data.reason,
						});
					})
				);

			warnings = warnings
				.filter(
					(choice) =>
						choice
							.split(' • ')[2]
							.slice(4)
							.startsWith(focus.value as string) ||
						choice.split(' • ')[1].startsWith(focus.value as string) ||
						client.users.cache
							.find((user) => user.tag === choice.split(' • ')[1])
							?.id?.startsWith(focus.value as string)
				)
				.map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
				.slice(0, 25);

			if (warnings.length === 0)
				return interaction.respond([
					{ name: t('event.interactions.autocomplete.punishment.no'), value: 'null' },
				]);

			await interaction.respond(
				warnings.map((choice: string) => ({
					name: splitText(choice, MAX_AUTOCOMPLETE_LENGTH),
					value: choice.split(' • ')[3].slice(4),
				}))
			);
			break;
		case 'unban':
			if (focus?.name === 'user') {
				const mapBans = (await interaction.guild.bans.fetch()).map((ban) => {
					return [`${ban.user.tag}`, `${ban.user.id}`, `${ban.reason || t('common.noReason')}`].join(
						' • '
					);
				});
				const availableBannedMembers = [...new Set(mapBans)];
				const filteredBannedMembers = availableBannedMembers
					.filter(
						(data) =>
							data.split(' • ')[0].startsWith(focus.value as string) ||
							data.split(' • ')[1].startsWith(focus.value as string)
					)
					.map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
					.slice(0, 25);

				if (!filteredBannedMembers.length)
					return interaction.respond([
						{ name: t('event.interactions.autocomplete.unban.no'), value: 'null' },
					]);

				await interaction.respond(
					filteredBannedMembers.map((data: string) => ({
						name: splitText(data, MAX_AUTOCOMPLETE_LENGTH),
						value: data.split(' • ')[2],
					}))
				);
			}
			break;
	}

	// Reason autocomplete
	if (focus?.name === 'reason') {
		const availableReasons = [...new Set(client.config.moderation.reasons[interaction.commandName])];
		const filteredReasons = availableReasons
			.filter((reason: string) => reason.startsWith(focus.value as string))
			.map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
			.slice(0, 25);

		if (!client.config.moderation.reasons[interaction.commandName].length && !focus.value.toString().length)
			return interaction.respond([
				{
					name: '❌' + ' • ' + t('event.interactions.autocomplete.reason.no'),
					value: t('common.noReason') as string,
				},
			]);

		if (filteredReasons.length === 0)
			return interaction.respond([
				{
					name: '⭐️' + ' • ' + splitText(focus.value.toString(), MAX_AUTOCOMPLETE_LENGTH - 4),
					value: splitText(focus.value.toString(), MAX_AUTOCOMPLETE_LENGTH),
				},
			]);

		await interaction.respond(
			filteredReasons.map((reason: string) => ({
				name: splitText(reason, MAX_AUTOCOMPLETE_LENGTH),
				value: splitText(reason.split(' • ')[1], MAX_AUTOCOMPLETE_LENGTH),
			}))
		);
	}

	// Duration autocomplete
	if (focus?.name == 'duration') {
		if (!focus.value.toString().trim().length)
			return interaction.respond([
				{
					name: convertTime(
						interaction.commandName === 'softban'
							? client.config.moderation.defaults.softban
							: client.config.moderation.defaults.timeout
					),
					value: convertTime(
						interaction.commandName === 'softban'
							? client.config.moderation.defaults.softban
							: client.config.moderation.defaults.timeout
					),
				},
			]);

		if (!isValidTime(focus.value as string))
			return interaction
				.respond([
					{
						name: t('common.errors.invalidDuration'),
						value: 'null',
					},
				])
				.catch(() => {});

		await interaction.respond([
			{
				name: convertTime(convertToTime(focus.value)),
				value: convertToTime(focus.value).toString(),
			},
		]);
	}

	// Antiraid autocomplete
	if ((focus.name === 'registered' || focus.name === 'joined') && interaction.commandName === 'antiraid') {
		if (!focus.value.toString().trim().length)
			return interaction.respond([
				{
					name: t('event.interactions.autocomplete.antiraid.noDuration'),
					value: 'null',
				},
			]);

		if (!isValidTime(focus.value as string))
			return interaction
				.respond([
					{
						name: t('common.errors.invalidDuration'),
						value: 'null',
					},
				])
				.catch(() => {});

		await interaction.respond([
			{
				name: convertTime(convertToTime(focus.value)),
				value: convertToTime(focus.value).toString(),
			},
		]);
	}
});
