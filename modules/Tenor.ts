import { searchGifsTenor } from '../util/fetchData.js'
import Module from './_Module.js'
const BASE_URL = ''
export default class Tenor extends Module {
	constructor(guildId: string) {
		super(guildId)
	}
	init() {}
	async onMessageCommand(command: string, args: string, params: MessageParams) {
		if (!['gif', 'balls'].includes(command)) return
		if (command === 'balls') args = `balls ${args}`
		let gif = await this.getGif(args)
		if (!gif) {
			await params.message.channel.send({ content: `Kein GIF gefunden für "${args}"` })
			return
		}
		await params.message.channel.send({ content: gif.media_formats.gif.url })
	}
	async getGif(query: string) {
		let result = await searchGifsTenor(query)
		if (!result || result.results.length === 0) return null
		const gif = result.results[0]
		return gif
	}
}
