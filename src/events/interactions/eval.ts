import { TextChannel, Util } from 'discord.js';
import { inspect } from 'node:util';
import { client } from '../..';
import { EMBED_DESCRIPTION_MAX_LENGTH } from '../../constants';
import { Event } from '../../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId !== 'eval') return;

	const code = interaction.fields.getField('eval').value;
	const async = interaction.fields.getField('eval-async').value
		? JSON.parse(interaction.fields.getField('eval-async').value)
		: false;
	const silent = interaction.fields.getField('eval-silent').value
		? JSON.parse(interaction.fields.getField('eval-silent').value)
		: false;

	function formatOutput(str: string) {
		if (typeof str !== 'string') str = inspect(str, { depth: 0 });
		return str;
	}

	try {
		let evaled = eval(async ? `(async () => {\n${code}\n})()` : code) as string;
		evaled = formatOutput(evaled);

		switch (evaled) {
			case 'Promise { <pending> }':
				const sucessEmbed = client.util
					.embed()
					.setColor(client.colors.success)
					.setDescription(
						`**Evaluation succeded:**\n\`\`\`ts\n${client.util.splitText(code, {
							splitCustom: EMBED_DESCRIPTION_MAX_LENGTH - 40,
						})}\n\`\`\``
					);
				interaction.reply({ embeds: [sucessEmbed], ephemeral: silent });
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
					return interaction.reply({ embeds: [resultEmbed], ephemeral: silent });

				// If the result is too big to be shown in a single embed
				const [first, ...rest] = Util.splitMessage(evaled, {
					maxLength: 1935,
				});

				await (interaction.channel as TextChannel).send({
					content: `\`\`\`ts\n${first}\n\`\`\``,
				});
				rest.forEach(
					async (result) =>
						await (interaction.channel as TextChannel).send({
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
				`**An error has occured**\n\`\`\`xl\n${client.util.splitText(error?.message, {
					splitCustom: EMBED_DESCRIPTION_MAX_LENGTH - 40,
				})}\n\`\`\``
			);

		await interaction.reply({ embeds: [errorEmbed], ephemeral: silent });
	}
});

