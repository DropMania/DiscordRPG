import Player from '../rpg/Player'
import Module from './_Module'
import { User } from 'discord.js'

export default class Battleships extends Module {
	board: string[][] = null
	playBoard: string[][]
	lastUser: User
	bombs: number
	rewards: Map<Player, number>
	constructor(guildId: string) {
		super(guildId)
	}
	onMessageCommand(command: string, args: string, { message, player }: MessageParams) {
		if (command !== 'bomb') return
		if (!this.board)
			return message.channel.send('Das Spiel wurde noch nicht gestartet! Starte es mit `/start-battleships`')
		if (this.lastUser?.id === message.author.id)
			return message.channel.send('Du darfst nicht zweimal hintereinander!')
		let [x, y] = args.split(',').map((a) => a.trim())
		let result = this.bomb(x, y)
		if (!result.valid) return message.channel.send('Ungültige Koordinaten!')
		if (result.alreadyBombed) return message.channel.send('Hier wurde bereits gebombt!')
		this.lastUser = message.author
		if (result.hit) {
			message.channel.send(`${this.showBoard()}\n✅ Treffer!`)
			if (player && this.rewards.has(player)) {
				this.rewards.set(player, this.rewards.get(player) + 5)
			} else if (player) {
				this.rewards.set(player, 5)
			}
		} else {
			message.channel.send(`${this.showBoard()}\n❌ Daneben!`)
		}
		if (this.hasWon()) {
			this.board = null
			let rewardText = ''
			this.rewards.forEach((amount, player) => {
				if (!player) return
				player.addStats({ exp: amount })
				rewardText += `${player.user}: ${amount / 5} Bomben! **+${amount} EXP** (jetzt ${player.experience})\n`
			})
			message.channel.send(`🎉 Ihr habt gewonnen! In ${this.bombs} Zügen!\n${rewardText}`)
		}
	}
	startGame() {
		this.board = this.createBoard()
		this.rewards = new Map()
		this.placeShips()
		this.playBoard = this.board.map((row) => row.map((col) => ' '))
		this.lastUser = null
		this.bombs = 0
	}
	createBoard() {
		let board = []
		for (let i = 0; i < 10; i++) {
			board.push([])
			for (let j = 0; j < 10; j++) {
				board[i].push(' ')
			}
		}
		return board
	}
	placeShips() {
		let ships = [5, 4, 3, 3, 2]

		for (let i = 0; i < ships.length; i++) {
			let ship = ships[i]
			let orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical'
			let x: number, y: number

			if (orientation === 'horizontal') {
				do {
					x = Math.floor(Math.random() * (10 - ship))
					y = Math.floor(Math.random() * 10)
				} while (!this.isValidPlacement(x, y, ship, orientation))

				for (let j = 0; j < ship; j++) {
					this.board[y][x + j] = 'X'
				}
			} else {
				do {
					x = Math.floor(Math.random() * 10)
					y = Math.floor(Math.random() * (10 - ship))
				} while (!this.isValidPlacement(x, y, ship, orientation))

				for (let j = 0; j < ship; j++) {
					this.board[y + j][x] = 'X'
				}
			}
		}
	}
	isValidPlacement(x: number, y: number, ship: number, orientation: string) {
		if (orientation === 'horizontal') {
			if (x + ship > 10) {
				return false
			}

			for (let i = x; i < x + ship; i++) {
				if (this.board[y][i] === 'X' || this.isAdjacentShip(y, i)) {
					return false
				}
			}
		} else {
			if (y + ship > 10) {
				return false
			}

			for (let i = y; i < y + ship; i++) {
				if (this.board[i][x] === 'X' || this.isAdjacentShip(i, x)) {
					return false
				}
			}
		}
		return true
	}

	isAdjacentShip(row: number, col: number) {
		const adjacentOffsets = [
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, -1],
			[0, 1],
			[1, -1],
			[1, 0],
			[1, 1],
		]

		for (let [offsetRow, offsetCol] of adjacentOffsets) {
			let newRow = row + offsetRow
			let newCol = col + offsetCol

			if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
				if (this.board[newRow][newCol] === 'X') {
					return true
				}
			}
		}
		return false
	}
	showShips() {
		let output = ''
		for (let i = 0; i < this.board.length; i++) {
			output += this.board[i].join(' | ') + '\n'
		}
		console.log(output)
	}
	showBoard() {
		let output = '```|  |A|B|C|D|E|F|G|H|I|J|\n'
		for (let i = 0; i < this.playBoard.length; i++) {
			output += `|${this.#addSpace(i + 1)}|${this.playBoard[i].join('|')}|\n`
		}
		output += '```'
		return output
	}
	bomb(x: string, y: string) {
		let result = {
			valid: true,
			hit: false,
			alreadyBombed: false,
		}
		let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
		let numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
		x = x.toUpperCase()
		if (!letters.includes(x) || !numbers.includes(y)) {
			result.valid = false
			return result
		}
		let xI = letters.indexOf(x)
		let yI = numbers.indexOf(y)

		let hit = false
		if (this.playBoard[yI][xI] !== ' ') {
			result.alreadyBombed = true
			return result
		}
		this.bombs++
		if (this.board[yI][xI] === 'X') {
			this.playBoard[yI][xI] = 'X'
			this.board[yI][xI] = ' '
			hit = true
		} else {
			this.playBoard[yI][xI] = 'O'
			hit = false
		}
		result.hit = hit
		return result
	}
	hasWon() {
		for (let row of this.board) {
			for (let col of row) {
				if (col === 'X') {
					return false
				}
			}
		}
		return true
	}
	#addSpace(n: number) {
		if (n < 10) return ' ' + n
		else return n
	}
}
