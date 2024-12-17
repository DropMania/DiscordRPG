import { Events, CommandInteraction, TextChannel, ButtonInteraction } from 'discord.js'
import dcClient from './discord'
import registerCommands from './registerCommands'
import commandHandler from './commands'
import guilds from './guilds'
import { callAllModules, callModules, getModule } from './modules'
import { refreshAccessToken } from './twitch'
import game from './Game'
import messageDeleter from './messageDeleter'

await refreshAccessToken()

guilds.forEach((guildId) => {
	registerCommands(guildId)
})

dcClient.once(Events.ClientReady, (readyClient) => {
	callAllModules('init')

	const testChannel = dcClient.channels.cache.get('1084937706045444197') as TextChannel
	//@ts-ignore
	getModule(guilds[0], 'DropGame').drop(testChannel.id, 'Rat')

	//messageDeleter.cleanUp(guilds[0])
	console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

dcClient.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isButton()) {
		const params = getCommandParams(interaction)
		callModules('onButton', interaction.guildId, params)
	}
	if (!interaction.isCommand()) return
	await interaction.deferReply()
	const commandName = interaction.commandName
	const params = getCommandParams(interaction)
	commandHandler[commandName].handler(params)
})

dcClient.on(Events.MessageCreate, (message) => {
	if (message.author.bot) return
	const getGuildModule = <T extends Modules>(moduleName: T): ModuleType<T> => getModule(message.guildId, moduleName)
	let player = game.getPlayer(message.author.id)
	const params = { message, getModule: getGuildModule, player }
	callModules('onMessage', message.guildId, params)
})

function getCommandParams<Interaction extends ButtonInteraction | CommandInteraction>(interaction: Interaction) {
	const getGuildModule = <T extends Modules>(moduleName: T): ModuleType<T> =>
		getModule(interaction.guildId, moduleName)
	const player = game.getPlayer(interaction.user.id)
	return { interaction, getModule: getGuildModule, player }
}

dcClient.login(process.env.BOT_TOKEN)
