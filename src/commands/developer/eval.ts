import { Command } from '../../structures/Command';
import { TextChannel, Util } from 'discord.js';
import { inspect } from 'util';
import { EMBED_DESCRIPTION_MAX_LENGTH } from '../../constants';

export default new Command({
	name: 'eval',
	description: 'Eval a typescript/javascript code directly into the bot!',
	directory: 'developer',
	aliases: ['e'],

	excute: async ({ client, message, args }) => {
		let code = args.join(' ');
		if (!code)
			return message.reply({
				embeds: [client.embeds.error('Please enter a code to eval.')],
			});

		function cleanOutput(str: string) {
			if (typeof str !== 'string') str = inspect(str, { depth: 0 });
			return str;
		}

		try {
			let evaled = eval(code) as string;
			evaled = cleanOutput(evaled);

			switch (evaled) {
				case 'Promise { <pending> }':
					const sucessEmbed = client.util
						.embed()
						.setColor(client.colors.success)
						.setDescription(
							`**Evaluation succeded:**\n\`\`\`ts\n${client.util.splitText(
								code,
								{ splitCustom: EMBED_DESCRIPTION_MAX_LENGTH - 40 }
							)}\n\`\`\``
						);
					message.reply({ embeds: [sucessEmbed] });
					break;
				default:
					let resultEmbed = client.util
						.embed()
						.setColor(client.colors.success)
						.setDescription(
							`**Output:**\`\`\`ts\n${client.util.splitText(evaled, {
								splitCustom: EMBED_DESCRIPTION_MAX_LENGTH - 30,
							})}\n\`\`\``
						);
					if (evaled.length < EMBED_DESCRIPTION_MAX_LENGTH - 25)
						return message.reply({ embeds: [resultEmbed] });

					const [first, ...rest] = Util.splitMessage(evaled, {
						maxLength: 1935,
					});

					await (message.channel as TextChannel).send({
						content: `\`\`\`ts\n${first}\n\`\`\``,
					});
					rest.forEach(
						async (result) =>
							await (message.channel as TextChannel).send({
								content: `\`\`\`ts\n${result}\n\`\`\``,
							})
					);
					break;
			}
		} catch (error) {
			const errorEmbed = client.util
				.embed()
				.setColor(client.colors.error)
				.setDescription(
					`**An error has occured**\n\`\`\`xl\n${client.util.splitText(
						error?.message,
						{ splitCustom: EMBED_DESCRIPTION_MAX_LENGTH - 40 }
					)}\n\`\`\``
				);
			message.reply({ embeds: [errorEmbed] });
		}
	},
});
