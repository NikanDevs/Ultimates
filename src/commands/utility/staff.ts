import { EmbedBuilder, GuildMember, PermissionResolvable } from 'discord.js';
import { t } from 'i18next';
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
	excute: async ({ client, interaction, options }) => {
		await interaction.deferReply({ ephemeral: options.getBoolean('hidden') ?? false });
		const members = await interaction.guild.members.fetch({ force: true });
		const staff = members
			.filter(
				(member) =>
					staffPermissions.some((permission) => member.permissions.has(permission)) && !member.user.bot
			)
			.sort((a, b) => statusPriorities[a.presence?.status] - statusPriorities[b.presence?.status]);

		const statuses = {
			online: client.cc.statuses.online,
			idle: client.cc.statuses.idle,
			dnd: client.cc.statuses.dnd,
			offline: client.cc.statuses.offline,
			undefined: client.cc.statuses.offline,
		};

		const embed = new EmbedBuilder()
			.setAuthor({ name: t('command.utility.staff.staffs'), iconURL: client.user.displayAvatarURL() })
			.setColor(client.cc.invisible)
			.setDescription(
				staff
					.map((staff) => `${statuses[staff.presence?.status]} • ${staff} - ${guessRole(staff)}`)
					.join('\n')
			);

		interaction.followUp({ embeds: [embed] });

		function guessRole(member: GuildMember) {
			const roles = (context: string) => t('command.utility.staff.role', { context });
			let role: string;
			if (member.id === interaction.guild.ownerId) {
				role = roles('owner');
			} else if (member.permissions.has('Administrator')) {
				role = roles('admin');
			} else role = roles('mod');

			return role;
		}
	},
});
