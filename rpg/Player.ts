import type { GuildTextBasedChannel, User } from 'discord.js'
import redisClient from '../redis'
import messageDeleter from '../messageDeleter'
import Items from './Items'
import { Item } from '../types/varTypes'
import achievements from './Achievements'
import { ItemNames } from '../enums'

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
	achievements: AchievementProgress[]
	constructor(playerConfig: PlayerConfig) {
		this.user = `<@${playerConfig.userId}>`
		this.userId = playerConfig.userId
		this.health = playerConfig.health
		this.attack = playerConfig.attack
		this.maxHealth = playerConfig.maxHealth
		this.defense = playerConfig.defense
		this.level = playerConfig.level
		this.experience = playerConfig.experience
		this.gold = playerConfig.gold
		this.items = []
		this.achievements = playerConfig.achievements || []
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
			user: this.user,
			userId: this.userId,
			health: this.health,
			maxHealth: this.maxHealth,
			attack: this.attack,
			defense: this.defense,
			level: this.level,
			experience: this.experience,
			gold: this.gold,
			items: this.items.map((item) => item.name),
			achievements: this.achievements,
		})
	}
	async addItem(item: Item) {
		this.items.push(item)
		await this.save()
	}
	async useItem(itemIdx: number, channel?: GuildTextBasedChannel) {
		let item = this.items[itemIdx]
		if (!item) return
		await item.effect(this, channel)
		this.items.splice(itemIdx, 1)
		await this.save()
	}
	async removeItem(itemName: ItemNames, count: number) {
		this.items = this.items.reduce((acc, item) => {
			if (item.name === itemName && count > 0) {
				count--
				return acc
			}
			acc.push(item)
			return acc
		}, [] as Item[])
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
					if (this.gold >= 10000) this.unlockAchievement('10000_gold', channel)
					if (this.gold >= 100000) this.unlockAchievement('100000_gold', channel)
					if (this.gold >= 1000000) this.unlockAchievement('1000000_gold', channel)
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
		if (!m) return
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
		if (this.level >= 50) this.unlockAchievement('level_50', channel)
		if (this.level >= 100) this.unlockAchievement('level_100', channel)

		await messageDeleter.addMessage(m, 1000 * 60 * 60)
		await this.save()
	}
	async unlockAchievement(achievementId: string, channel?: GuildTextBasedChannel) {
		let achievement = achievements.find((a) => a.id === achievementId)
		if (!achievement) return
		let myAchievement = this.achievements.find((a) => a.id === achievementId)
		if (myAchievement && myAchievement.unlocked) return
		if (myAchievement) {
			myAchievement.progress++
			if (myAchievement.progress >= achievement.maxProgress) {
				myAchievement.unlocked = true
				myAchievement.unlockDate = Date.now()
				let m = await channel?.send({
					content: `Gratulation ${this.user}!\nDu hast das Achievement **${achievement.name}** freigeschaltet!`,
				})
			}
		} else {
			if (achievement.maxProgress > 1) {
				this.achievements.push({
					id: achievementId,
					progress: 1,
					unlocked: false,
					unlockDate: 0,
				})
			} else {
				this.achievements.push({
					id: achievementId,
					progress: 1,
					unlocked: true,
					unlockDate: Date.now(),
				})
				let m = await channel?.send({
					content: `Gratulation ${this.user}!\nDu hast das Achievement **${achievement.name}** freigeschaltet!`,
				})
			}
		}
		await this.save()
	}
}
