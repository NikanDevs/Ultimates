"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const __1 = require("../..");
function logActivity(type) {
    if (__1.client.databaseConfig.logsActive[type] === null ||
        __1.client.databaseConfig.logsActive[type] === false) {
        return false;
    }
    else
        return true;
}
exports.logActivity = logActivity;
