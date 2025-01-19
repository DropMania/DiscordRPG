import { ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildTextBasedChannel, MessageCreateOptions } from 'discord.js'
import { Drops, ItemNames } from '../../enums'
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
	[Drops.BUG]: {
		chance: 20,
		requirements: {
			attack: 1,
			health: 1,
		},
		winMessage: 'Du hast den Käfer besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01FJSMF4X8000FZHS49NWQT3D8/4x.gif'],
			content: 'Ein Käfer erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.BUG).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 5) + 1
			await player?.addStats({ exp: 5, gold }, channel)
		},
	},
	[Drops.RAT]: {
		chance: 30,
		requirements: {
			attack: 10,
			health: 1,
		},
		winMessage: 'Du hast die Ratte besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01GV5KX2MR0004R8PX49VQ15ZP/4x.gif'],
			content: 'Eine wilde Ratte erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.RAT).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 10) + 1
			await player?.addStats({ exp: 10, gold }, channel)
		},
	},
	[Drops.SHEEP]: {
		chance: 10,
		requirements: {
			attack: 12,
			health: 1,
		},
		winMessage: 'Du hast das Schaf besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01G53HY3ZR0008YP4SK58DWX3B/4x.gif'],
			content: 'Ein Schaf erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.SHEEP).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 14) + 1
			await player?.addStats({ exp: 15, gold }, channel)
		},
	},
	[Drops.DOG]: {
		chance: 20,
		requirements: {
			attack: 15,
			health: 1,
		},
		winMessage: 'Du hast den Hund besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01FPX44YXR0007YCJT9TVEGS7G/4x.png'],
			content: 'Ein wilder Hund erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.DOG).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 20) + 1
			await player?.addStats({ exp: 30, gold }, channel)
		},
	},
	[Drops.CAT]: {
		chance: 20,
		requirements: {
			attack: 18,
			health: 1,
		},
		winMessage: 'Du hast die Katze besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01GR5X7SPG00059JN12W34XF6K/4x.gif'],
			content: 'Eine wilde Katze erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.CAT).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 25) + 1
			await player?.addStats({ exp: 50, gold }, channel)
		},
	},
	[Drops.WOLF]: {
		chance: 20,
		requirements: {
			attack: 20,
			health: 1,
		},
		winMessage: 'Du hast den Wolf besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01G98RJBH8000EGZGTDWPG13DX/4x.gif'],
			content: 'Ein wilder Wolf erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.WOLF).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 30) + 1
			await player?.addStats({ exp: 100, gold }, channel)
		},
	},
	[Drops.BEAR]: {
		chance: 10,
		requirements: {
			attack: 25,
			health: 1,
		},
		winMessage: 'Du hast den Bären besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01G3VZPB5R000C2T35N8NWC31N/4x.gif'],
			content: 'Ein wilder Bär erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.BEAR).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 35) + 1
			await player?.addStats({ exp: 150, gold }, channel)
		},
	},
	[Drops.LIZARD]: {
		chance: 10,
		requirements: {
			attack: 30,
			health: 1,
		},
		winMessage: 'Du hast die Echse besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01FG9ERKN800064MEQW00DMHX4/4x.gif'],
			content: 'Eine wilde Echse erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.LIZARD).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 40) + 1
			await player?.addStats({ exp: 200, gold }, channel)
		},
	},
	[Drops.APE]: {
		chance: 10,
		requirements: {
			attack: 40,
			health: 1,
		},
		winMessage: 'Du hast den Affen besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01H1AJF3V00006K2DSP3A6S1SM/4x.png'],
			content: 'Ein wilder Affe erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.APE).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 45) + 1
			await player?.addStats({ exp: 300, gold }, channel)
		},
	},
	[Drops.ORC]: {
		chance: 5,
		requirements: {
			attack: 50,
			health: 1,
		},
		winMessage: 'Du hast den Ork besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01FGW6D3WG00047CPSV86K67HB/4x.png'],
			content: 'Ein wilder Ork erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.ORC).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 50) + 1
			await player?.addStats({ exp: 500, gold }, channel)
		},
	},
	[Drops.DRAGON]: {
		chance: 5,
		requirements: {
			attack: 80,
			health: 1,
		},
		winMessage: 'Du hast den Drachen besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01G1M1ZYR00000Q39XATK1PBFT/4x.gif'],
			content: 'Ein wilder Drache erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.DRAGON).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 100) + 1
			await player?.addStats({ exp: 1000, gold }, channel)
		},
	},
	[Drops.GODZILLA]: {
		chance: 3,
		requirements: {
			attack: 100,
			health: 1,
		},
		winMessage: 'Du hast Godzilla besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01HJ9454080004CQ4RYKKQQXZJ/4x.gif'],
			content: 'Godzilla erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.GODZILLA).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 200) + 1
			await player?.addStats({ exp: 2000, gold }, channel)
		},
	},
	[Drops.GHIDORAH]: {
		chance: 2,
		requirements: {
			attack: 150,
			health: 1,
		},
		winMessage: 'Du hast Ghidorah besiegt!',
		response: {
			files: ['https://i.pinimg.com/originals/34/8e/94/348e947cc10f4169ebe45abdeb7eaba1.gif'],
			content: 'Ghidorah erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.GHIDORAH).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 300) + 1
			await player?.addStats({ exp: 3000, gold }, channel)
		},
	},
	[Drops.SAITAMA]: {
		chance: 1,
		requirements: {
			attack: 200,
			health: 1,
		},
		winMessage: 'Du hast Saitama besiegt!',
		response: {
			files: ['https://cdn.7tv.app/emote/01H5MGBRY80000G7YCGMVHYZ1Q/4x.png'],
			content: 'Saitama erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.SAITAMA).setEmoji('⚔️').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 500) + 1
			await player?.addStats({ exp: 5000, gold }, channel)
		},
	},

	[Drops.COIN]: {
		chance: 30,
		requirements: {},
		winMessage: 'Du hast ein haufen Münzen gefunden!',
		response: {
			files: ['https://cdn.7tv.app/emote/01GS6E1C0R00086WJ6ZZH15Z62/4x.gif'],
			content: 'Ein haufen mit Münzen erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.COIN).setEmoji('💰').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player, channel) => {
			let gold = Math.floor(Math.random() * 10) + 1
			await player.addStats({ gold }, channel)
		},
	},

	[Drops.HEAL_POTION]: {
		chance: 10,
		requirements: {},
		winMessage: 'Du hast den Heiltrank gefunden!',
		response: {
			files: ['https://cdn.7tv.app/emote/01H0N82N7R000BMZMCBYQC2HQD/4x.png'],
			content: 'Ein Heiltrank erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.HEAL_POTION).setEmoji('🩹').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player) => {
			let item = Items[ItemNames.HEAL_POTION]
			await player.addItem(item)
		},
	},
	[Drops.STRENGTH_POTION]: {
		chance: 3,
		requirements: {},
		winMessage: 'Du hast den Stärketrank gefunden!',
		response: {
			files: ['https://cdn.7tv.app/emote/01GR0KZ2QR0006WG4R254NH08A/4x.gif'],
			content: 'Ein Stärketrank erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.STRENGTH_POTION).setEmoji('💪').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player) => {
			let item = Items[ItemNames.STRENGTH_POTION]
			await player.addItem(item)
		},
	},
	[Drops.EXP_POTION]: {
		chance: 10,
		requirements: {},
		winMessage: 'Du hast den Erfahrungstrank gefunden!',
		response: {
			files: ['https://cdn.7tv.app/emote/01H3EHS69R0001B6FJW17RYEST/4x.gif'],
			content: 'Ein Erfahrungstrank erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.EXP_POTION).setEmoji('📚').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player) => {
			let item = Items[ItemNames.EXP_POTION]
			await player.addItem(item)
		},
	},

	[Drops.POISON_SHROOM]: {
		chance: 5,
		requirements: {},
		winMessage: 'Du hast den Giftigen Pilz gefunden!',
		response: {
			files: [
				'https://mario.wiki.gallery/images/thumb/d/d4/SMP_Poison_Mushroom.png/200px-SMP_Poison_Mushroom.png',
			],
			content: 'Ein giftiger Pilz erscheint!',
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder().setCustomId(Drops.POISON_SHROOM).setEmoji('🍄').setStyle(ButtonStyle.Primary)
				),
			],
		},
		handler: async (player) => {
			let item = Items[ItemNames.POISON_SHROOM]
			await player.addItem(item)
		},
	},
}
export default dropTypes
