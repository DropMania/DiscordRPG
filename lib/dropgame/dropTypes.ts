import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildTextBasedChannel, MessageCreateOptions } from 'discord.js'
import { DropNames } from '../../enums'
import Player from '../../Player'

type DropType = {
	chance: number
	response: MessageCreateOptions
	requirements: Record<string, number>
	handler: (player: Player, channel: GuildTextBasedChannel) => Promise<void>
}

const dropTypes: Record<string, DropType> = {
	[DropNames.RAT]: {
		chance: 30,
		requirements: {
			attack: 10,
		},
		response: {
			files: ['https://cdn.7tv.app/emote/01GV5KX2MR0004R8PX49VQ15ZP/4x.gif'],
			content: 'Eine wilde Ratte erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.RAT).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 10) + 1
			await player?.addStats({ exp: 10, gold }, channel)
		},
	},
	[DropNames.SHEEP]: {
		chance: 10,
		requirements: {
			attack: 12,
		},
		response: {
			files: ['https://cdn.7tv.app/emote/01G53HY3ZR0008YP4SK58DWX3B/4x.gif'],
			content: 'Ein Schaf erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.SHEEP).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 14) + 1
			await player?.addStats({ exp: 15, gold }, channel)
		},
	},
	[DropNames.DOG]: {
		chance: 20,
		requirements: {
			attack: 15,
		},
		response: {
			files: ['https://cdn.7tv.app/emote/01FPX44YXR0007YCJT9TVEGS7G/4x.png'],
			content: 'Ein wilder Hund erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.DOG).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 20) + 1
			await player?.addStats({ exp: 30, gold }, channel)
		},
	},
	[DropNames.WOLF]: {
		chance: 20,
		requirements: {
			attack: 20,
		},
		response: {
			files: ['https://cdn.7tv.app/emote/01G98RJBH8000EGZGTDWPG13DX/4x.gif'],
			content: 'Ein wilder Wolf erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.WOLF).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 30) + 1
			await player?.addStats({ exp: 100, gold }, channel)
		},
	},
	[DropNames.LIZARD]: {
		chance: 10,
		requirements: {
			attack: 25,
		},
		response: {
			files: ['https://cdn.7tv.app/emote/01FG9ERKN800064MEQW00DMHX4/4x.gif'],
			content: 'Eine wilde Echse erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.LIZARD).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 40) + 1
			await player?.addStats({ exp: 200, gold }, channel)
		},
	},
	[DropNames.ORC]: {
		chance: 5,
		requirements: {
			attack: 30,
		},
		response: {
			files: ['https://cdn.7tv.app/emote/01FGW6D3WG00047CPSV86K67HB/4x.png'],
			content: 'Ein wilder Ork erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.ORC).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 50) + 1
			await player?.addStats({ exp: 500, gold }, channel)
		},
	},
	[DropNames.DRAGON]: {
		chance: 5,
		requirements: {
			attack: 40,
		},
		response: {
			files: ['https://cdn.7tv.app/emote/01G1M1ZYR00000Q39XATK1PBFT/4x.gif'],
			content: 'Ein wilder Drache erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.DRAGON).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 100) + 1
			await player?.addStats({ exp: 1000, gold }, channel)
		},
	},
}
export default dropTypes