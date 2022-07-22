import {
	Colors,
	ComponentType,
	EmbedBuilder,
	Formatters,
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
	// @ts-ignore
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
			.awaitModalSubmit({ time: 5000 * 50 })
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
						.setColor(Colors.Green)
						.setTitle('Evaluation succeded')
						.setDescription(
							Formatters.codeBlock('ts', splitText(code, EMBED_DESCRIPTION_MAX_LENGTH - 20))
						);
					modalInteraction.reply({ embeds: [sucessEmbed], ephemeral: silent }).catch(() => {});
					break;
				default:
					const embed = new EmbedBuilder().setColor(Colors.Green).setTitle('Evolution output');

					if (evaled.length < EMBED_DESCRIPTION_MAX_LENGTH - 25) {
						embed.setDescription(
							Formatters.codeBlock('ts', splitText(evaled, EMBED_DESCRIPTION_MAX_LENGTH - 25))
						);

						return modalInteraction
							.reply({
								embeds: [embed],
								ephemeral: silent,
							})
							.catch(() => {});
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
							ephemeral: silent,
						});
					}
					break;
			}
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setColor(Colors.Red)
				.setTitle('An error has occured')
				.setDescription(
					Formatters.codeBlock('ts', splitText(error.message, EMBED_DESCRIPTION_MAX_LENGTH - 20))
				);

			await modalInteraction.reply({ embeds: [errorEmbed], ephemeral: silent }).catch(() => {});
		}
	},
});
