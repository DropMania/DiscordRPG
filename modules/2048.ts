import Module from './_Module.js'
import { createCanvas, Canvas, registerFont } from 'canvas'
import fs from 'fs'
import path from 'path'
import { TextChannel, User } from 'discord.js'
import Player from '../rpg/Player.js'
import redisClient from '../redis.js'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface GameState {
	grid: number[][]
	score: number
	gameOver: boolean
	won: boolean
	canMove: boolean
}

type Cache2048Type = {
	grid: number[][]
	score: number
	gameOver: boolean
	won: boolean
	canMove: boolean
	lastUser: { id: string; username: string } | null
	rewards: Array<{ playerId: string; moves: number; score: number }>
	totalMoves: number
}

export class Game2048 extends Module {
	private grid: number[][] = []
	private score: number = 0
	private gameOver: boolean = false
	private won: boolean = false
	private canMove: boolean = true
	private canvas: Canvas
	private tileSize = 100
	private gridSize = 4
	private padding = 10
	private canvasSize = this.tileSize * this.gridSize + this.padding * (this.gridSize + 1)
	lastUser: User | null = null
	rewards!: Map<Player, { moves: number; score: number }>
	totalMoves!: number

	constructor(guildId: string) {
		super(guildId)
		this.canvas = createCanvas(this.canvasSize, this.canvasSize + 80) // Extra space for score
		this.initializeGrid()
	}

	async init() {
		// Try to load cached game state
		const cachedGame = await redisClient.getCache<Cache2048Type>(`${this.guildId}:2048Game`)
		if (cachedGame) {
			// Restore game state from cache
			this.grid = cachedGame.grid
			this.score = cachedGame.score
			this.gameOver = cachedGame.gameOver
			this.won = cachedGame.won
			this.canMove = cachedGame.canMove
			this.totalMoves = cachedGame.totalMoves

			// Restore lastUser if exists
			if (cachedGame.lastUser) {
				this.lastUser = { id: cachedGame.lastUser.id, username: cachedGame.lastUser.username } as User
			}

			// Restore rewards - note: we can only cache player IDs, not full Player objects
			this.rewards = new Map()
			for (const reward of cachedGame.rewards) {
				// Player objects will be created fresh when commands are executed
				// For now we store a placeholder that gets replaced on first interaction
				const placeholderPlayer = { userId: reward.playerId } as Player
				this.rewards.set(placeholderPlayer, { moves: reward.moves, score: reward.score })
			}
		} else {
			// No cached game, start new
			this.newGame()
		}
	}

	async onMessageCommand(command: string, args: string, { message, player }: MessageParams) {
		if (!['2048'].includes(command)) return
		if (!this.grid || this.grid.length === 0)
			return await message.channel.send('Das 2048 Spiel wurde noch nicht gestartet! Starte es mit `/2048`')

		const direction = args.toLowerCase() as Direction

		if (args === 'new') {
			this.newGame()
			await this.sendGameBoard(message.channel as TextChannel)
			return
		}

		if (!['up', 'down', 'left', 'right'].includes(direction)) {
			return await message.channel.send('Benutze: `!2048 up/down/left/right` oder `!2048 new`')
		}

		if (this.gameOver) {
			return await message.channel.send('Das Spiel ist beendet! Starte ein neues Spiel mit `!2048 new`')
		}

		// Check if same user is trying to move twice in a row
		let time = new Date().getUTCHours() + (1 % 24)
		let startTime = this.guildConfig.minesweeper.nightTime.start
		let endTime = this.guildConfig.minesweeper.nightTime.end
		if (this.lastUser?.id === message.author.id && time >= endTime && time < startTime)
			return await message.channel.send('Du darfst nicht zweimal hintereinander!')

		this.lastUser = message.author
		if (!player) return
		await this.move(direction, player, message.channel as TextChannel)
	}

	// Button functionality removed - game is now command-only

	// Old game command handler removed - using direct message command handler

	public newGame() {
		this.grid = []
		this.score = 0
		this.gameOver = false
		this.won = false
		this.canMove = true
		this.lastUser = null
		this.rewards = new Map()
		this.totalMoves = 0
		this.initializeGrid()
		this.addRandomTile()
		this.addRandomTile()
		// Clear cache when starting new game
		this.clearGameCache()
	}

	private async saveGameState() {
		// Convert rewards Map to array for serialization
		const rewardsArray: Array<{ playerId: string; moves: number; score: number }> = []
		for (const [player, stats] of this.rewards.entries()) {
			rewardsArray.push({
				playerId: player.userId,
				moves: stats.moves,
				score: stats.score,
			})
		}

		const cacheData: Cache2048Type = {
			grid: this.grid,
			score: this.score,
			gameOver: this.gameOver,
			won: this.won,
			canMove: this.canMove,
			lastUser: this.lastUser ? { id: this.lastUser.id, username: this.lastUser.username } : null,
			rewards: rewardsArray,
			totalMoves: this.totalMoves,
		}

		await redisClient.setCache(`${this.guildId}:2048Game`, cacheData)
	}

	private async clearGameCache() {
		// We need to manually clear the cache since Redis client doesn't have a direct delete cache method
		// We'll use a workaround by setting an empty cache that expires immediately
		await redisClient.setCache(`${this.guildId}:2048Game`, null)
	}

	private initializeGrid() {
		for (let i = 0; i < this.gridSize; i++) {
			this.grid[i] = []
			for (let j = 0; j < this.gridSize; j++) {
				this.grid[i][j] = 0
			}
		}
	}

	private addRandomTile() {
		const emptyCells = this.getEmptyCells()
		if (emptyCells.length === 0) return

		const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
		const value = Math.random() < 0.9 ? 2 : 4
		this.grid[randomCell.row][randomCell.col] = value
	}

	private getEmptyCells(): { row: number; col: number }[] {
		const emptyCells = []
		for (let i = 0; i < this.gridSize; i++) {
			for (let j = 0; j < this.gridSize; j++) {
				if (this.grid[i][j] === 0) {
					emptyCells.push({ row: i, col: j })
				}
			}
		}
		return emptyCells
	}

	private async move(direction: Direction, player: Player, channel: TextChannel) {
		if (this.gameOver) return

		const previousGrid = this.grid.map((row) => [...row])
		const previousScore = this.score
		let moved = false

		switch (direction) {
			case 'left':
				moved = this.moveLeft()
				break
			case 'right':
				moved = this.moveRight()
				break
			case 'up':
				moved = this.moveUp()
				break
			case 'down':
				moved = this.moveDown()
				break
		}

		if (!moved) {
			await channel.send('❌ Ungültiger Zug! Keine Bewegung möglich.')
			return
		}

		this.addRandomTile()
		this.totalMoves++

		// Track player progress - handle cached vs new players
		let playerReward = this.rewards.get(player)
		if (!playerReward) {
			// Check if this player ID exists in our cached rewards (from initial load)
			let existingPlayerKey = null
			for (const [cachedPlayer, _] of this.rewards.entries()) {
				if (cachedPlayer.userId === player.userId) {
					existingPlayerKey = cachedPlayer
					break
				}
			}

			if (existingPlayerKey) {
				// Transfer cached data to new player object
				playerReward = this.rewards.get(existingPlayerKey)
				this.rewards.delete(existingPlayerKey)
				this.rewards.set(player, playerReward!)
			} else {
				// New player
				this.rewards.set(player, { moves: 0, score: 0 })
				playerReward = this.rewards.get(player)
			}
		}
		playerReward!.moves++
		playerReward!.score = this.score

		this.checkWinCondition()
		this.checkGameOver()

		// Save game state to cache after each move
		await this.saveGameState()

		const scoreGained = this.score - previousScore
		let message = `✅ ${direction.toUpperCase()} bewegt!`
		if (scoreGained > 0) {
			message += ` +${scoreGained} Punkte!`
		}

		await channel.send({
			content: message,
			files: [{ attachment: this.drawCanvas(), name: '2048.png' }],
		})

		// Check for game end
		if (this.won || this.gameOver) {
			await this.handleGameEnd(channel)
		}
	}

	private moveLeft(): boolean {
		let moved = false

		for (let i = 0; i < this.gridSize; i++) {
			const row = this.grid[i].filter((val) => val !== 0)
			const merged = this.mergeRow(row)

			while (merged.length < this.gridSize) {
				merged.push(0)
			}

			for (let j = 0; j < this.gridSize; j++) {
				if (this.grid[i][j] !== merged[j]) {
					moved = true
				}
				this.grid[i][j] = merged[j]
			}
		}

		return moved
	}

	private moveRight(): boolean {
		let moved = false

		for (let i = 0; i < this.gridSize; i++) {
			const row = this.grid[i].filter((val) => val !== 0).reverse()
			const merged = this.mergeRow(row).reverse()

			while (merged.length < this.gridSize) {
				merged.unshift(0)
			}

			for (let j = 0; j < this.gridSize; j++) {
				if (this.grid[i][j] !== merged[j]) {
					moved = true
				}
				this.grid[i][j] = merged[j]
			}
		}

		return moved
	}

	private moveUp(): boolean {
		let moved = false

		for (let j = 0; j < this.gridSize; j++) {
			const column = []
			for (let i = 0; i < this.gridSize; i++) {
				if (this.grid[i][j] !== 0) {
					column.push(this.grid[i][j])
				}
			}

			const merged = this.mergeRow(column)

			while (merged.length < this.gridSize) {
				merged.push(0)
			}

			for (let i = 0; i < this.gridSize; i++) {
				if (this.grid[i][j] !== merged[i]) {
					moved = true
				}
				this.grid[i][j] = merged[i]
			}
		}

		return moved
	}

	private moveDown(): boolean {
		let moved = false

		for (let j = 0; j < this.gridSize; j++) {
			const column = []
			for (let i = this.gridSize - 1; i >= 0; i--) {
				if (this.grid[i][j] !== 0) {
					column.push(this.grid[i][j])
				}
			}

			const merged = this.mergeRow(column)

			while (merged.length < this.gridSize) {
				merged.push(0)
			}

			for (let i = 0; i < this.gridSize; i++) {
				const rowIndex = this.gridSize - 1 - i
				if (this.grid[rowIndex][j] !== merged[i]) {
					moved = true
				}
				this.grid[rowIndex][j] = merged[i]
			}
		}

		return moved
	}

	private mergeRow(row: number[]): number[] {
		const merged = []
		let i = 0

		while (i < row.length) {
			if (i + 1 < row.length && row[i] === row[i + 1]) {
				merged.push(row[i] * 2)
				this.score += row[i] * 2
				i += 2
			} else {
				merged.push(row[i])
				i++
			}
		}

		return merged
	}

	private checkWinCondition() {
		if (this.won) return

		for (let i = 0; i < this.gridSize; i++) {
			for (let j = 0; j < this.gridSize; j++) {
				if (this.grid[i][j] === 2048) {
					this.won = true
					return
				}
			}
		}
	}

	private checkGameOver() {
		// Check if there are empty cells
		if (this.getEmptyCells().length > 0) {
			this.gameOver = false
			return
		}

		// Check if any moves are possible
		for (let i = 0; i < this.gridSize; i++) {
			for (let j = 0; j < this.gridSize; j++) {
				const current = this.grid[i][j]

				// Check right
				if (j < this.gridSize - 1 && this.grid[i][j + 1] === current) {
					this.gameOver = false
					return
				}

				// Check down
				if (i < this.gridSize - 1 && this.grid[i + 1][j] === current) {
					this.gameOver = false
					return
				}
			}
		}

		this.gameOver = true
	}

	public drawCanvas(): Buffer {
		const ctx = this.canvas.getContext('2d')

		// Clear canvas
		ctx.fillStyle = '#faf8ef'
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

		// Draw title and score
		ctx.fillStyle = '#776e65'
		ctx.font = 'bold 32px Arial'
		ctx.textAlign = 'center'
		ctx.fillText('2048', this.canvas.width / 2, 35)

		ctx.font = 'bold 20px Arial'
		ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 65)

		// Draw grid background
		ctx.fillStyle = '#bbada0'
		ctx.fillRect(0, 80, this.canvasSize, this.canvasSize)

		// Draw tiles
		for (let i = 0; i < this.gridSize; i++) {
			for (let j = 0; j < this.gridSize; j++) {
				this.drawTile(ctx, i, j, this.grid[i][j])
			}
		}

		// Draw game status
		if (this.won && !this.gameOver) {
			ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
			ctx.fillRect(0, 80, this.canvasSize, this.canvasSize)
			ctx.fillStyle = '#f9f6f2'
			ctx.font = 'bold 48px Arial'
			ctx.textAlign = 'center'
			ctx.fillText('You Win!', this.canvasSize / 2, this.canvasSize / 2 + 100)
		} else if (this.gameOver) {
			ctx.fillStyle = 'rgba(238, 228, 218, 0.8)'
			ctx.fillRect(0, 80, this.canvasSize, this.canvasSize)
			ctx.fillStyle = '#776e65'
			ctx.font = 'bold 48px Arial'
			ctx.textAlign = 'center'
			ctx.fillText('Game Over!', this.canvasSize / 2, this.canvasSize / 2 + 100)
		}

		return this.canvas.toBuffer('image/png')
	}

	private drawTile(ctx: any, row: number, col: number, value: number) {
		const x = col * (this.tileSize + this.padding) + this.padding
		const y = row * (this.tileSize + this.padding) + this.padding + 80

		// Tile background
		if (value === 0) {
			ctx.fillStyle = '#cdc1b4'
		} else {
			ctx.fillStyle = this.getTileColor(value)
		}

		ctx.fillRect(x, y, this.tileSize, this.tileSize)

		// Tile text
		if (value > 0) {
			ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
			ctx.font = value < 100 ? 'bold 36px Arial' : value < 1000 ? 'bold 32px Arial' : 'bold 28px Arial'
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.fillText(value.toString(), x + this.tileSize / 2, y + this.tileSize / 2)
		}
	}

	private getTileColor(value: number): string {
		const colors: { [key: number]: string } = {
			2: '#eee4da',
			4: '#ede0c8',
			8: '#f2b179',
			16: '#f59563',
			32: '#f67c5f',
			64: '#f65e3b',
			128: '#edcf72',
			256: '#edcc61',
			512: '#edc850',
			1024: '#edc53f',
			2048: '#edc22e',
		}

		return colors[value] || '#3c3a32'
	}

	private async handleGameEnd(channel: TextChannel) {
		let rewardText = ''

		if (this.won) {
			rewardText = '🎉 Ihr habt 2048 erreicht! Glückwunsch!\n'
		} else {
			rewardText = '💀 Game Over! Keine weiteren Züge möglich.\n'
		}

		rewardText += `**Gesamt:** ${this.totalMoves} Züge, ${this.score} Punkte\n\n`

		this.rewards.forEach(({ moves, score }, player) => {
			if (!player) return

			let expGain = 0
			let goldGain = 0

			if (this.won) {
				// Win bonuses
				expGain = moves * 50 + Math.floor(score / 100)
				goldGain = moves * 10 + Math.floor(score / 200)
			} else {
				// Participation rewards
				expGain = moves * 20 + Math.floor(score / 200)
				goldGain = moves * 5 + Math.floor(score / 500)
			}

			player.addStats({ exp: expGain, gold: goldGain })
			rewardText += `${player.user}: ${moves} Züge! **+${expGain} EXP** & **+${goldGain} Gold** (jetzt ${player.experience}EXP, ${player.gold} Gold)\n`

			// Unlock achievements for high scores
			/* if (this.won) {
				player.unlockAchievement('puzzle_master', channel)
			}
			if (this.score >= 4096) {
				player.unlockAchievement('puzzle_legend', channel)
			} */
		})

		await channel.send(rewardText)

		// Reset the game and clear cache
		this.grid = []
		await this.clearGameCache()
	}

	private async sendGameBoard(channel: TextChannel) {
		const imageBuffer = this.drawCanvas()

		const embed = {
			title: '🎮 2048 Game',
			description: `**Score:** ${this.score}\n**Züge:** ${this.totalMoves}\n${this.won ? '🎉 **You Win!**' : this.gameOver ? '💀 **Game Over!**' : '🎯 **Keep playing!**'}`,
			image: {
				url: 'attachment://2048.png',
			},
			color: this.won ? 0x00ff00 : this.gameOver ? 0xff0000 : 0x0099ff,
			footer: {
				text: 'Commands: !2048 up/down/left/right | !2048 new',
			},
		}

		await channel.send({
			embeds: [embed],
			files: [
				{
					attachment: imageBuffer,
					name: '2048.png',
				},
			],
		})
	}

	getGameState(): GameState {
		return {
			grid: this.grid.map((row) => [...row]),
			score: this.score,
			gameOver: this.gameOver,
			won: this.won,
			canMove: this.canMove,
		}
	}
}

export default Game2048
