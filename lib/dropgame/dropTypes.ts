import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildTextBasedChannel, MessageCreateOptions } from 'discord.js'
import { DropNames, ItemNames } from '../../enums'
import Player from '../../rpg/Player'
import Items from '../../rpg/Items'

type DropType = {
	chance: number
	response: MessageCreateOptions
	winMessage: string
	requirements: Record<string, number>
	handler: (player: Player, channel: GuildTextBasedChannel) => Promise<void>
}

const dropTypes: Record<string, DropType> = {
	[DropNames.BUG]: {
		chance: 20,
		requirements: {
			attack: 1,
		},
		winMessage: 'Du hast den Käfer besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01FJSMF4X8000FZHS49NWQT3D8/4x.gif'],
			content: 'Ein Käfer erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.BUG).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 5) + 1
			await player?.addStats({ exp: 5, gold }, channel)
		},
	},
	[DropNames.RAT]: {
		chance: 30,
		requirements: {
			attack: 10,
		},
		winMessage: 'Du hast die Ratte besiegt!',
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
		winMessage: 'Du hast das Schaf besiegt!',
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
		winMessage: 'Du hast den Hund besiegt!',
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
	[DropNames.CAT]: {
		chance: 20,
		requirements: {
			attack: 18,
		},
		winMessage: 'Du hast die Katze besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01GR5X7SPG00059JN12W34XF6K/4x.gif'],
			content: 'Eine wilde Katze erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.CAT).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 25) + 1
			await player?.addStats({ exp: 50, gold }, channel)
		},
	},
	[DropNames.WOLF]: {
		chance: 20,
		requirements: {
			attack: 20,
		},
		winMessage: 'Du hast den Wolf besiegt!',
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
	[DropNames.BEAR]: {
		chance: 10,
		requirements: {
			attack: 25,
		},
		winMessage: 'Du hast den Bären besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01G3VZPB5R000C2T35N8NWC31N/4x.gif'],
			content: 'Ein wilder Bär erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.BEAR).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 35) + 1
			await player?.addStats({ exp: 150, gold }, channel)
		},
	},
	[DropNames.LIZARD]: {
		chance: 10,
		requirements: {
			attack: 30,
		},
		winMessage: 'Du hast die Echse besiegt!',
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
	[DropNames.APE]: {
		chance: 10,
		requirements: {
			attack: 40,
		},
		winMessage: 'Du hast den Affen besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01H1AJF3V00006K2DSP3A6S1SM/4x.png'],
			content: 'Ein wilder Affe erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.APE).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 45) + 1
			await player?.addStats({ exp: 300, gold }, channel)
		},
	},
	[DropNames.ORC]: {
		chance: 5,
		requirements: {
			attack: 50,
		},
		winMessage: 'Du hast den Ork besiegt!',
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
			attack: 80,
		},
		winMessage: 'Du hast den Drachen besiegt!',
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
	[DropNames.GODZILLA]: {
		chance: 3,
		requirements: {
			attack: 100,
		},
		winMessage: 'Du hast Godzilla besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01HJ9454080004CQ4RYKKQQXZJ/4x.gif'],
			content: 'Godzilla erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.GODZILLA).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 200) + 1
			await player?.addStats({ exp: 2000, gold }, channel)
		},
	},

	[DropNames.COIN]: {
		chance: 30,
		requirements: {},
		winMessage: 'Du hast ein haufen Münzen gefunden!',
		response: {
			files: ['https://cdn.7tv.app/emote/01GS6E1C0R00086WJ6ZZH15Z62/4x.gif'],
			content: 'Ein haufen mit Münzen erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.COIN).setEmoji('💰').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 10) + 1
			await player.addStats({ gold }, channel)
		},
	},
	[DropNames.HEAL_POTION]: {
		chance: 10,
		requirements: {},
		winMessage: 'Du hast den Heiltrank gefunden!',
		response: {
			files: ['https://cdn.7tv.app/emote/01H0N82N7R000BMZMCBYQC2HQD/4x.png'],
			content: 'Ein Heiltrank erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.HEAL_POTION).setEmoji('🩹').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player) => {
			let item = Items[ItemNames.HEAL_POTION]
			await player.addItem(item)
		},
	},
	[DropNames.STRENGTH_POTION]: {
		chance: 3,
		requirements: {},
		winMessage: 'Du hast den Stärketrank gefunden!',
		response: {
			files: ['https://cdn.7tv.app/emote/01GR0KZ2QR0006WG4R254NH08A/4x.gif'],
			content: 'Ein Stärketrank erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId(DropNames.STRENGTH_POTION)
						.setEmoji('💪')
						.setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player) => {
			let item = Items[ItemNames.STRENGTH_POTION]
			await player.addItem(item)
		},
	},
	[DropNames.EXP_POTION]: {
		chance: 10,
		requirements: {},
		winMessage: 'Du hast den Erfahrungstrank gefunden!',
		response: {
			files: ['https://cdn.7tv.app/emote/01H3EHS69R0001B6FJW17RYEST/4x.gif'],
			content: 'Ein Erfahrungstrank erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(DropNames.EXP_POTION).setEmoji('📚').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player) => {
			let item = Items[ItemNames.EXP_POTION]
			await player.addItem(item)
		},
	},
}
export default dropTypes
