"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const interactions_1 = require("../../interactions");
const Command_1 = require("../../structures/Command");
exports.default = new Command_1.Command({
    interaction: interactions_1.interactions.eval,
    excute: async ({ interaction }) => {
        const modal = new discord_js_1.ModalBuilder()
            .setTitle('Evaluation')
            .setCustomId('eval')
            .addComponents([
            {
                type: discord_js_1.ComponentType.ActionRow,
                components: [
                    {
                        type: discord_js_1.ComponentType.TextInput,
                        custom_id: 'eval',
                        label: 'Enter the code:',
                        style: discord_js_1.TextInputStyle.Paragraph,
                        required: true,
                        max_length: 4000,
                        min_length: 1,
                        placeholder: 'console.log("amazing!")',
                    },
                ],
            },
            {
                type: discord_js_1.ComponentType.ActionRow,
                components: [
                    {
                        type: discord_js_1.ComponentType.TextInput,
                        custom_id: 'eval-async',
                        label: 'Async',
                        style: discord_js_1.TextInputStyle.Short,
                        required: false,
                        max_length: 5,
                        min_length: 1,
                        placeholder: 'true - false',
                    },
                ],
            },
            {
                type: discord_js_1.ComponentType.ActionRow,
                components: [
                    {
                        type: discord_js_1.ComponentType.TextInput,
                        custom_id: 'eval-silent',
                        label: 'Silent',
                        style: discord_js_1.TextInputStyle.Short,
                        required: false,
                        max_length: 5,
                        min_length: 1,
                        placeholder: 'true - false',
                    },
                ],
            },
        ]);
        await interaction.showModal(modal);
    },
});
