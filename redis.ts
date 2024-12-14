import { createClient } from 'redis'
import Player from './Player'

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
}

const redisClient = new RedisClient()
export default redisClient
