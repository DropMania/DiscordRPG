import type { GuildTextBasedChannel, User } from 'discord.js'
import redisClient from '../redis'
import messageDeleter from '../messageDeleter'
import Items from './Items'
import { Item } from '../types/varTypes'

export default class Player {
	user: string
	userId: string
	health: number
	maxHealth: number
	attack: number
	defense: number
	level: number
	experience: number
	gold: number
	items: Item[]
	constructor(playerConfig: PlayerConfig) {
		this.user = `<@${playerConfig.userId}>`
		this.userId = playerConfig.userId
		this.health = playerConfig.health
		this.attack = playerConfig.attack
		this.maxHealth = playerConfig.health
		this.defense = playerConfig.defense
		this.level = playerConfig.level
		this.experience = playerConfig.experience
		this.gold = playerConfig.gold
		this.items = []
		if (!playerConfig.items) playerConfig.items = []
		playerConfig.items.forEach((item) => {
			this.items.push(Items[item])
		})
	}
	async save() {
		return await redisClient.setPlayer(this.userId, this)
	}
	toString() {
		return JSON.stringify({
			userId: this.userId,
			health: this.health,
			maxHealth: this.maxHealth,
			attack: this.attack,
			defense: this.defense,
			level: this.level,
			experience: this.experience,
			gold: this.gold,
			items: this.items.map((item) => item.name),
		})
	}
	async addItem(item: Item) {
		this.items.push(item)
		await this.save()
	}
	async useItem(item: Item, channel?: GuildTextBasedChannel) {
		await item.effect(this, channel)
		this.items = this.items.filter((i) => i !== item)
		await this.save()
	}
	async addStats(
		stats: { exp?: number; gold?: number; attack?: number; health?: number },
		channel?: GuildTextBasedChannel
	) {
		let message = ''
		const requiredExperience = Math.floor(1000 * Math.pow(1.1, this.level - 1))
		Object.keys(stats).forEach((key) => {
			switch (key) {
				case 'exp':
					this.experience += stats.exp
					message += `+**${stats.exp} EXP** (jetzt ${this.experience}/${requiredExperience} EXP)\n`
					break
				case 'gold':
					this.gold += stats.gold
					message += `+**${stats.gold} Gold** (jetzt ${this.gold} Gold)\n`
					break
				case 'attack':
					this.attack += stats.attack
					message += `+**${stats.attack} Attack** (jetzt ${this.attack} Attack)\n`
					break
				case 'health':
					this.health += stats.health
					if (this.health > this.maxHealth) this.health = this.maxHealth
					message += `+**${stats.health} Health** (jetzt ${this.health}/${this.maxHealth} Health)\n`
					break
			}
		})
		if (this.experience >= requiredExperience) {
			return this.levelUp(channel)
		}

		let m = await channel?.send({
			content: `Gratulation ${this.user}!\n${message}`,
		})
		await this.save()
		await messageDeleter.addMessage(m, 1000 * 60 * 60)
		return message
	}

	async levelUp(channel?: GuildTextBasedChannel) {
		this.experience = 0
		this.level++
		this.attack += 5
		this.defense += 2
		this.maxHealth += 10
		this.health = this.maxHealth
		let m = await channel?.send({
			content: `LEVEL UP ${this.user}!
Du bist jetzt Level **${this.level}**!
Deine Stats wurden erhöht:
**+5 Attack** (jetzt **${this.attack}**)
**+2 Defense** (jetzt **${this.defense}**)
**+10 Health** (jetzt **${this.health}**)`,
		})

		await messageDeleter.addMessage(m, 1000 * 60 * 60)
		await this.save()
	}
}
