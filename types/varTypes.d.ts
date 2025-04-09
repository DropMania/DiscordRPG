import { GuildTextBasedChannel } from 'discord.js'
import Player from '../rpg/Player'
import { ItemNames } from '../enums'

export type GuessrGameItem = {
	names: string[]
	images: string[]
	hints: string[]
	cover: string
}

export type Item = {
	name: ItemNames
	description: string
	effect: (player: Player, channel?: GuildTextBasedChannel) => Promise<void>
}
