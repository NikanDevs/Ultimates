"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutMember = void 0;
const modCase_1 = require("../functions/cases/modCase");
const durations_1 = require("../models/durations");
const PunishmentType_1 = require("../typings/PunishmentType");
async function timeoutMember(member, options) {
    await member.timeout(options['duration'], options['reason']);
    const data = new durations_1.durationsModel({
        case: await (0, modCase_1.getModCase)(),
        type: PunishmentType_1.PunishmentType.Timeout,
        userId: member.user.id,
        date: new Date(),
        duration: options.duration,
    });
    await data.save();
}
exports.timeoutMember = timeoutMember;
