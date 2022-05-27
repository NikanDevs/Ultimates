import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	PermissionResolvable,
} from 'discord.js';
import { Ultimates } from '../structures/Client';

export interface excuteOptions {
	client?: Ultimates;
	interaction?: CommandInteraction;
	options?: CommandInteractionOptionResolver;
}

type excuteFunction = (options: excuteOptions) => any;

type directories = 'moderation' | 'developer' | 'utility' | 'modmail';

export type interactionOptions = {
	name: string;
	description: string;
	directory: directories;
	aliases?: string[];
	cooldown?: number;
	permission?: PermissionResolvable[];
	available?: boolean;
} & ChatInputApplicationCommandData;

export type interactionType = {
	interaction: any;
	excute: excuteFunction;
};
