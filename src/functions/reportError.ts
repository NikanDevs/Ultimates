import { Colors, CommandInteraction } from 'discord.js';
import { client } from '..';

export function reportError(interaction: CommandInteraction, commandName: string, error: Error) {
	const errorMsg = 'Something went wrong while excuting the command.';

	switch (interaction.replied) {
		case false:
			switch (interaction.deferred) {
				case true:
					interaction
						.followUp({
							embeds: [client.embeds.error(errorMsg)],
							ephemeral: true,
						})
						.catch(() => {});
					break;
				case false:
					interaction
						.reply({
							embeds: [client.embeds.error(errorMsg)],
							ephemeral: true,
						})
						.catch(() => {});
					break;
			}
			break;

		case true:
			interaction
				.editReply({
					embeds: [client.embeds.error(errorMsg)],
				})
				.catch(() => {});
			break;
	}

	console.log(`-------------------- /${commandName} Error --------------------\n${error.stack}`);
}
