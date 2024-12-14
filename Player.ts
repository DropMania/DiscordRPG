import type { GuildTextBasedChannel, User } from 'discord.js'
import redisClient from './redis'

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
		})
	}
	async giveExperience(amount: number, channel?: GuildTextBasedChannel) {
		this.experience += amount
		if (this.experience >= 1000) {
			return this.levelUp(channel)
		}
		await channel?.send({
			content: `Gratulation ${this.user}! 
Du hast **${amount} EXP** erhalten!
Du hast jetzt **${this.experience} EXP** und bist Level **${this.level}**!
Noch **${1000 - this.experience} EXP** bis zum nächsten Level!`,
		})
		await this.save()
	}
	async levelUp(channel?: GuildTextBasedChannel) {
		this.experience = 0
		this.level++
		this.attack += 5
		this.defense += 2
		this.health += 10
		await channel?.send({
			content: `Gratulation ${this.user}!
Du bist jetzt Level **${this.level}**!
Deine Stats wurden erhöht:
**+5 Attack** (jetzt **${this.attack}**)
**+2 Defense** (jetzt **${this.defense}**)
**+10 Health** (jetzt **${this.health}**)`,
		})
		await this.save()
	}

	async addGold(amount: number, channel?: GuildTextBasedChannel) {
		this.gold += amount
		await channel?.send({
			content: `Gratulation ${this.user}!
Du hast **${amount} Gold** erhalten!
Du hast jetzt **${this.gold} Gold**!`,
		})
		await this.save()
	}
}
