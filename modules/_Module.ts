import Log from '../util/log'

export default class Module {
	guildId: string
	constructor(guildId: string) {
		this.guildId = guildId
	}
	init() {}
	onMessage(params: MessageParams) {
		let parts = params.message.content.split(/\s+/)
		let command = parts[0]
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
