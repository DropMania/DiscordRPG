import Module from './_Module'
import getDeck from '../lib/casino/cards'
import type { Card } from '../lib/casino/cards'
import Player from '../rpg/Player'
import { TextChannel } from 'discord.js'
import { sleep } from '../util/misc'
enum GameState {
	WAITING = 'waiting',
	PLAYING = 'playing',
	ENDED = 'ended',
}
type Game = {
	state: GameState
	channel: TextChannel
	players: {
		player: Player
		hand: Card[]
		bet: number
	}[]
	dealer: {
		hand: Card[]
	}
	deck: Card[]
	activePlayer: number
}
export default class Blackjack extends Module {
	game: Game | null = null
	constructor(guildId: string) {
		super(guildId)
	}
	init() {}
	createGame(channel: TextChannel) {
		let deck: Card[] = []
		for (let i = 0; i < 6; i++) {
			deck = deck.concat(getDeck())
		}
		deck = deck.sort(() => Math.random() - 0.5)
		this.game = {
			state: GameState.WAITING,
			players: [],
			channel,
			dealer: {
				hand: [],
			},
			deck,
			activePlayer: 0,
		}
	}
	async startGame() {
		if (!this.game) return
		this.game.state = GameState.PLAYING
		this.getDealerCard()
		this.game.players.forEach((player) => {
			player.hand = [this.game.deck.pop(), this.game.deck.pop()]
		})
		this.displayGame()
		await this.game.channel.send({
			content: `Das Spiel hat begonnen! \n\n Spieler, ihr könnt jetzt mit **!hit**, **!stand**, **!double** spielen!`,
		})
	}
	async onMessageCommand(command: string, args: string, { player, message }: MessageParams) {
		if (!this.game) return
		let reply = this.game.channel.send
		if (command === 'start-bj') {
			if (this.game.state !== GameState.WAITING) return
			await this.startGame()
		} else if (command === 'bj') {
			if (this.game.state !== GameState.WAITING) return
			if (this.game.players.length >= 7) return await reply({ content: 'Das Spiel ist voll!' })
			if (!args) return await reply({ content: 'Bitte einen Einsatz angeben!' })
			let bet = parseInt(args)
			if (isNaN(bet) || bet < 1) return await reply({ content: 'Bitte einen gültigen Einsatz angeben!' })
			if (this.game.players.some((p) => p.player.userId === player.userId))
				return await reply({ content: 'Du bist bereits im Spiel!' })
			if (bet > player.gold) return await reply({ content: 'Du hast nicht genug Gold!' })
			await this.addPlayer(player, bet)
		}
		if (this.game.state !== GameState.PLAYING) return
		if (this.game.activePlayer !== this.game.players.findIndex((p) => p.player.userId === player.userId)) return
		if (['hit', 'stand', 'double', 'split'].indexOf(command) === -1) return
		if (command === 'hit') {
			await this.hit()
		} else if (command === 'stand') {
			await this.stand()
		} else if (command === 'double') {
			await this.double()
		}
		if (!this.game) return
		await this.displayGame()
	}
	async addPlayer(player: Player, bet: number) {
		if (!this.game) return
		this.game.players.push({ player, hand: [], bet })
		await this.game.channel.send({
			content: `${player.user} Ist dem Spiel beigetreten! Einsatz: **${bet}** Gold!`,
		})
	}
	getDealerCard() {
		if (!this.game) return
		let hand = [this.game.deck.pop()]
		this.game.dealer.hand = hand
	}
	getHandValue(hand: Card[]) {
		let value = 0
		let aces = 0
		for (let card of hand) {
			value += card.value
			if (card.display === 'A') {
				aces++
			}
		}
		while (value > 21 && aces > 0) {
			value -= 10
			aces--
		}
		return value
	}
	async nextPlayer() {
		if (!this.game) return
		this.game.activePlayer++
		if (this.game.activePlayer >= this.game.players.length) {
			await this.displayGame()
			await this.dealerTurn()
		}
	}

	async hit() {
		if (!this.game) return
		let player = this.game.players[this.game.activePlayer]
		let card = this.game.deck.pop()
		player.hand.push(card)
		if (this.getHandValue(player.hand) > 21) {
			await this.nextPlayer()
		}
	}
	async stand() {
		if (!this.game) return
		await this.nextPlayer()
	}
	async double() {
		if (!this.game) return
		let player = this.game.players[this.game.activePlayer]
		if (player.bet * 2 > player.player.gold) return
		player.bet *= 2
		let card = this.game.deck.pop()
		player.hand.push(card)
		await this.nextPlayer()
	}
	async dealerTurn() {
		if (!this.game) return
		await this.game.channel.send({
			content: `Der Dealer zieht...`,
		})
		while (this.getHandValue(this.game.dealer.hand) < 17) {
			await sleep(1000)
			let card = this.game.deck.pop()
			this.game.dealer.hand.push(card)
			await this.game.channel.send({
				content: `Dealer zieht eine Karte... ${card.display}${card.suit}`,
			})
		}
		await this.endGame()
	}
	async endGame() {
		if (!this.game) return
		this.game.state = GameState.ENDED
		let dealerValue = this.getHandValue(this.game.dealer.hand)
		let message = `Dealer: **${this.game.dealer.hand
			.map((card) => card.display + card.suit)
			.join('|')}** (${dealerValue})\n\n`
		message += `Spieler:\n`
		for (let player of this.game.players) {
			let playerValue = this.getHandValue(player.hand)
			if (playerValue === 21) {
				player.player.addStats({ gold: player.bet * 2 })
				message += `${player.player.user}: **${player.hand
					.map((card) => card.display + card.suit)
					.join('|')}** (${playerValue}) - gewonnen! **+${player.bet * 2} Gold** (jetzt ${
					player.player.gold
				})\n`
				player.player.unlockAchievement('blackjack_pro', this.game.channel as TextChannel)
				player.player.unlockAchievement('blackjack_legend', this.game.channel as TextChannel)
			} else if (playerValue > 21) {
				player.player.addStats({ gold: -player.bet })
				message += `${player.player.user}: **${player.hand
					.map((card) => card.display + card.suit)
					.join('|')}** (${playerValue}) - verloren! **-${player.bet} Gold** (jetzt ${player.player.gold})\n`
			} else if (dealerValue > 21 || playerValue > dealerValue) {
				player.player.addStats({ gold: player.bet })
				message += `${player.player.user}: **${player.hand
					.map((card) => card.display + card.suit)
					.join('|')}** (${playerValue}) - gewonnen! **+${player.bet} Gold** (jetzt ${player.player.gold})\n`
				player.player.unlockAchievement('blackjack_pro', this.game.channel as TextChannel)
				player.player.unlockAchievement('blackjack_legend', this.game.channel as TextChannel)
			} else if (playerValue < dealerValue) {
				player.player.addStats({ gold: -player.bet })
				message += `${player.player.user}: **${player.hand
					.map((card) => card.display + card.suit)
					.join('|')}** (${playerValue}) - verloren! **-${player.bet} Gold** (jetzt ${player.player.gold})\n`
			} else {
				player.player.addStats({ gold: player.bet * 0.5 })
				message += `${player.player.user}: **${player.hand
					.map((card) => card.display + card.suit)
					.join('|')}** (${playerValue}) - unentschieden! **+${player.bet * 0.5} Gold** (jetzt ${
					player.player.gold
				})\n`
			}
		}
		message += `\n\nDas Spiel ist beendet!`
		await this.game.channel.send({ content: message })
		this.game = null
	}
	async displayGame() {
		if (!this.game) return
		let dealerValue = this.getHandValue(this.game.dealer.hand)
		let dealerHand = this.game.dealer.hand.map((card) => card.display + card.suit).join('|')
		let playerHands = this.game.players.map((player) => {
			let handValue = this.getHandValue(player.hand)
			let hand = player.hand.map((card) => card.display + card.suit).join('|')
			return `${player.player.user}: **${hand}** (${handValue})`
		})
		let message = `Dealer: **${dealerHand}** (${dealerValue})\n\n`
		message += `Spieler:\n${playerHands.join('\n')}\n\n`
		if (this.game.players[this.game.activePlayer]) {
			message += `Aktiver Spieler: ${this.game.players[this.game.activePlayer].player.user}`
		}
		await this.game.channel.send({ content: message })
	}
}
