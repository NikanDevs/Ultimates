import { GuildMember, Message, PermissionResolvable, TextChannel, Util } from 'discord.js';
import { client } from '../..';
import { automodPunishmentExpiry } from '../../constants';
import { Event } from '../../structures/Event';
import { badwords, ignore, enabledModules, counts } from '../../json/automod.json';
import { automodModel } from '../../models/automod';
import { automodSpamCollection } from '../../constants';
import { PunishmentType } from '../../typings/PunishmentType';
import { generateAutomodId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { generateDiscordTimestamp } from '../../utils/generateDiscordTimestamp';
const bypassRoleId = ignore['bypass-roleId'];
const categoryIgnores = ignore['categoryIds'];
const channelIgnores = ignore['channelNames'];
const roleIgnores = ignore['roleIds'];
const permissionIgnores = ignore['permissions'];

export default new Event('messageCreate', async (message) => {
	const guildMember = message.member as GuildMember;
	const textChannel = message.channel as TextChannel;

	// Main Reqs
	if (
		!message.guild ||
		message.guildId !== client.server.id ||
		message.author.bot ||
		!message.content ||
		guildMember.roles.cache.has(bypassRoleId)
	)
		return;

	// Spam Collector
	if (enabledModules.spam && !(await getsIgnored('spam'))) {
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
		enabledModules['large-message'] &&
		!(await getsIgnored('large-message'))
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
			_id: generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['large-message'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendDM({
			reason: reasons['large-message'],
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
		enabledModules.invites &&
		!(await getsIgnored('invites'))
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
			_id: generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['invites'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendDM({
			reason: reasons['invites'],
		});
		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['invites'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (isURL(message.content) && enabledModules.urls && !(await getsIgnored('urls'))) {
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
			_id: generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['urls'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendDM({
			reason: reasons['urls'],
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
		enabledModules['mass-mention'] &&
		!(await getsIgnored('mass-mention'))
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
			_id: generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['mass-mention'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendDM({
			reason: reasons['mass-mention'],
		});
		await createModLog({
			action: PunishmentType.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: reasons['mass-mention'],
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		mostIsCap(message.content) &&
		enabledModules.capitals &&
		!(await getsIgnored('capitals'))
	) {
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
			_id: generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['capitals'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendDM({
			reason: reasons['capitals'],
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
		enabledModules['mass-emoji'] &&
		!(await getsIgnored('mass-emoji'))
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
			_id: generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['mass-emoji'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendDM({
			reason: reasons['mass-emoji'],
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
		badwords.some((word) => message.content.toUpperCase().includes(word)) &&
		enabledModules.badwords &&
		!(await getsIgnored('badwords'))
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
			_id: generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['badwords'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendDM({
			reason: reasons['badwords'],
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
		automodSpamCollection.get(message.author.id) === counts['spam_count'] &&
		enabledModules.spam &&
		!(await getsIgnored('spam'))
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
			_id: generateAutomodId(),
			case: await getModCase(),
			type: PunishmentType.Warn,
			userId: message.author.id,
			reason: reasons['spam'],
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendDM({
			reason: reasons['spam'],
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

	// Interfaces
	interface sendDMoptions {
		reason: string;
	}
	interface muteDMoptions {
		duration: number;
		reason: string;
	}

	// Functions
	async function sendDM(options: sendDMoptions) {
		const DMembed = client.util
			.embed()
			.setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
			.setColor(client.colors.moderation)
			.setTitle(`You were warned in ${message.guild.name}`)
			.addFields(
				{
					name: 'Type',
					value: 'Automod',
					inline: true,
				},
				{
					name: 'Expiry',
					value: generateDiscordTimestamp(new Date()),
					inline: true,
				},
				{
					name: 'Reason',
					value: options.reason,
					inline: false,
				}
			);

		(message.member as GuildMember).send({ embeds: [DMembed] }).catch;
		() => {};
	}
	async function getsIgnored(type: types) {
		if (
			channelIgnores[type.toString()].includes(textChannel.name) ||
			categoryIgnores[type.toString()].includes(textChannel.parentId) ||
			roleIgnores[type.toString()].some((roleId: string) =>
				guildMember.roles.cache.get(roleId)
			) ||
			permissionIgnores[type.toString()].some((permission: string) =>
				guildMember.permissions.has(permission as PermissionResolvable)
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

		async function muteDM(options: muteDMoptions) {
			const DMembed = client.util
				.embed()
				.setAuthor({
					name: client.user.username,
					iconURL: client.user.displayAvatarURL(),
				})
				.setColor(client.colors.moderation)
				.setTitle(`You were timed out in ${message.guild.name}`)
				.addFields(
					{
						name: 'Type',
						value: 'Automod',
						inline: true,
					},
					{
						name: 'Duration',
						value: client.util.convertTime(options.duration / 1000),
						inline: true,
					},
					{
						name: 'Reason',
						value: options.reason,
						inline: false,
					}
				);

			(message.member as GuildMember).send({ embeds: [DMembed] }).catch(() => {});
		}

		if (punishmentCount == 2) {
			const muteDurationAt2 = 1000 * 60 * 30;
			await timeoutMember(message.member, {
				reason: 'Reaching 2 automod warnings.',
				duration: muteDurationAt2,
			});
			muteDM({ duration: muteDurationAt2, reason: 'Reaching 2 automod warnings' });
			const data = new automodModel({
				_id: generateAutomodId(),
				case: await getModCase(),
				type: PunishmentType.Timeout,
				userId: message.author.id,
				date: new Date(),
				expire: automodPunishmentExpiry,
				reason: 'Reaching 2 automod warnings.',
			});
			data.save();

			await createModLog({
				action: PunishmentType.Timeout,
				punishmentId: data._id,
				user: message.author,
				moderator: client.user,
				duration: muteDurationAt2,
				reason: 'Reaching 2 automod warnings.',
				referencedPunishment: warnData,
				expire: automodPunishmentExpiry,
			});
		} else if (punishmentCount > 2) {
			const muteDurationAtmore2 = 1000 * 60 * 60;
			await timeoutMember(message.member, {
				reason: `Reaching ${punishmentCount} automod warnings.`,
				duration: muteDurationAtmore2,
			});
			const data = new automodModel({
				_id: generateAutomodId(),
				case: getModCase(),
				type: PunishmentType.Timeout,
				userId: message.author.id,
				date: new Date(),
				expire: automodPunishmentExpiry,
				reason: `Reaching ${punishmentCount} automod warnings.`,
			});
			data.save();

			await createModLog({
				action: PunishmentType.Timeout,
				punishmentId: data._id,
				user: message.author,
				moderator: client.user,
				duration: muteDurationAtmore2,
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
		if ((capitals.length / nonCapitals.length) * 100 > counts['max_caps_percentage'])
			return true;
		else return false;
	} else return false;
}
function mostIsEmojis(str: string) {
	const countEmojis = [];
	for (const rawStr of str.trim().split(/ +/g)) {
		const parseEmoji = Util.parseEmoji(rawStr);
		if (parseEmoji?.id) countEmojis.push(rawStr);
	}
	if (countEmojis.length > counts['max_emoji']) {
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
