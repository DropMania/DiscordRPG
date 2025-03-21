import { ChannelType, GuildTextBasedChannel, Message } from 'discord.js'
import redisClient from './redis'
import dcClient from './discord'
import Log from './util/log'
type MessageToDelete = {
	cId: string
	mId: string
	deleteIn: number
}
class MessageDeleter {
	messages: MessageToDelete[]
	constructor() {
		this.messages = []

		this.init()
		this.createInterval()
	}
	async init() {
		let messages = await redisClient.client.get('messageDeleter')
		if (messages) {
			this.messages = JSON.parse(messages)
			Log.info('MessageDeleter', `Loaded ${this.messages.length} messages from redis`)
		}
	}
	createInterval() {
		setInterval(async () => {
			for (let i = 0; i < this.messages.length; i++) {
				let message = this.messages[i]
				let channel = (await dcClient.channels.fetch(message.cId)) as GuildTextBasedChannel
				let m = await channel.messages.fetch(message.mId)
				let timestamp = m.createdTimestamp
				let now = new Date().getTime()
				if (now - timestamp >= message.deleteIn) {
					Log.info(`Deleting message ${m.id} in ${channel.name}`)
					await m.delete()
					this.messages.splice(i, 1)
					await this.sync()
				}
			}
		}, 1000 * 60)
	}
	async addMessage(message: Message, deleteIn: number) {
		if (!message) return
		this.messages.push({
			cId: message.channel.id,
			mId: message.id,
			deleteIn,
		})
		await this.sync()
	}
	async sync() {
		redisClient.client.set('messageDeleter', JSON.stringify(this.messages))
	}
	async cleanUp(guildId: string) {
		let channels = dcClient.guilds.cache.get(guildId).channels.cache.toJSON() as GuildTextBasedChannel[]
		channels = channels.filter((c) => c.type === ChannelType.GuildText)
		await Promise.all(
			channels.map(async (channel) => {
				let messages = await channel.messages.fetch()
				await Promise.all(
					messages.map(async (m) => {
						if (
							m.author.id === dcClient.user.id &&
							(m.content.startsWith('Gratulation') || m.content.includes('Du hast'))
						) {
							await m.delete()
						}
					})
				)
			})
		)
	}
}

const messageDeleter = new MessageDeleter()

export default messageDeleter
