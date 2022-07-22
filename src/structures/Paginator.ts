import {
	type ButtonInteraction,
	type CacheType,
	ComponentType,
	InteractionCollector,
	Message,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonStyle,
} from 'discord.js';
import { t } from 'i18next';
import type { PaginatorInteractionTypes, paginatorOptions, paginatorStatusOptions } from '../typings';

export class Paginator {
	private options: {
		interaction: PaginatorInteractionTypes;
		target?: Message;
	} & paginatorOptions;
	private status: paginatorStatusOptions;

	constructor() {}

	public async start(interaction: PaginatorInteractionTypes, options: paginatorOptions) {
		this.options = {
			interaction,
			array: options.array,
			itemPerPage: options.itemPerPage,
			joinWith: options.joinWith,
			time: options.time,
			embed: options.embed,
			ephemeral: options.ephemeral ?? false,
			// searchButton: options.searchButton,
		};
		this.updateStatus(1);
		await this.sendEmbed();

		const collector = this.buildCollector();
		this.collect(collector);
	}

	private updateStatus(currentPage: number) {
		this.status = {
			totalPages: Math.ceil(this.options.array.length / this.options.itemPerPage),
			currentPage,
			slice1: currentPage * this.options.itemPerPage - this.options.itemPerPage,
			slice2: currentPage * this.options.itemPerPage,
		};
	}

	private updateEmbed() {
		const embedjson = this.options.embed.toJSON();
		const sliced = this.options.array.slice(this.status.slice1, this.status.slice2);

		const newEmbed = EmbedBuilder.from(embedjson)
			.setDescription(embedjson.description.replaceAll('${{array}}', sliced.join(this.options.joinWith)))
			.setFooter({
				text: embedjson.footer.text
					.replaceAll('${{currentPage}}', this.status.currentPage.toString())
					.replaceAll('${{totalPages}}', this.status.totalPages.toString()),
			});

		this.options.interaction.editReply({
			embeds: [newEmbed],
		});
	}

	private buildCollector(): typeof collector {
		const collector = this.options.target.createMessageComponentCollector({
			time: this.options.time,
			componentType: ComponentType.Button,
		});

		return collector;
	}

	private collect(collector: InteractionCollector<ButtonInteraction<CacheType>>) {
		collector.on('collect', async (c): Promise<any> => {
			if (c.user.id !== this.options.interaction.user.id)
				return c.reply({ content: t('common.errors.cannotInteract'), ephemeral: true });

			await this.nextPage(c);
			await this.previousPage(c);
		});

		collector.on('end', () => {
			this.options.interaction.editReply({ components: [] });
		});
	}

	private async nextPage(c: ButtonInteraction<CacheType>) {
		if (c.customId === 'next') {
			if (this.status.currentPage === this.status.totalPages) return c.deferUpdate();

			this.updateStatus(this.status.currentPage + 1);
			this.updateEmbed();
			c.deferUpdate();
		}
	}

	private async previousPage(c: ButtonInteraction<CacheType>) {
		if (c.customId === 'previous') {
			if (this.status.currentPage === 1) return c.deferUpdate();

			this.updateStatus(this.status.currentPage - 1);
			this.updateEmbed();
			c.deferUpdate();
		}
	}

	private async sendEmbed(): Promise<void> {
		const embedjson = this.options.embed.toJSON();
		const sliced = this.options.array.slice(this.status.slice1, this.status.slice2);
		const newEmbed = EmbedBuilder.from(embedjson)
			.setDescription(embedjson.description.replaceAll('${{array}}', sliced.join(this.options.joinWith)))
			.setFooter({
				text: embedjson.footer.text
					.replaceAll('${{currentPage}}', this.status.currentPage.toString())
					.replaceAll('${{totalPages}}', this.status.totalPages.toString()),
			});

		if (this.options.interaction.deferred) {
			const msg = (await this.options.interaction
				.followUp({
					embeds: [newEmbed],
					components: [this.buildButtons()],
					ephemeral: this.options.ephemeral,
				})
				.catch(() => {})) as Message;

			this.options = {
				...this.options,
				target: msg,
			};
		} else {
			const msg = (await this.options.interaction
				.reply({
					embeds: [newEmbed],
					components: [this.buildButtons()],
					ephemeral: this.options.ephemeral,
					fetchReply: true,
				})
				.catch(() => {})) as Message;

			this.options = {
				...this.options,
				target: msg,
			};
		}
	}

	public buildButtons(): typeof buttons {
		const buttons = new ActionRowBuilder<ButtonBuilder>().setComponents([
			new ButtonBuilder().setCustomId('previous').setEmoji({ name: '◀️' }).setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId('next').setEmoji({ name: '▶️' }).setStyle(ButtonStyle.Primary),
		]);

		return buttons;
	}
}
