"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientUtil = void 0;
const discord_js_1 = require("discord.js");
const functions_1 = require("./functions");
// type buttonStyles =
//     "Danger" | "Link" | "Primary" | "Secondary" | "Success";
class clientUtil {
    convertTime = functions_1.timeConvertFunction;
    resolve = {
        color: (color) => {
            return discord_js_1.Util.resolveColor(color);
        },
    };
    build = {
        confirmationButtons: functions_1.buildConfirmationButtons,
        paginator: functions_1.buildPaginationButtons,
    };
    capitalize = functions_1.capitalizeFunction;
    splitText = functions_1.splitTextFunction;
    embed(...args) {
        return new discord_js_1.Embed(...args);
    }
    actionRow(...args) {
        return new discord_js_1.ActionRow(...args);
    }
    button(...args) {
        return new discord_js_1.ButtonComponent(...args);
    }
    modal(...args) {
        return new discord_js_1.Modal(...args);
    }
}
exports.clientUtil = clientUtil;
