import { User } from 'discord.js'
import Player from '../rpg/Player'
import Module from './_Module'
import { createCanvas } from 'canvas'
type MineCell = { bomb: boolean; explored: boolean; nearbyBombs: number }
type MineBoard = MineCell[][]
export default class Minesweeper extends Module {
	board: MineBoard
	lastUser: User
	rewards: Map<Player, { correct: number }>
	correct: number

	constructor(guildId: string) {
		super(guildId)
	}
	init() {}
	startGame(difficulty: string) {
		this.rewards = new Map()
		this.correct = 0
		this.lastUser = null
		this.board = this.generateBoard(difficulty)
	}
	async onMessageCommand(command: string, args: string, { message, player }: MessageParams) {
		if (command !== 'dig') return
		if (!this.board)
			return await message.channel.send('Das Spiel wurde noch nicht gestartet! Starte es mit `/minesweeper`')
		let time = new Date().getUTCHours() + (1 % 24)
		if (this.lastUser?.id === message.author.id && (time > 6 || time < 23))
			return await message.channel.send('Du darfst nicht zweimal hintereinander!')
		let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		let [letter, number] = args.split(',').map((a) => a.trim().toUpperCase())
		let x = letters.indexOf(letter)
		let y = parseInt(number) - 1
		if (isNaN(x) || isNaN(y)) return await message.channel.send('Ungültige Koordinaten!')
		if (x < 0 || y < 0 || x >= this.board.length || y >= this.board.length)
			return await message.channel.send('Ungültige Koordinaten!')
		if (this.board[x][y].explored) return await message.channel.send('Hier wurde bereits gegraben!')
		this.lastUser = message.author
		let result = this.digCell(x, y, player)
		if (result) {
			this.revealBoard()
			let rewardText = '💥 Du hast eine Bombe getroffen!\n Ihr Habt verloren!\n'
			this.rewards.forEach(({ correct }, player) => {
				if (!player) return
				player.addStats({ exp: correct * 15 })
				rewardText += `${player.user}: ${correct} Korrekt! **+${correct * 15} EXP** (jetzt ${
					player.experience
				})\n`
			})
			await message.channel.send({
				content: rewardText,
				files: [{ attachment: this.renderBoard(), name: 'minesweeper.png' }],
			})
			this.board = null
			return
		}
		this.correct++
		if (!this.rewards.has(player)) this.rewards.set(player, { correct: 0 })
		this.rewards.get(player).correct++

		await message.channel.send({
			content: '✅ Erfolgreich gegraben!',
			files: [{ attachment: this.renderBoard(), name: 'minesweeper.png' }],
		})
		if (this.checkWin()) {
			this.board = null
			let rewardText = 'Ihr habt gewonnen!\n'
			this.rewards.forEach(({ correct }, player) => {
				if (!player) return
				player.addStats({ exp: correct * 50 })
				rewardText += `${player.user}: ${correct} Korrekt! **+${correct * 50} EXP** (jetzt ${
					player.experience
				})\n`
			})
			await message.channel.send(rewardText)
		}
	}
	revealBoard() {
		for (let row of this.board) {
			for (let cell of row) {
				cell.explored = true
			}
		}
	}
	generateBoard(difficulty: string) {
		let size = 10
		let board: MineBoard = []
		let bombChance = 0.1
		if (difficulty === 'easy') {
			size = 8
			bombChance = 0.1
		}
		if (difficulty === 'medium') {
			size = 10
			bombChance = 0.15
		}
		if (difficulty === 'hard') {
			size = 12
			bombChance = 0.17
		}
		if (difficulty === 'insane') {
			size = 15
			bombChance = 0.2
		}
		//bombChance = 1
		for (let i = 0; i < size; i++) {
			let row: MineCell[] = []
			for (let j = 0; j < size; j++) {
				row.push({ bomb: Math.random() < bombChance, explored: false, nearbyBombs: 0 })
			}
			board.push(row)
		}
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				if (board[i][j].bomb) {
					for (let x = -1; x <= 1; x++) {
						for (let y = -1; y <= 1; y++) {
							if (x === 0 && y === 0) continue
							if (i + x < 0 || i + x >= size || j + y < 0 || j + y >= size) continue
							board[i + x][j + y].nearbyBombs++
						}
					}
				}
			}
		}
		return board
	}
	digCell(x: number, y: number, player: Player) {
		let cell = this.board[x][y]
		if (cell.explored) return false
		cell.explored = true
		if (cell.bomb) {
			return true
		}
		if (cell.nearbyBombs === 0) {
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (x + i < 0 || x + i >= this.board.length || y + j < 0 || y + j >= this.board.length) continue
					this.digCell(x + i, y + j, player)
				}
			}
		}
		return false
	}
	checkWin() {
		for (let row of this.board) {
			for (let cell of row) {
				if (!cell.explored && !cell.bomb) return false
			}
		}
		return true
	}
	renderBoard() {
		const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		const FRONT_BLOCK_COLOR = '#C0C0C0'
		const FRONT_BLOCK_BRIGHT_SIDE = '#FDFDFD'
		const FRONT_BLOCK_DARK_SIDE = '#7F7F7F'
		const NUMBER_COLORS = ['#0000FF', '#008000', '#FF0000', '#000080', '#800000', '#008080', '#000000', '#808080']
		let size = this.board.length
		let cellSize = 50
		let canvas = createCanvas(size * cellSize + cellSize, size * cellSize + cellSize)
		let ctx = canvas.getContext('2d')
		ctx.fillStyle = FRONT_BLOCK_COLOR
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				let cell = this.board[i][j]
				let x = i * cellSize
				let y = j * cellSize
				ctx.fillStyle = cell.explored ? '#FFFFFF' : FRONT_BLOCK_COLOR
				ctx.fillRect(x, y, cellSize, cellSize)
				if (cell.explored) {
					ctx.fillStyle = cell.bomb ? '#FF0000' : FRONT_BLOCK_COLOR
					ctx.fillRect(x, y, cellSize, cellSize)
					if (!cell.bomb && cell.nearbyBombs > 0) {
						ctx.fillStyle = NUMBER_COLORS[cell.nearbyBombs - 1]
						ctx.font = 'normal 900 30px Arial '
						ctx.fillText(cell.nearbyBombs.toString(), x + 15, y + 35)
					}
				} else {
					ctx.fillStyle = FRONT_BLOCK_BRIGHT_SIDE
					ctx.fillRect(x, y, cellSize, 5)
					ctx.fillRect(x, y, 5, cellSize)
					ctx.fillStyle = FRONT_BLOCK_DARK_SIDE
					ctx.fillRect(x + cellSize - 5, y, 5, cellSize)
					ctx.fillRect(x, y + cellSize - 5, cellSize, 5)
				}
			}
		}
		//adding grid lines
		ctx.strokeStyle = FRONT_BLOCK_DARK_SIDE
		ctx.lineWidth = 1
		for (let i = 0; i <= size; i++) {
			ctx.beginPath()
			ctx.moveTo(i * cellSize, 0)
			ctx.lineTo(i * cellSize, canvas.height)
			ctx.stroke()
		}
		for (let i = 0; i <= size; i++) {
			ctx.beginPath()
			ctx.moveTo(0, i * cellSize)
			ctx.lineTo(canvas.width, i * cellSize)
			ctx.stroke()
		}
		ctx.strokeStyle = 'black'
		ctx.lineWidth = 3
		ctx.beginPath()
		ctx.moveTo(0, cellSize * size)
		ctx.lineTo(cellSize * size, cellSize * size)
		ctx.lineTo(cellSize * size, 0)
		ctx.stroke()

		ctx.font = 'normal 900 30px Arial'
		ctx.fillStyle = 'black'
		for (let i = 0; i < size; i++) {
			ctx.fillText(LETTERS[i], i * cellSize + cellSize / 2 - 20, cellSize * size + cellSize / 2 + 10)
		}
		for (let i = 0; i < size; i++) {
			ctx.fillText((i + 1).toString(), cellSize * size + cellSize / 2 - 20, i * cellSize + cellSize / 2 + 10)
		}

		return canvas.toBuffer()
	}
}
