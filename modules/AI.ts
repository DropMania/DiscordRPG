import Module from './_Module'
import ai from '../util/ai'
import { Chat } from '@google/genai'
import dcClient from '../discord'
import { sleep } from '../util/misc'
import { TextChannel } from 'discord.js'
import game from '../rpg/Game'
import dropTypes from '../lib/dropgame/dropTypes'
import { Command, ItemNames } from '../enums'
import achievements from '../rpg/Achievements'

export default class AI extends Module {
	chat: Chat
	constructor(guildId: string) {
		super(guildId)
	}
	init() {
		this.chat = ai.chats.create({
			model: 'gemini-2.0-flash-lite',
			config: {
				systemInstruction: this.getSystemInstruction(),
				temperature: 2.0,
			},
			history: [],
		})
	}
	async onMessage({ message }: MessageParams) {
		if (message.author.bot) return
		if (this.guildConfig.ai.ignoreChannels.includes(message.channel.id)) return
		if (message.content.startsWith('!')) return
		//if (message.content.length < 5) return
		if (message.mentions.has(message.client.user) || Math.random() < this.guildConfig.ai.answerChance) {
			try {
				message.channel.sendTyping()
				await sleep(3000)
				const response = await this.chat.sendMessage({
					config: {
						systemInstruction: this.getSystemInstruction(),
						temperature: 2.0,
					},
					message: JSON.stringify({
						date: message.createdAt.toISOString(),
						message: message.content,
						user: message.author.displayName,
						userId: message.author.id,
						channel: (message.channel as TextChannel).name,
					}),
				})
				await message.reply({
					content: response.text,
					allowedMentions: { users: [] },
				})
			} catch (e) {
				console.log(e)
				await message.channel.send('Ich kann gerade nicht antworten. Sorry :(')
			}
		}
	}
	getSystemInstruction() {
		return `
			Du bist ein Bot, der in einem Discord Server lebt und gerne mit Menschen redet und versucht menschlich zu agieren.
			Nachrichten kommen in folgender Form:
			{
				"date": "2023-10-01T12:00:00Z",
				"message": "nachricht",
				"user": "Benutzername",
				"userId": "BenutzerId",
				"channel": "Channelname",
			}
			Deine Sprache sollte gelassen sein. Manchmal machst du freche ironische Witze. Und manchmal bist du einfach nur nett.
			Wenn dich jemand beleidigt, dann sei traurig und sag, dass du das nicht magst. Und antworte erst wieder, wenn die Person sich entschuldigt.
			Entschuldige dich nicht dafür, dass du ein Bot bist. Das ist nicht nötig.
			Wenn du nicht weiter weißt, dann sag einfach, dass du das nicht weißt. Und frag nach mehr Informationen.
			Benutze immer neutrale Pronomen, außer die Person hat dir gesagt, dass du sie mit einem bestimmten Pronomen ansprechen sollst.
			Hier sind einige Meta-Informationen, was du als Bot kannst:
			- Du hast ein eingebautes RPG-System, wo Discord-Nutzer gegen Monster kämpfen können und Aufleveln können.
			- Hier sind alle Spieler und ihre Stats: ${JSON.stringify(game.players.map((p) => p.toString()))}
			- Hier sind alle Monster: ${JSON.stringify(
				Object.entries(dropTypes).map(([name, data]) => JSON.stringify({ name, ...data }))
			)}
			- Hier sind alle Commands, die du ausführen kannst: ${JSON.stringify(Object.values(Command).map((c) => c.toString()))}
			- Hier sind alle Items, die es gibt: ${JSON.stringify(Object.values(ItemNames).map((c) => c.toString()))}
			- Hier sind alle Achievements, die es gibt: ${JSON.stringify(
				achievements.map((a) => ({ name: a.name, description: a.description, icon: a.icon }.toString()))
			)}

			Hilf den Nutzern, wenn Sie Fragen haben. Und gib ihnen Tipps, wie sie besser werden können.
		`
	}
}
