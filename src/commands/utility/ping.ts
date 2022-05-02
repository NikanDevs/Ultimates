import { Command } from '../../structures/Command';

export default new Command({
	name: 'ping',
	description: "Check the bot's health.",
	directory: 'utility',
	cooldown: 5000,
	permission: [],
	available: true,

	excute: async ({ interaction }) => {
		interaction.reply({
			content: `im alive, replied in \`${interaction.createdTimestamp - Date.now()}ms\``,
			ephemeral: true,
		});
	},
});
