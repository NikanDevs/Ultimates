"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const Logger_1 = require("./structures/Logger");
exports.logger = new Logger_1.Logger({ timezone: 'fa-IR' });
exports.logger.born();
