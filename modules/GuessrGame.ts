import { GuessrDifficulty, GuessrType } from '../enums'
import { similarity } from '../util/similarity'
import getTMDB from '../lib/guessrGameData/getTMDB'
import getGame from '../lib/guessrGameData/getGame'
import Module from './_Module'
import { GuessrGameItem } from '../types/varTypes'
import Log from '../util/log'
import getSong from '../lib/guessrGameData/getSong'
import redisClient from '../redis'

const getData = {
	[GuessrType.MOVIE]: getTMDB,
	[GuessrType.SHOW]: getTMDB,
	[GuessrType.ACTOR]: getTMDB,
	[GuessrType.GAME]: getGame,
	[GuessrType.SONG]: getSong,
	//[GuessrType.GAME_SONG]: getSong,
}
type CacheType = {
	item: GuessrGameItem
	type: GuessrType
	difficulty: GuessrDifficulty
}

export default class GuessrGame extends Module {
	item: GuessrGameItem | null = null
	type: GuessrType | null = null
	difficulty: GuessrDifficulty | null = null
	constructor(guildId: string) {
		super(guildId)
	}
	async init() {
		let chachedItem = await redisClient.getCache<CacheType>(`${this.guildId}:guessrItem`)
		if (chachedItem) {
			this.item = chachedItem.item
			this.type = chachedItem.type
			this.difficulty = chachedItem.difficulty
		}
	}

	async pickItem(type: GuessrType, difficulty: GuessrDifficulty, filter: string) {
		this.item = await getData[type](type, difficulty, filter)
		Log.info('GuessrGame', 'pickItem', this.item)
		this.difficulty = difficulty
		this.type = type
		await redisClient.setCache<CacheType>(`${this.guildId}:guessrItem`, { item: this.item, type, difficulty })
	}

	getImage() {
		if (this.item.images.length === 0) return null
		let randomIndex = Math.floor(Math.random() * this.item.images.length)
		let image = this.item.images.splice(randomIndex, 1)[0]
		return image
	}
	getHint() {
		if (this.item.hints.length === 0) return null
		let randomIndex = Math.floor(Math.random() * this.item.hints.length)
		let hint = this.item.hints.splice(randomIndex, 1)[0]
		return hint
	}

	guessItem(name: string) {
		let correct = this.item.names.some((itemName) => similarity(name, itemName) > 0.5)
		let bonus = this.item.names.some((itemName) => similarity(name, itemName) > 0.95)
		return { correct, bonus }
	}

	getItem() {
		return this.item
	}
}
