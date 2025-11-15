import Game from './Game'
import redisClient from '../../redis'

class RpgApi {
	games: Game[] = []
	prefix = 'rpg_new'
	constructor() {
		this.createGamesFromCache()
	}
	private async syncGameToCache(game: Game) {
		await redisClient.set(`${this.prefix}:${game.guildId}`, game.getCacheObject())
	}
	private async createGamesFromCache() {
		let cachedGames = await redisClient.getAllKeys(`${this.prefix}:*`)
		for (let key of cachedGames) {
			let guildId = key.split(':')[1]
			let gameData = await redisClient.get<any>(key)
			let game = new Game(guildId, gameData)
			this.games.push(game)
		}
	}

	public async createGame(guildId: string, name?: string): Promise<Game> {
		if (this.games.find((g) => g.guildId === guildId)) {
			return this.games.find((g) => g.guildId === guildId)!
		}
		let game = new Game(guildId, { name })
		this.games.push(game)
		await this.syncGameToCache(game)
		return game
	}

	public async addPlayerToGame(guildId: string, userId: string, name?: string) {
		let game = this.games.find((g) => g.guildId === guildId)
		if (!game) {
			game = await this.createGame(guildId)
		}
		game.addPlayer(userId, name)
		await this.syncGameToCache(game)
	}
}

const rpgApi = new RpgApi()
export default rpgApi
