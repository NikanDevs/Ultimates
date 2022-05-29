"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactions = void 0;
const Punishments_1 = require("./context-menu/Punishments");
const eval_1 = require("./developer/eval");
const ban_1 = require("./moderation/ban");
const kick_1 = require("./moderation/kick");
const lockdown_1 = require("./moderation/lockdown");
const nickname_1 = require("./moderation/nickname");
const punishment_1 = require("./moderation/punishment");
const purge_1 = require("./moderation/purge");
const role_1 = require("./moderation/role");
const slowmode_1 = require("./moderation/slowmode");
const softban_1 = require("./moderation/softban");
const timeout_1 = require("./moderation/timeout");
const unban_1 = require("./moderation/unban");
const warn_1 = require("./moderation/warn");
const warnings_1 = require("./moderation/warnings");
const modmail_1 = require("./modmail/modmail");
const configure_1 = require("./utility/configure");
const ping_1 = require("./utility/ping");
const staff_1 = require("./utility/staff");
const userinfo_1 = require("./utility/userinfo");
exports.interactions = {
    Punishments: Punishments_1.punishmentsContextmenu,
    eval: eval_1.evalCommand,
    ban: ban_1.banCommand,
    kick: kick_1.kickCommand,
    lockdown: lockdown_1.lockdownCommand,
    nickname: nickname_1.nicknameCommand,
    punishment: punishment_1.punishmentCommand,
    purge: purge_1.purgeCommand,
    role: role_1.roleCommand,
    slowmode: slowmode_1.slowmodeCommand,
    softban: softban_1.softbanCommand,
    timeout: timeout_1.timeoutCommand,
    unban: unban_1.unbanCommand,
    warn: warn_1.warnCommand,
    warnings: warnings_1.warningsCommand,
    modmail: modmail_1.modmailCommand,
    configure: configure_1.configureCommand,
    ping: ping_1.pingCommand,
    staff: staff_1.staffCommand,
    userinfo: userinfo_1.userinfoCommand,
};
