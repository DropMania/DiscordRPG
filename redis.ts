import { createClient } from 'redis'
import Player from './rpg/Player'

const client = await createClient({
	url: process.env.REDIS_URL,
})
	.on('error', (err) => console.log('Redis Client Error', err))
	.connect()

class RedisClient {
	client: typeof client
	isReady: boolean = false
	constructor() {
		this.client = client
	}

	async setPlayer(userId: string, player: Player) {
		return await this.client.set(`rpg:${userId}`, player.toString())
	}
	async getPlayers() {
		return await this.client.keys(`rpg:*`)
	}

	async setCache<T>(key: string, value: T) {
		return await this.client.set(`cache:${key}`, JSON.stringify(value))
	}
	async getCache<T>(key: string) {
		let value = await this.client.get(`cache:${key}`)
		return JSON.parse(value) as T
	}
	async deleteCache(key: string) {
		return await this.client.del(`cache:${key}`)
	}
}

const redisClient = new RedisClient()
export default redisClient
