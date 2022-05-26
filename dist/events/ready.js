"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const Event_1 = require("../structures/Event");
exports.default = new Event_1.Event('ready', async (client) => {
    logger_1.logger.info(`Logged in as ${client.user.tag}`, { showDate: false });
});
