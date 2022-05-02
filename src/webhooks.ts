import { WebhookClient } from 'discord.js';
import { webhooks } from './json/database.json';

function getWebhookInfo(url: string) {
	const filtered = url.replaceAll('https://discord.com/api/webhooks/', '');
	const returns: string[] = [];
	returns.push(filtered.split('/')[0]);
	returns.push(filtered.split('/')[1]);

	return returns;
}

export const errorHandler = new WebhookClient({
	id: getWebhookInfo(webhooks['error-handler'])[0],
	token: getWebhookInfo(webhooks['error-handler'])[1],
});

export const moderationLogging = new WebhookClient({
	id: getWebhookInfo(webhooks['mod-logs'])[0],
	token: getWebhookInfo(webhooks['mod-logs'])[1],
});

export const rmpunishmentLogging = new WebhookClient({
	id: getWebhookInfo(webhooks['rmpunish-logs'])[0],
	token: getWebhookInfo(webhooks['rmpunish-logs'])[1],
});

export const joinAndLeaveLogging = new WebhookClient({
	id: getWebhookInfo(webhooks['server-gate'])[0],
	token: getWebhookInfo(webhooks['server-gate'])[1],
});

export const messageLogging = new WebhookClient({
	id: getWebhookInfo(webhooks['message-logs'])[0],
	token: getWebhookInfo(webhooks['message-logs'])[1],
});

export const modmailLogging = new WebhookClient({
	id: getWebhookInfo(webhooks['modmail'])[0],
	token: getWebhookInfo(webhooks['modmail'])[1],
});
