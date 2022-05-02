import { exec } from 'child_process';
import { TextChannel, Util } from 'discord.js';
import { Command } from '../../structures/Command';

export default new Command({
	name: 'console',
	description: 'Runs a script in the console.',
	directory: 'developer',
	aliases: ['terminal'],
	cooldown: 2000,

	excute: async ({ client, message, args }) => {
		const script = args.join(' ');
		if (!script)
			return message.reply({
				embeds: [client.embeds.error('Please enter a script to run in console.')],
			});

		const msg = await message.reply({ content: '```\nPlease wait...\n```' });
		exec(script, (err, res) => {
			if (err) return sendResponse(err.stack);

			sendResponse(res);
		});

		function sendResponse(text: string) {
			if (text.length >= 2000) {
				const [first, ...rest] = Util.splitMessage(text, {
					maxLength: 1950,
				});

				msg.edit({ content: `\`\`\`js\n${first}\n\`\`\`` });
				rest.forEach((msg) =>
					(message.channel as TextChannel).send({
						content: `\`\`\`ts\n${msg}\n\`\`\``,
					})
				);
			} else {
				msg.edit({ content: `\`\`\`ts\n${text ? text : 'Action Succeded.'}\n\`\`\`` });
			}
		}
	},
});
