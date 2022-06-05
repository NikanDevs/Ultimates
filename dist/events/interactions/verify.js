"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("../..");
const constants_1 = require("../../constants");
const Event_1 = require("../../structures/Event");
const config_json_1 = require("../../json/config.json");
const convertTime_1 = require("../../functions/convertTime");
const characters = '0123456789';
let key1 = '';
exports.default = new Event_1.Event('interactionCreate', async (interaction) => {
    // --- Modal answers
    if (interaction.isModalSubmit()) {
        if (interaction.customId !== 'verify-' + interaction.user.id)
            return;
        const getValue = interaction.fields.getTextInputValue('verify-' + interaction.user.id);
        if (getValue.toString() === constants_1.verificationCollection.get('modal-' + interaction.user.id)) {
            const verifedEmbed = new discord_js_1.EmbedBuilder()
                .setColor(__1.client.cc.successC)
                .setDescription('Congrats! You were verified in the server.');
            interaction.member.roles.add(config_json_1.guild.memberRoleId);
            interaction.reply({ embeds: [verifedEmbed], ephemeral: true });
            constants_1.verificationCollection.delete('cooldown-' + interaction.user.id);
            constants_1.verificationCollection.delete('modal-' + interaction.user.id);
        }
        else if (getValue.toString() !== constants_1.verificationCollection.get('modal-' + interaction.user.id)) {
            const deniedEmbed = new discord_js_1.EmbedBuilder()
                .setColor(__1.client.cc.errorC)
                .setDescription("Whoops, your answer wasn't correct. Try again to get verified.");
            interaction.reply({ embeds: [deniedEmbed], ephemeral: true });
        }
        constants_1.verificationCollection.delete('modal-' + interaction.user.id);
    }
    // Verify Button
    if (!interaction.isButton())
        return;
    if (interaction.customId !== 'verify')
        return;
    if (!interaction.guild.roles.cache.get(config_json_1.guild.memberRoleId))
        return interaction.reply({
            content: "Member role wasn't found, please contact a staff member!",
            ephemeral: true,
        });
    if (interaction.member.roles.cache.has(config_json_1.guild.memberRoleId))
        return interaction.reply({
            content: "You're already verified into the server!",
            ephemeral: true,
        });
    // Verificaton Cooldown
    const cooldownRemaining = `${~~(+constants_1.verificationCollection.get('cooldown-' + interaction.user.id) - Date.now())}`;
    if (constants_1.verificationCollection.has('cooldown-' + interaction.user.id))
        return interaction.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setDescription(`Please wait **${(0, convertTime_1.convertTime)(~~+cooldownRemaining)}** before trying to verify again.`)
                    .setColor(__1.client.cc.attentionC),
            ],
            ephemeral: true,
        });
    constants_1.verificationCollection.set('cooldown-' + interaction.user.id, Date.now() + 20000);
    setTimeout(() => {
        constants_1.verificationCollection.delete('cooldown-' + interaction.user.id);
    }, 20000);
    const verifiactionMode = ~~(Math.random() * (10 - 1 + 1) + 1);
    // Making random verification keys
    function generateKey1() {
        let code = '';
        for (var i = 0; i < 5; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        key1 = code;
    }
    if (verifiactionMode > 5) {
        await interaction.deferReply({ ephemeral: true });
        let key2 = '';
        function generateKey2() {
            const randomNumber = ~~(Math.random() * (10 - 1 + 1) + 1);
            if (randomNumber > 5) {
                key2 = key1;
            }
            else if (randomNumber <= 5) {
                let code = '';
                for (var i = 0; i < 5; i++) {
                    code += characters.charAt(Math.floor(Math.random() * characters.length));
                }
                key2 = code;
            }
        }
        // Calling out the functions
        generateKey1();
        generateKey2();
        // Embeds and components
        const embed = new discord_js_1.EmbedBuilder()
            .setAuthor({
            name: 'Are these keys matching each other?',
        })
            .setDescription('Check if the 2 keys below are **exactly** the same as each other. Submit your answer by clicking the buttons!')
            .addFields([
            {
                name: 'Key #1',
                value: key1,
                inline: true,
            },
            {
                name: 'Key #2',
                value: key2,
                inline: true,
            },
        ])
            .setColor(__1.client.cc.invisible);
        const buttonComponent = new discord_js_1.ActionRowBuilder().addComponents([
            new discord_js_1.ButtonBuilder()
                .setCustomId('verify-1')
                .setLabel('Matching')
                .setStyle(discord_js_1.ButtonStyle['Success']),
            new discord_js_1.ButtonBuilder()
                .setCustomId('verify-2')
                .setLabel('Not Matching')
                .setStyle(discord_js_1.ButtonStyle['Danger']),
        ]);
        const msg = (await interaction.followUp({
            embeds: [embed],
            components: [buttonComponent],
        }));
        // Collecting the answer
        const collector = msg.createMessageComponentCollector({
            time: 30000,
            componentType: discord_js_1.ComponentType['Button'],
            max: 1,
        });
        collector.on('collect', (collected) => {
            if (interaction.user.id !== collected.user.id)
                return;
            var areMatching = key1 === key2;
            collector.stop('success');
            if ((areMatching && collected.customId === 'verify-1') ||
                (!areMatching && collected.customId === 'verify-2')) {
                const verifedEmbed = new discord_js_1.EmbedBuilder()
                    .setColor(__1.client.cc.successC)
                    .setDescription('Congrats! You were verified in the server.');
                if (!interaction.guild.roles.cache.get(config_json_1.guild.memberRoleId))
                    return;
                interaction.member.roles.add(config_json_1.guild.memberRoleId);
                interaction.editReply({ embeds: [verifedEmbed], components: [] });
            }
            else {
                const deniedEmbed = new discord_js_1.EmbedBuilder()
                    .setColor(__1.client.cc.errorC)
                    .setDescription("Whoops, your answer wasn't correct. Try again to get verified.");
                interaction.editReply({ embeds: [deniedEmbed], components: [] });
            }
        });
        collector.on('end', (_, reason) => {
            if (reason === 'success')
                return;
            const timedOut = new discord_js_1.EmbedBuilder()
                .setColor(__1.client.cc.errorC)
                .setDescription('Verification timed out, try again to verify yourself.');
            interaction.editReply({ embeds: [timedOut], components: [] });
        });
    }
    else if (verifiactionMode <= 5) {
        generateKey1();
        const modal = new discord_js_1.ModalBuilder()
            .setTitle('Verification | Code: ' + key1)
            .setCustomId('verify-' + interaction.user.id)
            .addComponents([
            {
                type: discord_js_1.ComponentType.ActionRow,
                components: [
                    {
                        type: discord_js_1.ComponentType.TextInput,
                        custom_id: 'verify-' + interaction.user.id,
                        label: 'Your Code: ' + key1,
                        style: discord_js_1.TextInputStyle['Short'],
                        required: true,
                        max_length: 5,
                        min_length: 5,
                        placeholder: `Enter your verification code...`,
                    },
                ],
            },
        ]);
        await interaction.showModal(modal);
        constants_1.verificationCollection.set('modal-' + interaction.user.id, key1);
    }
});
