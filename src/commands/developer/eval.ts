import {
	ComponentType,
	EmbedBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	TextInputStyle,
} from 'discord.js';
import { inspect } from 'node:util';
import { EMBED_DESCRIPTION_MAX_LENGTH } from '../../constants';
import { splitText } from '../../functions/other/splitText';
import { interactions } from '../../interactions';
import { Command } from '../../structures/Command';
import { Paginator } from '../../structures/Paginator';

export default new Command({
	interaction: interactions.eval,
	excute: async ({ client, interaction, options }) => {
		const async = options.getBoolean('async') ?? false;
		const silent = options.getBoolean('silent') ?? false;

		const modal = new ModalBuilder()
			.setTitle('Evaluation')
			.setCustomId('eval')
			.addComponents([
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.TextInput,
							custom_id: 'eval',
							label: 'Enter the code:',
							style: TextInputStyle.Paragraph,
							required: true,
							max_length: 4000,
							min_length: 1,
							placeholder: 'console.log("amazing!")',
						},
					],
				},
			]);

		await interaction.showModal(modal);
		const modalInteraction = (await interaction
			.awaitModalSubmit({ time: 6000 * 5 })
			.catch(() => {})) as ModalSubmitInteraction;

		if (modalInteraction.customId !== 'eval') return;
		const code = modalInteraction.fields.getTextInputValue('eval');

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
							`**Evaluation succeded:**\n\`\`\`ts\n${splitText(
								code,
								EMBED_DESCRIPTION_MAX_LENGTH - 40
							)}\n\`\`\``
						);
					modalInteraction.reply({ embeds: [sucessEmbed], ephemeral: silent });
					break;
				default:
					const embed = new EmbedBuilder()
						.setColor(client.cc.successC)
						.setTitle('Evolution output');

					if (evaled.length < EMBED_DESCRIPTION_MAX_LENGTH - 25) {
						embed.setDescription(
							`\`\`\`ts\n${splitText(
								evaled,
								EMBED_DESCRIPTION_MAX_LENGTH - 20
							)}\n\`\`\``
						);

						return modalInteraction.reply({
							embeds: [embed],
							ephemeral: silent,
						});
					} else {
						const split: string[] = evaled.match(/.{1,1935}/g);
						embed.setDescription('```ts\n${{array}}\n```').setFooter({
							text: 'Page ${{currentPage}}/${{totalPages}}',
						});

						const paginator = new Paginator();
						paginator.start(modalInteraction, {
							array: split.map((data) => data),
							itemPerPage: 1,
							joinWith: null,
							time: 5 * 6000,
							embed: embed,
						});
					}
					break;
			}
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor(client.cc.errorC)
				.setDescription(
					`**An error has occured**\n\`\`\`xl\n${splitText(
						error?.message,
						EMBED_DESCRIPTION_MAX_LENGTH - 40
					)}\n\`\`\``
				);

			await modalInteraction.reply({ embeds: [errorEmbed], ephemeral: silent });
		}
	},
});

