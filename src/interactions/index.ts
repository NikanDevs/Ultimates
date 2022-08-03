import { punishmentsContextmenu } from './context-menu/Punishments';
import { evalCommand } from './developer/eval';
import { antiRaidCommand } from './moderation/antiraid';
import { banCommand } from './moderation/ban';
import { kickCommand } from './moderation/kick';
import { lockdownCommand } from './moderation/lockdown';
import { nicknameCommand } from './moderation/nickname';
import { punishmentCommand } from './moderation/punishment';
import { purgeCommand } from './moderation/purge';
import { roleCommand } from './moderation/role';
import { slowmodeCommand } from './moderation/slowmode';
import { softbanCommand } from './moderation/softban';
import { timeoutCommand } from './moderation/timeout';
import { unbanCommand } from './moderation/unban';
import { warnCommand } from './moderation/warn';
import { warningsCommand } from './moderation/warnings';
import { modmailCommand } from './modmail/modmail';
import { configureCommand } from './utility/configure';
import { pingCommand } from './utility/ping';
import { staffCommand } from './utility/staff';
import { userinfoCommand } from './utility/userinfo';
import { verificationCommand } from './utility/verification';

export const interactions = {
	Punishments: punishmentsContextmenu,
	eval: evalCommand,
	antiraid: antiRaidCommand,
	ban: banCommand,
	kick: kickCommand,
	lockdown: lockdownCommand,
	nickname: nicknameCommand,
	punishment: punishmentCommand,
	purge: purgeCommand,
	role: roleCommand,
	slowmode: slowmodeCommand,
	softban: softbanCommand,
	timeout: timeoutCommand,
	unban: unbanCommand,
	warn: warnCommand,
	warnings: warningsCommand,
	modmail: modmailCommand,
	configure: configureCommand,
	ping: pingCommand,
	staff: staffCommand,
	userinfo: userinfoCommand,
	verification: verificationCommand,
};
