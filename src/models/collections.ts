import { Collection } from 'discord.js';

// Verificatoon
export const verificationCollection: Collection<string, string | number> = new Collection();

// Automod Spam
export const automodSpamCollection: Collection<string, number> = new Collection();
