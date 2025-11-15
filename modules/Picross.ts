import { User } from 'discord.js'
import Module from './_Module'
import { createCanvas } from 'canvas'

type PicrossCell = { block: boolean; filled: boolean }
type PicrossBoard = PicrossCell[][]
export default class Picross extends Module {
	board: PicrossBoard
	verticalHints: number[][]
	horizontalHints: number[][]
	lastUser: User
	rewards: Map<string, { correct: number; wrong: number }>
	correct: number
	wrong: number

	constructor(guildId: string) {
		super(guildId)
	}
	init() {}
	startGame(dim: number) {
		this.rewards = new Map()
		this.correct = 0
		this.wrong = 0
		this.board = this.generateBoard(dim)
		this.verticalHints = this.generateVerticalHints(this.board)
		this.horizontalHints = this.generateHorizontalHints(this.board)
	}
	async onMessageCommand(command: string, args: string, { message }: MessageParams) {
		if (command !== 'pic') return
		if (!this.board)
			return await message.channel.send('Das Spiel wurde noch nicht gestartet! Starte es mit `/picross`')
		/* if (this.lastUser?.id === message.author.id)
			return await message.channel.send('Du darfst nicht zweimal hintereinander!') */
		let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		let [letter, number] = args.split(',').map((a) => a.trim().toUpperCase())
		let y = letters.indexOf(letter)
		let x = parseInt(number) - 1
		if (isNaN(x) || isNaN(y)) return await message.channel.send('Ungültige Koordinaten!')
		if (x < 0 || y < 0 || x >= this.board.length || y >= this.board.length)
			return await message.channel.send('Ungültige Koordinaten!')
		if (this.board[x][y].filled) return await message.channel.send('Hier wurde bereits gefüllt!')
		this.lastUser = message.author
		let result = this.guess(x, y, message.author.id)
		let out = ``
		if (result) {
			out += '✅ Korrekt!'
		} else {
			out += '❌ Falsch!'
		}
		await message.channel.send({
			content: out,
			files: [{ attachment: this.renderBoard(), name: 'picross.png' }],
		})
		if (this.checkWin()) {
			this.board = null
			let rewardText = ''
			this.rewards.forEach(({ correct, wrong }, player) => {})
			await message.channel.send(`🎉 Ihr habt gewonnen!\n${rewardText}`)
		}
	}
	renderBoard(): Buffer {
		let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		let dim = this.board.length
		let longestHorizontal = Math.max(...this.horizontalHints.map((v) => v.length))
		let longestVertical = Math.max(...this.verticalHints.map((v) => v.length))
		let cellSize = 40
		let letterOffset = 25
		let canvas = createCanvas(
			dim * cellSize + longestVertical * cellSize + letterOffset,
			dim * cellSize + longestHorizontal * cellSize + letterOffset
		)
		let ctx = canvas.getContext('2d')
		ctx.fillStyle = 'black'
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.fillStyle = 'white'

		ctx.font = `${cellSize / 2}px Arial`
		for (let i = 0; i < dim; i++) {
			let hints = this.verticalHints[i]
			for (let j = 0; j < longestVertical; j++) {
				if (hints[j]) {
					ctx.fillText(
						hints[j].toString(),
						j * cellSize + cellSize / 4,
						i * cellSize + longestHorizontal * cellSize + cellSize / 2
					)
				}
			}
		}
		for (let i = 0; i < dim; i++) {
			let hints = this.horizontalHints[i]
			for (let j = 0; j < longestHorizontal; j++) {
				if (hints[j]) {
					ctx.fillText(
						hints[j].toString(),
						i * cellSize + cellSize / 4 + longestVertical * cellSize,
						j * cellSize + cellSize / 2
					)
				}
			}
		}
		for (let i = 0; i < dim; i++) {
			for (let j = 0; j < dim; j++) {
				if (this.board[i][j].filled) {
					ctx.fillStyle = this.board[i][j].block ? 'green' : 'red'
					ctx.fillRect(
						j * cellSize + longestVertical * cellSize,
						i * cellSize + longestHorizontal * cellSize,
						cellSize,
						cellSize
					)
				}
			}
		}

		ctx.font = `${letterOffset / 2}px Arial`
		ctx.fillStyle = 'white'
		for (let i = 0; i < dim; i++) {
			ctx.fillText(
				letters[i],
				i * cellSize + longestVertical * cellSize + cellSize / 2,
				(dim + longestHorizontal) * cellSize + letterOffset / 2
			)
		}
		for (let i = 0; i < dim; i++) {
			ctx.fillText(
				(i + 1).toString(),
				(dim + longestVertical) * cellSize + letterOffset / 2,
				i * cellSize + longestHorizontal * cellSize + cellSize / 2
			)
		}

		//add grid lines
		ctx.strokeStyle = 'white'
		ctx.lineWidth = 2
		for (let i = 0; i <= dim; i++) {
			ctx.beginPath()
			ctx.moveTo(i * cellSize + longestVertical * cellSize, longestHorizontal * cellSize)
			ctx.lineTo(i * cellSize + longestVertical * cellSize, canvas.height - letterOffset)
			ctx.stroke()
		}
		for (let i = 0; i <= dim; i++) {
			ctx.beginPath()
			ctx.moveTo(longestVertical * cellSize, i * cellSize + longestHorizontal * cellSize)
			ctx.lineTo(canvas.width - letterOffset, i * cellSize + longestHorizontal * cellSize)
			ctx.stroke()
		}
		return canvas.toBuffer()
	}
	guess(x: number, y: number, player: string): boolean {
		this.board[x][y].filled = true
		if (!this.rewards.has(player)) {
			this.rewards.set(player, { correct: 0, wrong: 0 })
		}
		if (this.board[x][y].block) {
			this.correct++
			this.rewards.get(player).correct += 1
			return true
		}
		this.wrong++
		this.rewards.get(player).wrong += 1
		return false
	}
	checkWin() {
		let totalBlocks = this.board.flat(2).filter((cell) => cell.block).length
		return this.correct === totalBlocks
	}
	generateBoard(dim: number): PicrossBoard {
		return Array.from({ length: dim }, () =>
			Array.from({ length: dim }, () => ({ block: Math.random() > 0.5, filled: false }))
		)
	}

	generateVerticalHints(board: PicrossBoard): number[][] {
		return board.map((row) => {
			let hints = []
			let count = 0
			for (let i = 0; i < row.length; i++) {
				if (row[i].block === true) {
					count++
				} else if (count > 0) {
					hints.push(count)
					count = 0
				}
			}
			if (count > 0) {
				hints.push(count)
			}
			return hints
		})
	}
	generateHorizontalHints(board: PicrossBoard): number[][] {
		return board[0].map((_, i) => {
			let hints = []
			let count = 0
			for (let j = 0; j < board.length; j++) {
				if (board[j][i].block === true) {
					count++
				} else if (count > 0) {
					hints.push(count)
					count = 0
				}
			}
			if (count > 0) {
				hints.push(count)
			}
			return hints
		})
	}
}
