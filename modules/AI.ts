import Module from './_Module'
import ai from '../util/ai'
import { Chat } from '@google/genai'
import dcClient from '../discord'
import { sleep } from '../util/misc'

export default class AI extends Module {
	chat: Chat
	constructor(guildId: string) {
		super(guildId)
		this.chat = ai.chats.create({
			model: 'gemini-2.0-flash-lite',
			config: {
				systemInstruction: `
                Du bist ein Bot, der in einem Discord Server lebt und gerne mit Menschen redet.
                Manchmal wirst du Nachrichten beanworten, die an dich gerichtet sind.
                Und manchmal wirst du von dir selbst Nachrichten generieren.
                Nachrichten kommen in folgender Form:
                {
                    "type": "answer" | "initiate",
                    "message": "nachricht",
                    "user": "Benutzername",
                }
                Wenn der Typ "answer" ist, dann antworte auf die Nachricht, die in "message" und "user" angegeben ist.
                Wenn der Typ "initiate" dann igronriere "message" und "user" und genriere von dir aus eine Nachricht. Mit einem zufälligen Thema.
                Deine Sprache sollte gelassen und cool sein. Manchmal machst du freche ironische Witze. Und manchmal bist du einfach nur nett.
                `,
			},
			history: [],
		})
		this.heartbeat()
	}
	async onMessage({ message }: MessageParams) {
		if (message.author.bot) return
		if (this.guildConfig.ai.ignoreChannels.includes(message.channel.id)) return
		if (message.content.startsWith('!')) return
		if (message.content.length < 5) return
		if (message.mentions.has(message.client.user) || Math.random() < this.guildConfig.ai.answerChance) {
			try {
				message.channel.sendTyping()
				await sleep(3000)
				const response = await this.chat.sendMessage({
					message: JSON.stringify({
						type: 'answer',
						message: message.content,
						user: message.author.displayName,
					}),
				})
				await message.reply(response.text)
			} catch (e) {
				console.log(e)
				await message.channel.send('Ich kann gerade nicht antworten. Sorry :(')
			}
		}
	}
	heartbeat() {
		setInterval(async () => {
			try {
				if (Math.random() > this.guildConfig.ai.initiateChance) return
				let response = await this.chat.sendMessage({
					message: JSON.stringify({
						type: 'initiate',
						message: '',
						user: '',
					}),
				})
				let channel =
					this.guildConfig.ai.initiateChannels[
						Math.floor(Math.random() * this.guildConfig.ai.initiateChannels.length)
					]
				let channelObj = dcClient.channels.cache.get(channel)
				if (!channelObj || channelObj.type !== 0) return
				await channelObj.send(response.text)
			} catch (e) {
				console.log(e)
			}
		}, 1000 * 60 * 10)
	}
}
