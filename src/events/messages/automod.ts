import { GuildMember, Message, PermissionResolvable, TextChannel, Util } from 'discord.js';
import { client } from '../..';
import {
	automodPunishmentExpiry,
	AUTOMOD_MAX_CAPS,
	AUTOMOD_MAX_EMOJI_COUNT,
	AUTOMOD_SPAM_COUNT,
} from '../../constants';
import { Event } from '../../structures/Event';
import { ignore } from '../../json/automod.json';
import { automodModel } from '../../models/automod';
import { automodSpamCollection } from '../../constants';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateAutomodId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { sendModDM } from '../../utils/sendModDM';
import { guildId } from '../../json/config.json';
const config = client.config.automod;
const bypassRoleId = ignore['bypass-roleId'];
const categoryIgnores = ignore['categoryIds'];
const channelIgnores = ignore['channelNames'];
const roleIgnores = ignore['roleIds'];
const permissionIgnores = ignore['permissions'];

export default new Event('messageCreate', async (message) => {
	const member = message.member as GuildMember;
	const textChannel = message.channel as TextChannel;

	// Main Reqs
	if (
		!message.guild ||
		message.guildId !== guildId ||
		message.author.bot ||
		!message.content ||
		member.roles.cache.has(bypassRoleId)
	)
		return;

	// Spam Collector
	if (config.modules.spam && !getsIgnored('spam')) {
		switch (automodSpamCollection.get(message.author.id)) {
			case undefined:
				automodSpamCollection.set(message.author.id, 1);
				break;
			default:
				const currectCount = automodSpamCollection.get(message.author.id);
				automodSpamCollection.set(message.author.id, currectCount + 1);
				setTimeout(() => {
					switch (currectCount) {
						case undefined:
							break;
						case 1:
							automodSpamCollection.delete(message.author.id);
							break;
						default:
							automodSpamCollection.set(message.author.id, currectCount - 1);
							break;
					}
				}, 2000);
				break;
		}
	}

	if (
		message.content.length > 550 &&
		config.modules.largeMessage &&
		!getsIgnored('large-message')
	) {
		message?.delete();
		textChannel
			.send({
				content: `${message.author} you may not send large messages here.`,
				allowedMentions: { parse: ['users'] },
			})
			.then((msg) =>
				setTimeout(() => {
					msg?.delete();
				}, 7000)
			);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['large-message'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentType.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['large-message'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		isDiscordInvite(message.content) &&
		config.modules.invites &&
		!getsIgnored('invites')
	) {
		message?.delete();
		textChannel
			.send({
				content: `${message.author} you may not send discord invites here.`,
				allowedMentions: { parse: ['users'] },
			})
			.then((msg) =>
				setTimeout(() => {
					msg?.delete();
				}, 7000)
			);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['invites'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentType.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['invites'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (isURL(message.content) && config.modules.urls && !getsIgnored('urls')) {
		message?.delete();
		textChannel
			.send({
				content: `${message.author} you may not send links and urls.`,
				allowedMentions: { parse: ['users'] },
			})
			.then((msg) =>
				setTimeout(() => {
					msg?.delete();
				}, 7000)
			);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['urls'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentType.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['urls'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		message.mentions?.members.size > 4 &&
		config.modules.massMention &&
		!getsIgnored('mass-mention')
	) {
		message?.delete();
		textChannel
			.send({
				content: `${message.author} you may not mention more than 4 people.`,
				allowedMentions: { parse: ['users'] },
			})
			.then((msg) =>
				setTimeout(() => {
					msg?.delete();
				}, 7000)
			);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['mass-mention'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentType.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['mass-mention'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (mostIsCap(message.content) && config.modules.capitals && !getsIgnored('capitals')) {
		message?.delete();
		textChannel
			.send({
				content: `${message.author} you may not use this many capital letters.`,
				allowedMentions: { parse: ['users'] },
			})
			.then((msg) =>
				setTimeout(() => {
					msg?.delete();
				}, 7000)
			);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['capitals'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentType.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['capitals'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		mostIsEmojis(message.content) &&
		config.modules.massEmoji &&
		!getsIgnored('mass-emoji')
	) {
		message?.delete();
		textChannel
			.send({
				content: `${message.author} you may not use this many emojis.`,
				allowedMentions: { parse: ['users'] },
			})
			.then((msg) =>
				setTimeout(() => {
					msg?.delete();
				}, 7000)
			);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['mass-emoji'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentType.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['mass-emoji'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		config.filteredWords.some((word) => message.content.toUpperCase().includes(word)) &&
		config.modules.badwords &&
		!getsIgnored('badwords')
	) {
		message?.delete();
		textChannel
			.send({
				content: `${message.author} you may not use that word in the chat.`,
				allowedMentions: { parse: ['users'] },
			})
			.then((msg) =>
				setTimeout(() => {
					msg?.delete();
				}, 7000)
			);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['badwords'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentType.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['badwords'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		automodSpamCollection.get(message.author.id) === AUTOMOD_SPAM_COUNT &&
		config.modules.spam &&
		!getsIgnored('spam')
	) {
		automodSpamCollection.delete(message.author.id);

		let sentMessage = (await textChannel.send({
			content: `${message.author} you may not send messages this quick.`,
			allowedMentions: { parse: ['users'] },
		})) as Message;
		setTimeout(() => {
			sentMessage?.delete();
		}, 7000);

		var fetchMessage = await textChannel.messages.fetch({ limit: 9, before: message.id });
		var filteredMessage = fetchMessage.filter(
			(msg) => !msg.pinned && msg.author.id === message.author.id
		);

		await textChannel.bulkDelete(filteredMessage, true);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['spam'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentType.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['spam'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	}

	// Functions
	function getsIgnored(type: types) {
		if (
			member.permissions?.has('Administrator') ||
			channelIgnores[type.toString()].includes(textChannel.name) ||
			categoryIgnores[type.toString()].includes(textChannel.parentId) ||
			roleIgnores[type.toString()].some((roleId: string) =>
				member.roles.cache.get(roleId)
			) ||
			permissionIgnores[type.toString()].some((permission: string) =>
				member.permissions.has(permission as PermissionResolvable)
			)
		)
			return true;
		else return false;
	}
	async function checkForAutoPunish(warnData: any) {
		const punishmentFind = await automodModel.find({
			userId: message.author.id,
			type: PunishmentType.Warn,
		});
		const punishmentCount = punishmentFind.length;

		if (punishmentCount % client.config.moderation.count.automod === 0) {
			await timeoutMember(message.member, {
				reason: `Reaching ${punishmentCount} automod warnings.`,
				duration: client.config.moderation.duration.automod,
			});
			const data = new automodModel({
				_id: await generateAutomodId(),
				case: await getModCase(),
				type: PunishmentType.Timeout,
				userId: message.author.id,
				date: new Date(),
				expire: automodPunishmentExpiry,
				reason: `Reaching ${punishmentCount} automod warnings.`,
			});
			data.save();

			sendModDM(message.member, {
				action: PunishmentType.Timeout,
				punishment: data,
				expire: new Date(Date.now() + client.config.moderation.duration.automod),
				automod: true,
			});

			await createModLog({
				action: PunishmentType.Timeout,
				punishmentId: data._id,
				user: message.author,
				moderator: client.user,
				duration: client.config.moderation.duration.automod,
				reason: `Reaching ${punishmentCount} automod warnings.`,
				referencedPunishment: warnData,
				expire: automodPunishmentExpiry,
			});
		}
	}
});

// Functions
function isDiscordInvite(str: string) {
	var res = str.match(
		/(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?pp?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/
	);
	return res !== null;
}
function isURL(str: string) {
	var res = str.match(
		/(?:https?:\/\/)(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/gi
	);
	return res !== null;
}
function mostIsCap(str: string) {
	if (str.length <= 30) return false;
	const capitals: string[] = [],
		nonCapitals: string[] = [],
		allStr = str
			.replaceAll(' ', '')
			.split('')
			.filter((foo) => foo.match(/^[A-Za-z]+$/));

	if (!allStr) return false;
	allStr.forEach((str) => {
		if (str === str.toUpperCase()) capitals.push(str);
		else if (str === str.toLowerCase()) nonCapitals.push(str);
	});

	if (capitals.length > nonCapitals.length) {
		if ((capitals.length / nonCapitals.length) * 100 > AUTOMOD_MAX_CAPS) return true;
		else return false;
	} else return false;
}
function mostIsEmojis(str: string) {
	const countEmojis = [];
	for (const rawStr of str.trim().split(/ +/g)) {
		const parseEmoji = Util.parseEmoji(rawStr);
		if (parseEmoji?.id) countEmojis.push(rawStr);
	}
	if (countEmojis.length > AUTOMOD_MAX_EMOJI_COUNT) {
		return true;
	} else {
		return false;
	}
}

// Typings
type types =
	| 'badwords'
	| 'links'
	| 'invites'
	| 'mass-mention'
	| 'mass-emoji'
	| 'large-message'
	| 'spam'
	| 'capitals'
	| 'urls';
enum reasons {
	'badwords' = 'Sending filtered words in the chat.',
	'invites' = 'Sending discord invite links in the chat.',
	'large-message' = 'Sending a large message in content.',
	'mass-mention' = 'Mentioning more than 4 people.',
	'mass-emoji' = 'Sending too many emojis at once.',
	'spam' = 'Sending messages too quickly.',
	'capitals' = 'Using too many capital letters.',
	'urls' = 'Sending links and urls.',
}
