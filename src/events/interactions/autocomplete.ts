import { client } from '../..';
import { automodModel } from '../../models/automod';
import { punishmentModel } from '../../models/punishments';
import { Event } from '../../structures/Event';
import { GuildMember } from 'discord.js';
import { convertTime, convertToTime, isValidTime } from '../../functions/convertTime';
import { MAX_AUTOCOMPLETE_LENGTH } from '../../constants';
import { capitalize } from '../../functions/other/capitalize';
import { splitText } from '../../functions/other/splitText';
import { t } from 'i18next';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction) return;
	if (!interaction.isAutocomplete()) return;

	// Checking for the member's permissions
	const getPermissions = client.commands.get(interaction.commandName)?.interaction.permission;

	if (!getPermissions.some((perm) => (interaction.member as GuildMember).permissions.has(perm)))
		return await interaction.respond([
			{ name: "You don't have permissions to intract with this.", value: 'NO_PERM' },
		]);

	const focus = interaction.options.getFocused(true);

	// Auto completes
	switch (interaction.commandName) {
		case 'punishment':
			if (focus?.name !== 'id') return;

			let warnings: string[] = (await punishmentModel.find())
				.map((data) => {
					return [
						`Manual | ${capitalize(data.type)}`,
						`${
							client.users.cache.get(data.userId) === undefined
								? `${data.userId}`
								: client.users.cache.get(data.userId).tag
						}`,
						`ID: ${data._id}`,
					].join(' • ');
				})
				.concat(
					(await automodModel.find()).map((data) => {
						return [
							`Automod | ${capitalize(data.type)}`,
							`${
								client.users.cache.get(data.userId) === undefined
									? `${data.userId}`
									: client.users.cache.get(data.userId).tag
							}`,
							`ID: ${data._id}`,
							`${data.reason}`,
						].join(' • ');
					})
				);

			warnings = warnings
				.filter(
					(choice) =>
						(choice.split(' • ')[1].startsWith('Automod')
							? choice
									.split(' • ')[2]
									.slice(4)
									.startsWith(focus.value as string)
							: choice
									.split(' • ')[2]
									.slice(4)
									.startsWith(focus.value as string)) ||
						choice.split(' • ')[1].startsWith(focus.value as string) ||
						client.users.cache
							.find((user) => user.tag === choice.split(' • ')[1])
							?.id?.startsWith(focus.value as string)
				)
				.map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
				.slice(0, 25);

			if (warnings.length === 0)
				return interaction.respond([{ name: 'No Punishments Found!', value: 'null' }]);

			await interaction.respond(
				warnings.map((choice: string) => ({
					name: splitText(choice, MAX_AUTOCOMPLETE_LENGTH),
					value: choice.split(' • ')[1].startsWith('Automod')
						? choice.split(' • ')[3].slice(4)
						: choice.split(' • ')[3].slice(4),
				}))
			);
			break;
		case 'unban':
			if (focus?.name === 'user') {
				const mapBans = (await interaction.guild.bans.fetch()).map((ban) => {
					return [
						`${ban.user.tag}`,
						`${ban.user.id}`,
						`${ban.reason || t('common.noReason')}`,
					].join(' • ');
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
						{ name: 'No banned members were found!', value: 'null' },
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
		const availableReasons = [
			...new Set(client.config.moderation.reasons[interaction.commandName]),
		];
		const filteredReasons = availableReasons
			.filter((reason: string) => reason.startsWith(focus.value as string))
			.map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
			.slice(0, 25);

		if (
			!client.config.moderation.reasons[interaction.commandName].length &&
			!focus.value.toString().length
		)
			return interaction.respond([
				{
					name: '⭐️' + ' • ' + 'No inbuilt reasons were found, type a reason...',
					value: t('common.noReason') as string,
				},
			]);

		if (filteredReasons.length === 0)
			return interaction.respond([
				{
					name:
						'⭐️' +
						' • ' +
						splitText(focus.value.toString(), MAX_AUTOCOMPLETE_LENGTH - 4),
					value: splitText(focus.value.toString(), MAX_AUTOCOMPLETE_LENGTH),
				},
			]);
		await interaction.respond(
			filteredReasons.map((reason: string) => ({
				name: splitText(reason, MAX_AUTOCOMPLETE_LENGTH),
				value: reason.split(' • ')[1],
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
							? client.config.moderation.default.softban
							: client.config.moderation.default.timeout
					),
					value: convertTime(
						interaction.commandName === 'softban'
							? client.config.moderation.default.softban
							: client.config.moderation.default.timeout
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
	if (
		(focus.name === 'registered' || focus.name === 'joined') &&
		interaction.commandName === 'antiraid'
	) {
		if (!focus.value.toString().trim().length)
			return interaction.respond([
				{
					name: 'Please provide a duration',
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
