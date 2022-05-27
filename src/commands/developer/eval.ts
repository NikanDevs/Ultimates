import { ComponentType, TextInputStyle } from 'discord.js';
import { evalCommand } from '../../interactions/developer/eval';
import { Command } from '../../structures/Command';

export default new Command({
	interaction: evalCommand,
	excute: async ({ client, interaction }) => {
		const modal = client.util
			.modal()
			.setTitle('Evaluation')
			.setCustomId('eval')
			.addComponents(
				{
					type: ComponentType['ActionRow'],
					components: [
						{
							type: ComponentType['TextInput'],
							custom_id: 'eval',
							label: 'Enter the code:',
							style: TextInputStyle['Paragraph'],
							required: true,
							max_length: 4000,
							min_length: 1,
							placeholder: 'console.log("amazing!")',
						},
					],
				},
				{
					type: ComponentType['ActionRow'],
					components: [
						{
							type: ComponentType['TextInput'],
							custom_id: 'eval-async',
							label: 'Async',
							style: TextInputStyle['Short'],
							required: false,
							max_length: 5,
							min_length: 1,
							placeholder: 'true - false',
						},
					],
				},
				{
					type: ComponentType['ActionRow'],
					components: [
						{
							type: ComponentType['TextInput'],
							custom_id: 'eval-silent',
							label: 'Silent',
							style: TextInputStyle['Short'],
							required: false,
							max_length: 5,
							min_length: 1,
							placeholder: 'true - false',
						},
					],
				}
			);

		await interaction.showModal(modal);
	},
});

