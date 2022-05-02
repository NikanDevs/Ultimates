import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	PermissionResolvable,
	Message,
} from 'discord.js';
import { nikansUtil } from '../structures/Client';

interface excuteOptions {
	client: nikansUtil;
	interaction?: CommandInteraction;
	message?: Message;
	args?: string[];
	options?: CommandInteractionOptionResolver;
}

type excuteFunction = (options: excuteOptions) => any;

type directories = 'moderation' | 'developer' | 'utility' | 'secret' | 'server' | 'modmail';

export type commandType = {
	name: string;
	description: string;
	directory: directories;
	aliases?: string[];
	cooldown?: number;
	permission?: PermissionResolvable[];
	available?: boolean;
	excute: excuteFunction;
} & ChatInputApplicationCommandData;