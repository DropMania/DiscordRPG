import Player from './Player'

class Game {
	name: string = ''
	players: Player[] = []
	constructor(public guildId: string, data?: any) {
		if (data) this.initCacheData(data)
	}
	initCacheData(data: any) {
		Object.entries(data).forEach(([key, value]) => {
			if (key === 'players' && Array.isArray(value)) {
				this.players = value.map((playerData: any) => new Player(playerData.userId, playerData))
			} else if (key in this) {
				;(this as any)[key] = value
			}
		})
	}

	getCacheObject() {
		return {
			guildId: this.guildId,
			name: this.name,
			players: this.players.map((player) => player.getCacheObject()),
		}
	}

	addPlayer(userId: string, name?: string) {
		if (!this.players.find((p) => p.userId === userId)) {
			const player = new Player(userId, { name })
			this.players.push(player)
		}
	}

	getPlayer(userId: string) {
		return this.players.find((p) => p.userId === userId)
	}
}

export default Game
