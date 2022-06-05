"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientUtil = void 0;
const discord_js_1 = require("discord.js");
const functions_1 = require("./functions");
class clientUtil {
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
}
exports.clientUtil = clientUtil;
