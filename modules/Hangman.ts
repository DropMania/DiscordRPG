import Module from './_Module'
import Log from '../util/log'
import fs from 'fs'
import { GuildTextBasedChannel } from 'discord.js'
const WORDS = fs.readFileSync('./lib/data/wordlist.txt', 'utf-8').split('\n')

const pics = [
	`
    +---+
    |   |
        |
        |
        |
        |
    =========
    `,
	`
    +---+
    |   |
    O   |
        |
        |
        |
    =========
    `,
	`
    +---+
    |   |
    O   |
    |   |
        |
        |
    =========
    `,
	`
    +---+
    |   |
    O   |
   /|   |
        |
        |
    =========
    `,
	`
    +---+
    |   |
    O   |
   /|\\  |
        |
        |
    =========
    `,
	`
    +---+
    |   |
    O   |
   /|\\  |
   /    |
        |
    =========
    `,
	`
    +---+
    |   |
    O   |
   /|\\  |
   / \\  |
        |
    =========
    `,
]

export default class Hangman extends Module {
	word: string = ''
	guesses: Set<string> = new Set()
	failedAttempts: number = 0
	going: boolean = false
	constructor(guildId: string) {
		super(guildId)
	}
	pickWord() {
		this.word = WORDS[Math.floor(Math.random() * WORDS.length)].trim()
		this.guesses = new Set()
		this.failedAttempts = 0
		this.going = true
	}
	async onMessageCommand(command: string, args: string, { message, player }: MessageParams) {
		if (command !== 'w') return
		if (!args) return await message.channel.send('Bitte gib einen Buchstaben/Wort an')
		if (this.isGameOver() && !this.going)
			return await message.channel.send('Es läuft gerade kein Spiel. Starte ein neues Spiel mit `/hangman`')
		this.guess(args)
		await message.channel.send(this.display())
		if (this.isGameOver()) {
			if (this.isGameWon()) {
				await message.channel.send('Du hast Gewonnen!')
				player?.addStats({ exp: 5 }, message.channel as GuildTextBasedChannel)
			} else {
				await player?.addStats({ health: -1 })
				await message.channel.send(
					`Verloren! Das Wort war: ${this.word}\nDu hast einen **-1** Lebenspunkt verloren! (${player?.health}/${player?.maxHealth})`
				)
			}
			this.going = false
		}
	}
	guess(word: string) {
		if (this.isGameOver()) {
			return
		}
		if (word.length > 1) {
			if (word.toLowerCase() === this.word.toLowerCase()) {
				this.guesses = new Set(this.word.toLowerCase().split(''))
			} else {
				this.failedAttempts++
			}
		} else {
			if (!this.word.toLowerCase().includes(word.toLowerCase())) {
				this.failedAttempts++
			}
			this.guesses.add(word.toLowerCase())
		}
	}
	display() {
		let pic = pics[this.failedAttempts]
		let display = this.word
			.split('')
			.map((letter) => (this.guesses.has(letter.toLowerCase()) ? letter : '_'))
			.join(' ')
		return '```' + `${pic}\n${display}` + '```'
	}
	isGameOver() {
		return this.failedAttempts >= 6 || this.isGameWon()
	}
	isGameWon() {
		return !this.display().includes('_')
	}
}
