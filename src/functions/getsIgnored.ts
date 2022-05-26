import { CommandInteraction, GuildMember } from 'discord.js';
import { developers, ownerId } from '../json/config.json';
import { client } from '..';

export function getsIgnored(interaction: CommandInteraction, member: GuildMember) {
	if (member.roles.highest.position >= interaction.guild.me.roles?.highest.position) {
		interaction.reply({
			embeds: [
				client.embeds.error("I don't have enough permissions to perform this action."),
			],
			ephemeral: true,
		});
		return true;
	} else if (
		member?.roles.highest.position >=
			(interaction.member as GuildMember).roles?.highest.position ||
		member.id === ownerId ||
		member.user.bot
	) {
		interaction.reply({
			embeds: [
				client.embeds.error(
					'You do not have enough permissions to perform this action.'
				),
			],
			ephemeral: true,
		});
		return true;
	} else return false;
}
