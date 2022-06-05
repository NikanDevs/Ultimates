import { EmbedBuilder, TextChannel, Util } from 'discord.js';
import { inspect } from 'node:util';
import { client as C } from '../..';
import { EMBED_DESCRIPTION_MAX_LENGTH } from '../../constants';
import { logger as L } from '../../logger';
import { Event } from '../../structures/Event';

export default new Event('interactionCreate', async (interaction) => {
	if (!interaction.isModalSubmit()) return;
	if (interaction.customId !== 'eval') return;

	const client = C;
	const logger = L;

	const code = interaction.fields.getTextInputValue('eval');
	const async = interaction.fields.getTextInputValue('eval-async')
		? JSON.parse(interaction.fields.getTextInputValue('eval-async'))
		: false;
	const silent = interaction.fields.getTextInputValue('eval-silent')
		? JSON.parse(interaction.fields.getTextInputValue('eval-silent'))
		: false;

	function formatOutput(str: string) {
		if (typeof str !== 'string') str = inspect(str, { depth: 0 });
		return str;
	}

	try {
		let evaled = eval(async ? `(async () => {\n${code}\n})()` : code);
		evaled = formatOutput(evaled);

		switch (evaled) {
			case 'Promise { <pending> }':
				const sucessEmbed = new EmbedBuilder()
					.setColor(client.cc.successC)
					.setDescription(
						`**Evaluation succeded:**\n\`\`\`ts\n${client.util.splitText(code, {
							splitCustom: EMBED_DESCRIPTION_MAX_LENGTH - 40,
						})}\n\`\`\``
					);
				interaction.reply({ embeds: [sucessEmbed], ephemeral: silent });
				break;
			default:
				let resultEmbed = new EmbedBuilder()
					.setColor(client.cc.successC)
					.setDescription(
						`**Output:**\`\`\`ts\n${client.util.splitText(evaled, {
							splitCustom: EMBED_DESCRIPTION_MAX_LENGTH - 30,
						})}\n\`\`\``
					);
				if (evaled.length < EMBED_DESCRIPTION_MAX_LENGTH - 25)
					return interaction.reply({ embeds: [resultEmbed], ephemeral: silent });

				// If the result is too big to be shown in a single embed
				const split = evaled.match(/.{1,1935}/g);
				split.forEach(
					async (result) =>
						await (interaction.channel as TextChannel).send({
							content: `\`\`\`ts\n${result}\n\`\`\``,
						})
				);
				break;
		}
	} catch (error) {
		const errorEmbed = new EmbedBuilder().setColor(client.cc.errorC).setDescription(
			`**An error has occured**\n\`\`\`xl\n${client.util.splitText(error?.message, {
				splitCustom: EMBED_DESCRIPTION_MAX_LENGTH - 40,
			})}\n\`\`\``
		);

		await interaction.reply({ embeds: [errorEmbed], ephemeral: silent });
	}
});

