import { client } from '../..';
import { automodModel } from '../../models/automod';
import { punishmentModel } from '../../models/punishments';
import { Event } from '../../structures/Event';
import { reasons } from '../../json/moderation.json';
import { GuildMember } from 'discord.js';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction) return;
	if (!interaction.isAutocomplete()) return;

	// Checking for the member's permissions
	const getPermissions = client.commands
		.filter((cmd) => cmd.directory !== 'developer')
		.get(interaction.commandName)?.permission;
	if (!getPermissions.some((perm) => (interaction.member as GuildMember).permissions.has(perm)))
		return await interaction.respond([
			{ name: "You don't have permissions to intract with this.", value: 'NO_PERM' },
		]);

	// Auto completes
	switch (interaction.commandName) {
		case 'punishment':
			const punishmentFocus = interaction.options.getFocused(true);

			if (
				interaction.options.getSubcommand() === 'search' ||
				interaction.options.getSubcommand() === 'revoke' ||
				interaction.options.getSubcommand() === 'update'
			) {
				if (punishmentFocus?.name !== 'id') return;

				let warnings: string[] = (await punishmentModel.find())
					.map((data) => {
						return [
							`Manual | ${client.util.capitalize(data.type)}`,
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
								`Automod | ${client.util.capitalize(data.type)}`,
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
										.startsWith(punishmentFocus.value as string)
								: choice
										.split(' • ')[2]
										.slice(4)
										.startsWith(punishmentFocus.value as string)) ||
							choice
								.split(' • ')[1]
								.startsWith(punishmentFocus.value as string) ||
							client.users.cache
								.find((user) => user.tag === choice.split(' • ')[1])
								?.id?.startsWith(punishmentFocus.value as string)
					)
					.map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
					.slice(0, 25);

				if (warnings.length === 0)
					return interaction.respond([
						{ name: 'No Punishments Found!', value: 'null' },
					]);

				await interaction.respond(
					warnings.map((choice: string) => ({
						name: client.util.splitText(choice, { splitCustom: 100 }),
						value: choice.split(' • ')[1].startsWith('Automod')
							? choice.split(' • ')[3].slice(4)
							: choice.split(' • ')[3].slice(4),
					}))
				);
			}
			break;
		case 'unban':
			const unbanFocus = interaction.options.getFocused(true);
			if (unbanFocus?.name !== 'user-id') return;

			const mapBans = (await interaction.guild.bans.fetch()).map((ban) => {
				return [
					`${ban.user.tag}`,
					`${ban.user.id}`,
					`${ban.reason || 'No reason provided.'}`,
				].join(' • ');
			});
			const availableBannedMembers = [...new Set(mapBans)];
			const filteredBannedMembers = availableBannedMembers
				.filter((data) => data.startsWith(unbanFocus.value as string))
				.map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data)
				.slice(0, 25);

			if (!filteredBannedMembers.length)
				return interaction.respond([
					{ name: 'No banned members were found!', value: 'null' },
				]);

			await interaction.respond(
				filteredBannedMembers.map((data: string) => ({
					name: client.util.splitText(data, { splitCustom: 100 }),
					value: data.split(' • ')[2],
				}))
			);
			break;
	}

	// Reason autocomplete
	const getReasonsFocus = interaction.options.getFocused(true);
	if (getReasonsFocus?.name !== 'reason') return;

	switch (interaction.commandName) {
		case interaction.commandName:
			const availableReasons = [...new Set(reasons[interaction.commandName])];
			const filteredReasons = availableReasons
				.filter((reason: string) => reason.startsWith(getReasonsFocus.value as string))
				.map((data, i) => (i === 0 ? '⭐️' : i.toString()) + ' • ' + data);

			if (
				!reasons[interaction.commandName].length &&
				!getReasonsFocus.value.toString().length
			)
				return interaction.respond([
					{
						name:
							'⭐️' +
							' • ' +
							'No inbuilt reasons were found, type a reason...',
						value: 'No reason provided.',
					},
				]);

			if (filteredReasons.length === 0)
				return interaction.respond([
					{
						name: '⭐️' + ' • ' + getReasonsFocus.value.toString(),
						value: getReasonsFocus.value.toString(),
					},
				]);
			await interaction.respond(
				filteredReasons.map((reason: string) => ({
					name: client.util.splitText(reason, { splitCustom: 100 }),
					value: reason.split(' • ')[1],
				}))
			);
			break;
	}
});
