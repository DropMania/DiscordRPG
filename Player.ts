import type { GuildTextBasedChannel, User } from 'discord.js'
import redisClient from './redis'
import messageDeleter from './messageDeleter'

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
	async addStats(stats: { exp?: number; gold?: number }, channel?: GuildTextBasedChannel) {
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
		this.health += 10
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
