import { GuildMember, Message, TextChannel } from 'discord.js';
import { client } from '../..';
import {
	automodPunishmentExpiry,
	AUTOMOD_MAX_MENTIONS,
	AUTOMOD_MAX_MESSAGE_LENGTH,
	AUTOMOD_SPAM_COUNT,
} from '../../constants';
import { Event } from '../../structures/Event';
import { automodModel } from '../../models/automod';
import { automodSpamCollection } from '../../constants';
import { PunishmentTypes } from '../../typings';
import { generateAutomodId } from '../../utils/generatePunishmentId';
import { getModCase } from '../../functions/cases/modCase';
import { createModLog } from '../../functions/logs/createModLog';
import { timeoutMember } from '../../utils/timeoutMember';
import { sendModDM } from '../../utils/sendModDM';
import { isURL } from '../../functions/automod/isURL';
import { isDiscordInvite } from '../../functions/automod/isDiscordInvite';
import { mostIsCap } from '../../functions/automod/mostIsCaps';
import { mostIsEmojis } from '../../functions/automod/mostIsEmojis';
import { type AutomodModules, automodModuleReasons } from '../../typings';
import { t } from 'i18next';
const config = client.config.automod;

export default new Event('messageCreate', async (message) => {
	const member = message.member as GuildMember;
	const textChannel = message.channel as TextChannel;

	// Main Reqs
	if (
		!message.guild ||
		message.guildId !== process.env.GUILD_ID ||
		message.author.bot ||
		!message.content ||
		member.permissions?.has('Administrator')
	)
		return;

	// Spam Collector
	if (config.modules.spam && !ignore('spam')) {
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
		message.content.length > AUTOMOD_MAX_MESSAGE_LENGTH &&
		config.modules.largeMessage &&
		!ignore('largeMessage')
	) {
		message?.delete();
		textChannel
			.send({
				content: t('event.automod.largeMessage', { user: message.author.toString() }),
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
			type: PunishmentTypes.Warn,
			userId: message.author.id,
			reason: automodModuleReasons.largeMessage,
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentTypes.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: automodModuleReasons.largeMessage,
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (isDiscordInvite(message.content) && config.modules.invites && !ignore('invites')) {
		message?.delete();
		textChannel
			.send({
				content: t('event.automod.invites', { user: message.author.toString() }),
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
			type: PunishmentTypes.Warn,
			userId: message.author.id,
			reason: automodModuleReasons.invites,
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentTypes.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: automodModuleReasons.invites,
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (isURL(message.content) && config.modules.urls && !ignore('urls')) {
		message?.delete();
		textChannel
			.send({
				content: t('event.automod.urls', { user: message.author.toString() }),
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
			type: PunishmentTypes.Warn,
			userId: message.author.id,
			reason: automodModuleReasons.urls,
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentTypes.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: automodModuleReasons.urls,
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		message.mentions?.members.size > AUTOMOD_MAX_MENTIONS &&
		config.modules.massMention &&
		!ignore('massMention')
	) {
		message?.delete();
		textChannel
			.send({
				content: t('event.automod.massMention', {
					user: message.author.toString(),
					count: AUTOMOD_MAX_MENTIONS,
				}),
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
			type: PunishmentTypes.Warn,
			userId: message.author.id,
			reason: automodModuleReasons.massMention,
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentTypes.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: automodModuleReasons.massMention,
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (mostIsCap(message.content) && config.modules.capitals && !ignore('capitals')) {
		message?.delete();
		textChannel
			.send({
				content: t('event.automod.capitals', { user: message.author.toString() }),
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
			type: PunishmentTypes.Warn,
			userId: message.author.id,
			reason: automodModuleReasons.capitals,
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentTypes.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: automodModuleReasons.capitals,
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (mostIsEmojis(message.content) && config.modules.massEmoji && !ignore('massEmoji')) {
		message?.delete();
		textChannel
			.send({
				content: t('event.automod.massEmoji', { user: message.author.toString() }),
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
			type: PunishmentTypes.Warn,
			userId: message.author.id,
			reason: automodModuleReasons.massEmoji,
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentTypes.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: automodModuleReasons.massEmoji,
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		config.filteredWords.some((word) => message.content.toUpperCase().includes(word.toUpperCase())) &&
		config.modules.badwords &&
		!ignore('badwords')
	) {
		message?.delete();
		textChannel
			.send({
				content: t('event.automod.badwords', { user: message.author.toString() }),
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
			type: PunishmentTypes.Warn,
			userId: message.author.id,
			reason: automodModuleReasons.badwords,
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentTypes.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: automodModuleReasons.badwords,
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	} else if (
		automodSpamCollection.get(message.author.id) === AUTOMOD_SPAM_COUNT &&
		config.modules.spam &&
		!ignore('spam')
	) {
		automodSpamCollection.delete(message.author.id);

		let sentMessage = (await textChannel.send({
			content: t('event.automod.spam', { user: message.author.toString() }),
			allowedMentions: { parse: ['users'] },
		})) as Message;
		setTimeout(() => {
			sentMessage?.delete();
		}, 7000);

		var fetchMessage = await textChannel.messages.fetch({ limit: 9, before: message.id });
		var filteredMessage = fetchMessage.filter((msg) => !msg.pinned && msg.author.id === message.author.id);

		await textChannel.bulkDelete(filteredMessage, true);

		const data = new automodModel({
			_id: await generateAutomodId(),
			case: await getModCase(),
			type: PunishmentTypes.Warn,
			userId: message.author.id,
			reason: automodModuleReasons.spam,
			date: new Date(),
			expire: automodPunishmentExpiry,
		});
		await data.save();

		sendModDM(message.member, {
			action: PunishmentTypes.Warn,
			punishment: data,
			expire: automodPunishmentExpiry,
			automod: true,
		});

		await createModLog({
			action: PunishmentTypes.Warn,
			punishmentId: data._id,
			user: message.author,
			moderator: client.user,
			reason: automodModuleReasons.spam,
			expire: automodPunishmentExpiry,
		}).then(() => checkForAutoPunish(data));
	}

	// Functions
	function ignore(type: AutomodModules) {
		if (
			client.config.ignores.automod[type.toString()].channelIds.includes(textChannel.id) ||
			client.config.ignores.automod[type.toString()].roleIds.some((roleId: string) =>
				member.roles.cache.has(roleId)
			)
		)
			return true;
		else return false;
	}

	async function checkForAutoPunish(warnData: any) {
		const punishmentFind = await automodModel.find({
			userId: message.author.id,
			type: PunishmentTypes.Warn,
		});
		const punishmentCount = punishmentFind.length;

		if (punishmentCount % client.config.moderation.counts.automod === 0) {
			await timeoutMember(message.member, {
				reason: t('event.automod.reaching', { count: punishmentCount }),
				duration: client.config.moderation.durations.automod,
			});
			const data = new automodModel({
				_id: await generateAutomodId(),
				case: await getModCase(),
				type: PunishmentTypes.Timeout,
				userId: message.author.id,
				date: new Date(),
				reason: t('event.automod.reaching', { count: punishmentCount }),
				expire: new Date(automodPunishmentExpiry.getTime() + client.config.moderation.durations.automod),
			});
			data.save();

			sendModDM(message.member, {
				action: PunishmentTypes.Timeout,
				punishment: data,
				expire: new Date(Date.now() + client.config.moderation.durations.automod),
				automod: true,
			});

			await createModLog({
				action: PunishmentTypes.Timeout,
				punishmentId: data._id,
				user: message.author,
				moderator: client.user,
				duration: client.config.moderation.durations.automod,
				reason: t('event.automod.reaching', { count: punishmentCount }),
				referencedPunishment: warnData,
				expire: new Date(automodPunishmentExpiry.getTime() + client.config.moderation.durations.automod),
			});
		}
	}
});
