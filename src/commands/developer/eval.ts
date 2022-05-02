import { Command } from '../../structures/Command';
import { TextChannel, Util } from 'discord.js';
import { inspect } from 'util';

export default new Command({
	name: 'eval',
	description: 'Eval a typescript/javascript directly into the bot!',
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

		function errorEmbed(error: Error) {
			const errorEmbed = client.util
				.embed()
				.setAuthor({
					name: client.user.username,
					iconURL: client.user.displayAvatarURL(),
				})
				.setTitle('An error has occured')
				.setColor(client.colors.error)
				.addFields(
					{
						name: 'Code',
						value: `\`\`\`ts\n${code}\n\`\`\``,
					},
					{
						name: 'Error',
						value: `\`\`\`xl\n${error?.message}\n\`\`\``,
					}
				);
			return errorEmbed;
		}

		try {
			let evaled = eval(code);
			evaled = cleanOutput(evaled);

			switch (evaled) {
				case 'Promise { <pending> }':
					const sucessEmbed = client.util
						.embed()
						.setAuthor({
							name: client.user.username,
							iconURL: client.user.displayAvatarURL(),
						})
						.setTitle(`Evaluation Succeded`)
						.setColor(client.colors.success)
						.addFields({
							name: 'Code',
							value: `\`\`\`ts\n${code}\n\`\`\``,
						});
					message.reply({ embeds: [sucessEmbed] });
					break;

				default:
					if (evaled.length >= 2000) {
						const [first, ...rest] = Util.splitMessage(evaled, {
							maxLength: 1950,
						});

						message.reply({ content: `\`\`\`js\n${first}\n\`\`\`` });
						rest.forEach((msg) =>
							(message.channel as TextChannel).send({
								content: `\`\`\`ts\n${msg}\n\`\`\``,
							})
						);
					} else {
						message.reply({ content: `\`\`\`ts\n${evaled}\n\`\`\`` });
					}
					break;
			}
		} catch (error) {
			message.reply({ embeds: [errorEmbed(error)] });
		}
	},
});
