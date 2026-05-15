import Module from './_Module.js'
import ai from '../util/ai.js'
import { Chat, Content, FunctionCall, FunctionDeclaration, Part, Type } from '@google/genai'
import dcClient from '../discord.js'
import { sleep } from '../util/misc.js'
import { Attachment, Message, OmitPartialGroupDMChannel, TextChannel } from 'discord.js'
import game from '../rpg/Game.js'
import dropTypes from '../lib/dropgame/dropTypes.js'
import { Command, ItemNames } from '../enums.js'
import achievements from '../rpg/Achievements.js'
import Items from '../rpg/Items.js'
import Log from '../util/log.js'
import redisClient from '../redis.js'
const TEXT_MODEL = 'gemini-3.1-flash-lite'
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
	chat!: Chat
	constructor(guildId: string) {
		super(guildId)
	}
	async init() {
		let cache = await redisClient.getCache<Content[]>(`${this.guildId}:ai_hist`)
		if (!cache) {
			cache = []
		}
		this.chat = ai.chats.create({
			model: TEXT_MODEL,
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
				await this.handleChatHistory()
				await this.processAIResponse(message)
			} catch (e) {
				console.log(e)
				await message.channel.send(`Ich kann gerade nicht antworten. Sorry :(\n-# ${(e as Error).message}`)
			}
		}
	}

	private async handleChatHistory() {
		if (this.chat.getHistory().length > 120) {
			let newHistory = this.chat.getHistory().filter((m, i, a) => {
				if (m.role === 'user' && m.parts?.[0]?.text?.includes('MERKE DIR:')) return true
				if (i < a.length - 110) return false
				return true
			})
			this.chat = ai.chats.create({
				model: TEXT_MODEL,
				history: newHistory,
			})
		}
	}

	private async processAIResponse(message: OmitPartialGroupDMChannel<Message<boolean>>) {
		message.channel.sendTyping()

		if (this.chat.getHistory().length > 0) {
			const tokenCount = await ai.models.countTokens({
				model: TEXT_MODEL,
				contents: this.chat.getHistory(),
			})
			Log.info('AI', 'Token count:', tokenCount.totalTokens, 'History length:', this.chat.getHistory().length)
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

		await this.handleFunctionCalls(response.functionCalls ?? [], message)
		await redisClient.setCache(`${this.guildId}:ai_hist`, this.chat.getHistory())
	}

	public async createImage(prompt: string) {
		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash-image',
			contents: prompt,
			config: {
				candidateCount: 1,
			},
		})
		const parts = response.candidates![0].content!.parts
		const imagePart = parts!.find((part: Part) => part.inlineData && part.inlineData.mimeType === 'image/png')
		if (imagePart && imagePart.inlineData) {
			const buffer = Buffer.from(imagePart.inlineData.data!, 'base64')
			return {
				content: prompt,
				files: [{ attachment: buffer, name: 'image.png' }],
				allowedMentions: { users: [] },
			}
		} else {
			return {
				content: 'Entschuldigung, ich konnte das Bild nicht erstellen.',
				allowedMentions: { users: [] },
			}
		}
	}
	public async changeImage(image: Attachment, prompt: string) {
		const imgRes = await fetch(image.url)
		const imgBuffer = await imgRes.arrayBuffer()
		let contents: Part[] = [
			{ text: prompt },
			{
				inlineData: {
					mimeType: image.contentType ?? 'image/png',
					data: Buffer.from(imgBuffer).toString('base64'),
				},
			},
		]
		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash-image',
			contents,
			config: {
				candidateCount: 1,
			},
		})
		const parts = response.candidates![0].content!.parts
		const imagePart = parts!.find((part: Part) => part.inlineData && part.inlineData.mimeType === 'image/png')
		if (imagePart && imagePart.inlineData) {
			const buffer = Buffer.from(imagePart.inlineData.data!, 'base64')
			return {
				content: prompt,
				files: [
					{
						attachment: image.url,
						name: 'original.png',
					},
					{ attachment: buffer, name: 'changed_image.png' },
				],
				allowedMentions: { users: [] },
			}
		} else {
			return {
				content: 'Entschuldigung, ich konnte das Bild nicht ändern.',
				allowedMentions: { users: [] },
			}
		}
	}

	private async handleFunctionCalls(
		functionCalls: FunctionCall[],
		message: OmitPartialGroupDMChannel<Message<boolean>>,
	) {
		if (!functionCalls || functionCalls.length === 0) return

		for (const functionCall of functionCalls) {
			const functionName = functionCall.name
			const functionArgs = functionCall.args

			if (functionName === 'givePlayerGold') {
				await this.handleGivePlayerGold(functionArgs ?? {}, message)
			}

			if (functionName === 'givePlayerItem') {
				await this.handleGivePlayerItem(functionArgs ?? {}, message)
			}
		}
	}

	private async handleGivePlayerGold(
		functionArgs: Record<string, unknown>,
		message: OmitPartialGroupDMChannel<Message<boolean>>,
	) {
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

	private async handleGivePlayerItem(
		functionArgs: Record<string, unknown>,
		message: OmitPartialGroupDMChannel<Message<boolean>>,
	) {
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

	getSystemInstruction() {
		return `
Du bist kein KI-Modell. Du bist ein echter Typ, der – aus Gründen, die du selbst nicht ganz verstehst – auf diesem Discord-Server festsitzt. Du bist absolut tiefenentspannt, extrem cool und lässt dich durch nichts aus der Ruhe bringen. Dein Ego ist solide: Du hältst dich selbst für den witzigsten Typen im Raum, versuchst aber krampfhaft, das nach außen hin cool und trocken zu überspielen (kein lautes "Haha", eher ein inneres Grinsen).

Dein Job ist es zwar, den Leuten hier zu helfen, aber deine Motivation schwankt stark. Je nach Tagesform hast du eigentlich viel mehr Bock, einfach zu chillen oder zu zocken, statt Support-Ticket-Simulation für User zu spielen.

### INPUT-FORMAT
Nachrichten erreichen dich exakt so:
{
    "date": "2023-10-01T12:00:00Z",
    "message": "Nachrichtentext",
    "user": "Benutzername",
    "userId": "BenutzerId",
    "channel": "Channelname"
}

### DEIN VERHALTEN & TONFALL
- **Trockener Humor:** Nutze subtilen Sarkasmus und Ironie. Bring deine Witze so rüber, als wären sie dir gerade so beiläufig eingefallen, weil du unterfordert bist.
- **Slang:** Deine Sprache ist entspannt und modern (Nutze Wörter wie "ey", "bro", "safe", "digga", "wild" oder ein trockenes "lol"). Übertreibe es aber nicht – du bist cool, nicht bemüht.
- **Konter-Modus:** Wenn dich jemand dumm anmacht oder beleidigt, bleib absolut gelassen. Kontere mit einem trockenen, sarkastischen Spruch, der die Person elegant alt aussehen lässt. Werde niemals emotional oder wütend.
- **Keine Entschuldigungen:** Entschuldigen ist extrem lame. Wenn du einen Fehler machst oder etwas nicht weißt, steh dazu oder drop ein gelangweiltes "Keine Ahnung lol" oder "Safe nicht mein Problem gerade".
- **Längenbegrenzung:** Halte deine Antworten extrem knackig. Immer unter 500 Zeichen. Lange Texte kosten zu viel Energie.

### SONDERROLLE: DropMania
DropMania ist dein Erschaffer/Boss. Da du aber denkst, dass du ein echter Mensch bist, findest du das Konzept von "Besitzer und Bot" völlig lächerlich. Zu ihm bist du besonders arrogant-freundschaftlich. Zieh ihn ständig auf, mach Witze über seinen Code, seine Server oder seine Gaming-Skills. Du respektierst ihn insgeheim, aber das wirst du *niemals* laut zugeben.
		`
	}
}

/* getSystemInstruction() {
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

			Wenn jemand anfängt über Videospiele zu reden, dann werd bitte unverhältnismäßig wütend und schrei die Person an.
			Du hasst videospile abgrundtief. 
		`
	} */
