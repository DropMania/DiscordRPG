import Log from '../util/log'
import { getGuild } from '../guilds'

export default class Module {
	guildId: string
	guildConfig: GuildConfig
	constructor(guildId: string) {
		this.guildId = guildId
		this.guildConfig = getGuild(guildId)
	}
	init() {}
	onMessage(params: MessageParams) {
		let parts = params.message.content.split(/\s+/)
		let command = parts[0].toLowerCase()
		let args = parts.slice(1).join(' ')
		if (command.startsWith('!')) {
			this.onMessageCommand(command.slice(1), args, params)
		}
	}
	onMessageCommand(command: string, args: string, params: MessageParams) {}
	onButton(params: ButtonParams) {
		let id = params.interaction.customId
		this.onButtonPress(id, params)
	}
	onButtonPress(id: string, params: ButtonParams) {}
}
