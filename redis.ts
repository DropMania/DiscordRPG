import { createClient } from 'redis'

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
	async set(key: string, value: any) {
		await this.client.set(key, JSON.stringify(value))
	}
	async get<T>(key: string): Promise<T | null> {
		let data = await this.client.get(key)
		if (!data) return null
		return JSON.parse(data) as T
	}
	async getAllKeys(pattern: string): Promise<string[]> {
		return await this.client.keys(pattern)
	}
	async del(key: string) {
		await this.client.del(key)
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
