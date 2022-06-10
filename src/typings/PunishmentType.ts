/**
 * @description The types of the available punishments.
 * @returns The unique code for each punishment.
 * */
export enum PunishmentType {
	Warn = 'WARN',
	Kick = 'KICK',
	Ban = 'BAN',
	Timeout = 'TIMEOUT',
	Unmute = 'UNMUTE',
	Unban = 'UNBAN',
	Softban = 'SOFTBAN',
	Unknown = 'UNKNOWN',
}
