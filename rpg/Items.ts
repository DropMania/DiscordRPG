import { GuildTextBasedChannel } from 'discord.js'
import { ItemNames } from '../enums'
import Player from './Player'
import messageDeleter from '../messageDeleter'

export class Item {
	name: string
	description: string
	async effect(player: Player, channel?: GuildTextBasedChannel) {}
}

export default {
	[ItemNames.HEAL_POTION]: class extends Item {
		constructor() {
			super()
			this.name = ItemNames.HEAL_POTION
			this.description = 'Heilt 50 HP'
		}
		async effect(player: Player, channel?: GuildTextBasedChannel) {
			player.health += 50
			if (player.health > player.maxHealth) player.health = player.maxHealth
			let m = await channel?.send(
				`${player.user} hat sich um **50 HP** geheilt! (HP: ${player.health}/${player.maxHealth})`
			)
			await messageDeleter.addMessage(m, 1000 * 60 * 60)
		}
	},
	[ItemNames.STRENGTH_POTION]: class extends Item {
		constructor() {
			super()
			this.name = ItemNames.STRENGTH_POTION
			this.description = 'Erhöht den Angriff um 10'
		}
		async effect(player: Player, channel?: GuildTextBasedChannel) {
			player.attack += 10
			let m = await channel?.send(`${player.user} hat **10 Attack** erhalten! (Angriff: ${player.attack})`)
			await messageDeleter.addMessage(m, 1000 * 60 * 60)
		}
	},
	[ItemNames.EXP_POTION]: class extends Item {
		constructor() {
			super()
			this.name = ItemNames.EXP_POTION
			this.description = 'Erhöht die Erfahrung um 100'
		}
		async effect(player: Player, channel?: GuildTextBasedChannel) {
			player.experience += 100
			let m = await channel?.send(`${player.user} hat **100 EXP** erhalten! (EXP: ${player.experience})`)
			await messageDeleter.addMessage(m, 1000 * 60 * 60)
		}
	},
}
