"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationButtons = exports.buildConfirmationButtons = exports.splitTextFunction = exports.capitalizeFunction = void 0;
const discord_js_1 = require("discord.js");
const constants_1 = require("../../constants");
// Capitalize
function capitalizeFunction(str) {
    str = str.replace(/\_/g, ' ');
    const split = str.trim().split(' ');
    const splitFixed = [];
    split.forEach((e) => {
        e = e.charAt(0).toUpperCase() + e.slice(1).toLocaleLowerCase();
        splitFixed.push(e);
    });
    return splitFixed.join(' ');
}
exports.capitalizeFunction = capitalizeFunction;
function splitTextFunction(text, options) {
    const splitFor = options?.splitFor;
    const splitCustom = options?.splitCustom;
    const endsWith = options?.endsWith ? options?.endsWith : '...';
    let splitValue;
    if (splitFor) {
        switch (splitFor) {
            case 'Embed Description':
                splitValue = constants_1.EMBED_DESCRIPTION_MAX_LENGTH - endsWith.length;
                break;
            case 'Message Content':
                splitValue = 4000 - endsWith.length;
                break;
            case 'Embed Field Value':
                splitValue = 1024 - endsWith.length;
                break;
            case 'Embed Field Name':
                splitValue = 256 - endsWith.length;
                break;
        }
    }
    else if (!splitFor) {
        splitValue = splitCustom - endsWith.length;
    }
    if (text.length > splitValue)
        text = text.slice(0, splitValue) + endsWith;
    return text;
}
exports.splitTextFunction = splitTextFunction;
function buildConfirmationButtons(firstLabel, secondLabel) {
    return new discord_js_1.ActionRowBuilder().setComponents([
        new discord_js_1.ButtonBuilder().setLabel(firstLabel).setStyle(discord_js_1.ButtonStyle.Success).setCustomId('1'),
        new discord_js_1.ButtonBuilder().setLabel(secondLabel).setStyle(discord_js_1.ButtonStyle.Danger).setCustomId('2'),
    ]);
}
exports.buildConfirmationButtons = buildConfirmationButtons;
function buildPaginationButtons() {
    return new discord_js_1.ActionRowBuilder().setComponents([
        new discord_js_1.ButtonBuilder()
            .setCustomId('1')
            .setEmoji({ name: '◀️' })
            .setStyle(discord_js_1.ButtonStyle.Primary),
        new discord_js_1.ButtonBuilder()
            .setCustomId('2')
            .setEmoji({ name: '▶️' })
            .setStyle(discord_js_1.ButtonStyle.Primary),
    ]);
}
exports.buildPaginationButtons = buildPaginationButtons;
