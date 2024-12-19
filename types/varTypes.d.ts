import { GuildTextBasedChannel } from 'discord.js'
import Player from '../rpg/Player'

export type GuessrGameItem = {
	names: string[]
	images: string[]
	hints: string[]
	cover: string
}

export type Item = {
	name: string
	description: string
	effect: (player: Player, channel?: GuildTextBasedChannel) => Promise<void>
}
