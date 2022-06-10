"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PunishmentType = void 0;
/**
 * @description The types of the available punishments.
 * @returns The unique code for each punishment.
 * */
var PunishmentType;
(function (PunishmentType) {
    PunishmentType["Warn"] = "WARN";
    PunishmentType["Kick"] = "KICK";
    PunishmentType["Ban"] = "BAN";
    PunishmentType["Timeout"] = "TIMEOUT";
    PunishmentType["Unmute"] = "UNMUTE";
    PunishmentType["Unban"] = "UNBAN";
    PunishmentType["Softban"] = "SOFTBAN";
    PunishmentType["Unknown"] = "UNKNOWN";
})(PunishmentType = exports.PunishmentType || (exports.PunishmentType = {}));
