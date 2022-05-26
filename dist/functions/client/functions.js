"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationButtons = exports.buildConfirmationButtons = exports.timeConvertFunction = exports.splitTextFunction = exports.capitalizeFunction = void 0;
const discord_js_1 = require("discord.js");
const __1 = require("../..");
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
function timeConvertFunction(time, options) {
    // Valuables
    const joinWith = options?.joinWith ? ` ${options?.joinWith} ` : ' and ';
    const surroundedBy = options?.surrounded ? options?.surrounded : '';
    if (!options)
        joinWith === 'and ';
    surroundedBy === '';
    // Calculating each value
    time = time * 1000;
    const daysTimestamp = Math.floor(time / 86400000);
    time -= daysTimestamp * 86400000;
    const hoursTimestamp = Math.floor(time / 3600000);
    time -= hoursTimestamp * 3600000;
    const minutesTimestamp = Math.floor(time / 60000);
    time -= minutesTimestamp * 60000;
    const secondsTimestamp = Math.floor(time / 1000);
    // Strings
    const daysString = daysTimestamp <= 0 ? '' : daysTimestamp == 1 ? ' day' : ' days', hoursString = hoursTimestamp <= 0 ? '' : hoursTimestamp == 1 ? ' hour' : ' hours', minutesString = minutesTimestamp <= 0 ? '' : minutesTimestamp == 1 ? ' minute' : ' minutes', secondsString = secondsTimestamp <= 0 ? '' : secondsTimestamp == 1 ? ' second' : ' seconds';
    // Join with
    const daysJoin = '', hoursJoin = daysTimestamp <= 0 ? '' : joinWith, minutesJoin = hoursTimestamp <= 0 ? '' : joinWith, secondsJoin = minutesTimestamp <= 0 ? '' : joinWith;
    // Ignoring missing time values and adding rounds
    const days = daysTimestamp <= 0
        ? ''
        : surroundedBy + daysTimestamp.toLocaleString() + surroundedBy, hours = hoursTimestamp <= 0
        ? ''
        : surroundedBy + hoursTimestamp.toLocaleString() + surroundedBy, minutes = minutesTimestamp <= 0
        ? ''
        : surroundedBy + minutesTimestamp.toLocaleString() + surroundedBy, seconds = secondsTimestamp <= 0
        ? ''
        : surroundedBy + secondsTimestamp.toLocaleString() + surroundedBy;
    // Final results
    const daysFinal = daysJoin + days + daysString, hoursFinal = hoursJoin + hours + hoursString, minutesFinal = minutesJoin + minutes + minutesString, secondsFinal = secondsJoin + seconds + secondsString;
    let output = daysFinal + hoursFinal + minutesFinal + secondsFinal;
    if (output.endsWith(joinWith))
        output = output.slice(0, 0 - joinWith.length);
    return output;
}
exports.timeConvertFunction = timeConvertFunction;
function buildConfirmationButtons(firstLabel, secondLabel) {
    return __1.client.util
        .actionRow()
        .addComponents(__1.client.util
        .button()
        .setLabel(firstLabel)
        .setStyle(discord_js_1.ButtonStyle['Success'])
        .setCustomId('1'), __1.client.util
        .button()
        .setLabel(secondLabel)
        .setStyle(discord_js_1.ButtonStyle['Danger'])
        .setCustomId('2'));
}
exports.buildConfirmationButtons = buildConfirmationButtons;
function buildPaginationButtons() {
    return __1.client.util
        .actionRow()
        .addComponents(__1.client.util
        .button()
        .setCustomId('1')
        .setEmoji({ name: __1.client.cc.previous })
        .setStyle(discord_js_1.ButtonStyle['Primary']), __1.client.util
        .button()
        .setCustomId('2')
        .setEmoji({ name: __1.client.cc.next })
        .setStyle(discord_js_1.ButtonStyle['Primary']));
}
exports.buildPaginationButtons = buildPaginationButtons;
