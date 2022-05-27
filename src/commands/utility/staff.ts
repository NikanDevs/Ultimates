import { GuildMember, PermissionResolvable } from 'discord.js';
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
	undefined = 4,
}

export default new Command({
	name: 'staff',
	description: 'Displays a list of available staff members for this server.',
	directory: 'utility',
	cooldown: 5000,
	permission: [],
	available: true,

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
			undefined = '<:offline:906867114126770186>',
		}

		const embed = client.util
			.embed()
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
