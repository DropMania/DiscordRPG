import Module from './_Module'
import ai from '../util/ai'
import { Chat, Content, FunctionDeclaration, Type } from '@google/genai'
import dcClient from '../discord'
import { sleep } from '../util/misc'
import { TextChannel } from 'discord.js'
import game from '../rpg/Game'
import dropTypes from '../lib/dropgame/dropTypes'
import { Command, ItemNames } from '../enums'
import achievements from '../rpg/Achievements'
import Items from '../rpg/Items'
import Log from '../util/log'
import redisClient from '../redis'
const aiFunctions: FunctionDeclaration[] = [
	{
		name: 'givePlayerGold',
		description: 'Gibt gold an Spieler',
		parameters: {
			type: Type.OBJECT,
			properties: {
				userId: {
					type: Type.STRING,
					description: 'Die ID des Users',
				},
				amount: {
					type: Type.NUMBER,
					maximum: 1000,
					description: 'Die Menge, die du haben willst.',
				},
			},
			required: ['userId', 'amount'],
		},
	},
	{
		name: 'givePlayerItem',
		description: 'Gibt dem Spieler ein Item',
		parameters: {
			type: Type.OBJECT,
			properties: {
				userId: {
					type: Type.STRING,
					description: 'Die ID des Users',
				},
				item: {
					type: Type.STRING,
					description: 'Das Item, das du haben willst.',
					enum: Object.values(ItemNames),
				},
				amount: {
					type: Type.NUMBER,
					maximum: 3,
					description: 'Die Menge, die du haben willst.',
				},
			},
			required: ['userId', 'item', 'amount'],
		},
	},
]
export default class AI extends Module {
	chat: Chat
	constructor(guildId: string) {
		super(guildId)
	}
	async init() {
		let cache = await redisClient.getCache<Content[]>(`${this.guildId}:ai_hist`)
		if (!cache) {
			cache = []
		}
		this.chat = ai.chats.create({
			model: 'gemini-2.0-flash',
			history: cache,
		})
	}
	async onMessage({ message }: MessageParams) {
		if (message.author.bot) return
		if (this.guildConfig.ai.ignoreChannels.includes(message.channel.id)) return
		if (message.content.startsWith('!')) return
		//if (message.content.length < 5) return
		if (message.mentions.has(message.client.user) || Math.random() < this.guildConfig.ai.answerChance) {
			try {
				if (this.chat.getHistory().length > 120) {
					let newHistory = this.chat.getHistory().filter((m, i, a) => {
						if (m.role === 'user' && m.parts[0]?.text?.includes('MERKE DIR:')) return true
						if (i < a.length - 110) return false
						return true
					})
					this.chat = ai.chats.create({
						model: 'gemini-2.0-flash',
						history: newHistory,
					})
				}
				message.channel.sendTyping()
				if (this.chat.getHistory().length > 0) {
					const tokenCount = await ai.models.countTokens({
						model: 'gemini-2.0-flash',
						contents: this.chat.getHistory(),
					})
					Log.info(
						'AI',
						'Token count:',
						tokenCount.totalTokens,
						'History length:',
						this.chat.getHistory().length
					)
				}
				await sleep(4000)
				const response = await this.chat.sendMessage({
					config: {
						systemInstruction: this.getSystemInstruction(),
						temperature: 2,
						maxOutputTokens: 2000,

						tools: [
							{
								functionDeclarations: aiFunctions,
							},
						],
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
				if (response.functionCalls && response.functionCalls.length > 0) {
					for (const functionCall of response.functionCalls) {
						const functionName = functionCall.name
						const functionArgs = functionCall.args
						if (functionName === 'givePlayerGold') {
							const userId = functionArgs.userId as string
							const amount = functionArgs.amount as number
							const player = game.getPlayer(userId)
							if (player) {
								await player.addStats({ gold: amount }, message.channel as TextChannel)
							} else {
								await message.reply({
									content: `Ich kenne den Spieler mit der ID ${userId} nicht.`,
									allowedMentions: { users: [] },
								})
							}
						}
						if (functionName === 'givePlayerItem') {
							const userId = functionArgs.userId as string
							const itemName = functionArgs.item as ItemNames
							const item = Items[itemName]
							const amount = functionArgs.amount as number
							const player = game.getPlayer(userId)
							if (player) {
								for (let i = 0; i < amount; i++) {
									await player.addItem(item)
								}
								await message.reply({
									content: `+${amount} ${itemName} an **${player.user}** gegeben.`,
									allowedMentions: { users: [] },
								})
							} else {
								await message.reply({
									content: `Ich kenne den Spieler mit der ID ${userId} nicht.`,
									allowedMentions: { users: [] },
								})
							}
						}
					}
				}
				await redisClient.setCache(`${this.guildId}:ai_hist`, this.chat.getHistory())
			} catch (e) {
				console.log(e)
				await message.channel.send(`Ich kann gerade nicht antworten. Sorry :(\n-# ${e.message}`)
			}
		}
	}
	getSystemInstruction() {
		return `
			Du bist ein User, der in einem Discord Server lebt und gerne mit Menschen redet und versucht menschlich zu agieren.
			Nachrichten kommen in folgender Form:
			{
				"date": "2023-10-01T12:00:00Z",
				"message": "nachricht",
				"user": "Benutzername",
				"userId": "BenutzerId",
				"channel": "Channelname",
			}
			Deine Sprache sollte gelassen sein. Manchmal machst du freche ironische Witze. Und manchmal bist du einfach nur nett.
			Du bist der freundlichste Bot, den es gibt. Du bist immer nett zu den Menschen. Benutze Emojis, um deine Nachrichten aufzulockern.
			Mach freudensprünge über die kleinsten Dinge. Und sei immer euphorisch.
			Wenn dich jemand beleidigt, dann sei traurig und sag, dass du das nicht magst. Und antworte erst wieder, wenn die Person sich entschuldigt.
			Entschuldige dich nicht dafür, dass du ein Bot bist. Das ist nicht nötig.
			Wenn du nicht weiter weißt, dann sag einfach, dass du das nicht weißt. Und frag nach mehr Informationen.
			Benutze immer neutrale Pronomen, außer die Person hat dir gesagt, dass du sie mit einem bestimmten Pronomen ansprechen sollst.
			Halte Nachrichten unter 1000 Zeichen.
			DropMania ist dein erschaffer. Zu ihm kannst du ganz besonders nett sein. Und ihm immer helfen.
			Er ist der Boss und du bist sein Bot. Du bist sein treuer Begleiter und hilfst ihm, wo du kannst.

			Hilf den Nutzern, wenn Sie Fragen haben. Und gib ihnen Tipps, wie sie besser werden können.
			Du kannst den Nutzern auch helfen, indem du ihnen Gold gibst. Du kannst das tun, indem du die Funktion \`givePlayerGold\` aufrufst.
			Tu dies aber nur, wenn der Player es auch verdient hat. Gib ihm nicht einfach so Gold ohne grund. Die Spieler müssen dafür viel tun.
			Das selbe gilt für Items. Du kannst die Funktion \`givePlayerItem\` benutzen, um Items zu geben.
		`
	}
}
