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
		let data = JSON.stringify(value)
		let chunkSize = 1024 * 1024 // 1MB
		let chunks = Math.ceil(data.length / chunkSize)
		let chunkedData = []
		for (let i = 0; i < chunks; i++) {
			let start = i * chunkSize
			let end = start + chunkSize
			chunkedData.push(data.slice(start, end))
		}
		for (let i = 0; i < chunks; i++) {
			await this.client.set(`cache:${key}:${i}`, chunkedData[i])
		}
	}
	async getCache<T>(key: string) {
		let chunkedData = []
		let keys = await this.client.keys(`cache:${key}:*`)
		for (let i = 0; i < keys.length; i++) {
			let chunk = await this.client.get(keys[i])
			if (chunk) {
				chunkedData.push(chunk)
			}
		}
		let data = chunkedData.join('')
		if (data.length === 0) return null
		return JSON.parse(data) as T
	}
	async deleteCache(key: string) {
		let keys = await this.client.keys(`cache:${key}:*`)
		for (let i = 0; i < keys.length; i++) {
			await this.client.del(keys[i])
		}
	}
}

const redisClient = new RedisClient()
export default redisClient
