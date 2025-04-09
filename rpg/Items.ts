import { GuildTextBasedChannel } from 'discord.js'
import { ItemNames } from '../enums'
import Player from './Player'
import { Item } from '../types/varTypes'

const Items: Record<ItemNames, Item> = {
	[ItemNames.HEAL_POTION]: {
		name: ItemNames.HEAL_POTION,
		description: 'Heilt 50 HP',
		async effect(player: Player, channel?: GuildTextBasedChannel) {
			await player.addStats({ health: 50 }, channel)
		},
	},
	[ItemNames.STRENGTH_POTION]: {
		name: ItemNames.STRENGTH_POTION,
		description: 'Erhöht den Angriff um 10',
		async effect(player: Player, channel?: GuildTextBasedChannel) {
			await player.addStats({ attack: 10 }, channel)
		},
	},
	[ItemNames.EXP_POTION]: {
		name: ItemNames.EXP_POTION,
		description: 'Erhöht die Erfahrung um 100',
		async effect(player: Player, channel?: GuildTextBasedChannel) {
			await player.addStats({ exp: 100 }, channel)
		},
	},
	[ItemNames.POISON_SHROOM]: {
		name: ItemNames.POISON_SHROOM,
		description: 'Reduziert die Gesundheit um 25 und erhöht die Erfahrung um 300',
		async effect(player: Player, channel?: GuildTextBasedChannel) {
			await player.addStats({ health: -25, exp: 300 }, channel)
		},
	},
	[ItemNames.SUPER_EXP_POTION]: {
		name: ItemNames.SUPER_EXP_POTION,
		description: 'Erhöht die Erfahrung um 1000',
		async effect(player: Player, channel?: GuildTextBasedChannel) {
			await player.addStats({ exp: 1000 }, channel)
		},
	},
}

export default Items
