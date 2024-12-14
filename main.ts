import { Events, CommandInteraction, TextChannel, ButtonInteraction } from 'discord.js'
import dcClient from './discord'
import registerCommands from './registerCommands'
import commandHandler from './commands'
import guilds from './guilds'
import { callModules, getModule } from './modules'
import { refreshAccessToken } from './twitch'
import game from './Game'

await refreshAccessToken()

guilds.forEach((guildId) => {
	registerCommands(guildId)
})

dcClient.once(Events.ClientReady, (readyClient) => {
	guilds.forEach((guildId) => {
		callModules('init', guildId)
	})
	let dropper = getModule('980947206863470622', 'DropGame')
	//@ts-ignore
	dropper.drop('1084937706045444197', 'Rat')
	/* const testChannel = dcClient.channels.cache.get('1084937706045444197') as TextChannel
	if (testChannel) {
		testChannel.send({
			files: ['https://p.scdn.co/mp3-preview/de49789586cd99aa0cd341283289e86f436c5f30.mp3'],
		})
	} */
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
