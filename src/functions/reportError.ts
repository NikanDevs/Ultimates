import { Colors, CommandInteraction } from 'discord.js';
import { client } from '..';
import { errorHandler } from '../webhooks';

export function reportError(interaction: CommandInteraction, commandName: string, error: Error) {
	const errorMsg = 'Something went wrong while excuting the command.';

	switch (interaction.replied) {
		case false:
			switch (interaction.deferred) {
				case true:
					interaction.followUp({
						embeds: [client.embeds.error(errorMsg)],
						ephemeral: true,
					});
					break;
				case false:
					interaction.reply({
						embeds: [client.embeds.error(errorMsg)],
						ephemeral: true,
					});
					break;
			}
			break;

		case true:
			interaction.editReply({
				embeds: [client.embeds.error(errorMsg)],
			});
			break;
	}

	const interactionEmbed = client.util
		.embed()
		.setAuthor({
			name: '/' + commandName,
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor(Colors.Red)
		.setDescription(
			[
				'**Reason:**',
				`\`\`\`\n${error.stack.length <= 4080 ? error.stack : error}\n\`\`\``,
			].join('\n')
		)
		.addFields(
			{
				name: 'Executed By',
				value: `${interaction.user}`,
				inline: true,
			},
			{
				name: 'Executed By Id',
				value: `${interaction.user.id}`,
				inline: true,
			},
			{
				name: 'Executed At',
				value: `<t:${~~(Date.now() / 1000)}:f>`,
				inline: true,
			}
		);

	errorHandler.send({ embeds: [interactionEmbed] });
	console.log(`-------------------- /${commandName} Error --------------------\n${error.stack}`);
}
