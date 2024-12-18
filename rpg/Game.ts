import Player from './Player'
import redisClient from '../redis'

class Game {
	players: Player[] = []
	constructor() {
		console.log('Game started!')
		redisClient.getPlayers().then((playerKeys) => {
			playerKeys.forEach(async (playerKey) => {
				let player = await redisClient.client.get(playerKey)
				this.players.push(new Player(JSON.parse(player)))
			})
		})
	}

	addPlayer(userId: string) {
		if (this.players.find((player) => player.userId === userId)) return false
		let config = {
			userId: userId,
			health: 100,
			maxHealth: 100,
			attack: 10,
			defense: 5,
			level: 1,
			experience: 0,
			gold: 0,
			items: [],
		}
		const player = new Player(config)
		this.players.push(player)
		redisClient.setPlayer(config.userId, player)
		return true
	}

	getPlayer(userId: string) {
		return this.players.find((player) => player.userId === userId)
	}
}
const game = new Game()
export default game
