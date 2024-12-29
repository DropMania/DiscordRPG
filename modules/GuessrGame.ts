import { GuessrDifficulty, GuessrType } from '../enums'
import { similarity } from '../util/similarity'
import getTMDB from '../lib/guessrGameData/getTMDB'
import getGame from '../lib/guessrGameData/getGame'
import Module from './_Module'
import { GuessrGameItem } from '../types/varTypes'
import Log from '../util/log'
import getSong from '../lib/guessrGameData/getSong'

const getData = {
	[GuessrType.MOVIE]: getTMDB,
	[GuessrType.SHOW]: getTMDB,
	[GuessrType.GAME]: getGame,
	[GuessrType.SONG]: getSong,
	[GuessrType.GAME_SONG]: getSong,
}

export default class GuessrGame extends Module {
	item: GuessrGameItem | null = null
	type: GuessrType | null = null
	difficulty: GuessrDifficulty | null = null
	constructor(guildId: string) {
		super(guildId)
	}

	async pickItem(type: GuessrType, difficulty: GuessrDifficulty) {
		this.item = await getData[type](type, difficulty)
		Log.info('GuessrGame', 'pickItem', this.item)
		this.difficulty = difficulty
		this.type = type
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
		return this.item.names.some((itemName) => similarity(name, itemName) > 0.5)
	}

	getItem() {
		return this.item
	}
}
