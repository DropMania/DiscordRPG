import Module from './_Module.js'
import redisClient from '../redis.js'
import { User } from 'discord.js'
type MovieNightListItem = {
	title: string
	userId: string
}
export default class MovieNight extends Module {
	list: MovieNightListItem[] = []
	constructor(guildId: string) {
		super(guildId)
	}
	async init() {
		let list = await redisClient.getCache<MovieNightListItem[]>(`${this.guildId}:movieNightList`)
		if (list) {
			this.list = list
		} else {
			this.list = []
		}
	}
	async syncList() {
		await redisClient.setCache(`${this.guildId}:movieNightList`, this.list)
	}
	async addMovie(title: string, user: User) {
		if (this.list.findIndex((item) => item.userId === user.id) !== -1) {
			let index = this.list.findIndex((item) => item.userId === user.id)
			this.list[index].title = title
			await this.syncList()
			return { success: true, text: `Film von <@${user.id}> wurde auf **${title}** aktualisiert` }
		}
		this.list.push({ title, userId: user.id })
		await this.syncList()
		return { success: true, text: `<@${user.id}> hat den Film **${title}** zur Liste hinzugefügt!` }
	}
	listMovies() {
		return this.list
	}
	pickRandomMovie() {
		if (this.list.length === 0) return null
		let randomIndex = Math.floor(Math.random() * this.list.length)
		return this.list[randomIndex]
	}
	async clearList() {
		this.list = []
		await this.syncList()
	}
}
