import { EmbedBuilder, GuildMember, PermissionResolvable } from 'discord.js';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';
const staffPermissions: PermissionResolvable = [
	'ManageMessages',
	'BanMembers',
	'ManageNicknames',
	'BanMembers',
	'KickMembers',
	'ModerateMembers',
	'MuteMembers',
	'MoveMembers',
	'DeafenMembers',
	'Administrator',
];
enum statusPriorities {
	'online' = 1,
	'idle' = 2,
	'dnd' = 3,
	'offline' = 4,
	undefined = 5,
}

export default new Command({
	interaction: interactions.staff,
	excute: async ({ client, interaction }) => {
		await interaction.deferReply({ ephemeral: false });
		const members = await interaction.guild.members.fetch({ force: true });
		const staff = members
			.filter(
				(member) =>
					staffPermissions.some((permission) =>
						member.permissions.has(permission)
					) && !member.user.bot
			)
			.sort(
				(a, b) =>
					statusPriorities[a.presence?.status] - statusPriorities[b.presence?.status]
			);

		enum statuses {
			'online' = '<:online:886215547249913856>',
			'idle' = '<:idle:906867112612601866>',
			'dnd' = '<:dnd:906867112222531614>',
			// note: offline doesn't always mean invisible
			'offline' = '<:offline:906867114126770186>', // <:invisible:983325305273995334>
			undefined = '<:offline:906867114126770186>',
		}

		const embed = new EmbedBuilder()
			.setAuthor({ name: 'Staff members', iconURL: client.user.displayAvatarURL() })
			.setColor(client.cc.ultimates)
			.setDescription(
				staff
					.map(
						(staff) =>
							`${statuses[staff.presence?.status]} • ${staff} - ${guessRole(
								staff
							)}`
					)
					.join('\n')
			);

		interaction.followUp({ embeds: [embed] });

		function guessRole(member: GuildMember) {
			let role: string;
			if (member.id === interaction.guild.ownerId) {
				role = 'Server owner';
			} else if (member.permissions.has('Administrator')) {
				role = 'Administrator';
			} else role = 'Moderator';

			return role;
		}
	},
});

