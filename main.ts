import {
	Events,
	CommandInteraction,
	TextChannel,
	ButtonInteraction,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
} from 'discord.js'
import dcClient from './discord'
import registerCommands from './registerCommands'
import commandHandler from './commands'
import guilds from './guilds'
import { callAllModules, callModules, getModule } from './modules'
import { refreshAccessToken } from './twitch'
import { loadGraphics } from './lib/casino/cards'
import './api'

await refreshAccessToken()
await loadGraphics()

guilds.forEach((guild) => {
	registerCommands(guild.id)
})

dcClient.once(Events.ClientReady, (readyClient) => {
	callAllModules('init')

	//getModule(guilds[0].id, 'DropGame').drop('980947899628273714', Drops.PRESENT)
	//messageDeleter.cleanUp(guilds[0])
	console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

dcClient.on(
	Events.InteractionCreate,
	async (interaction: ButtonInteraction | ChatInputCommandInteraction | AutocompleteInteraction) => {
		if (interaction.isAutocomplete()) {
			const params = getCommandParams(interaction)
			const focusedValue = interaction.options.getFocused()
			if (!commandHandler[interaction.commandName].automcomplete) return
			let options = await commandHandler[interaction.commandName].automcomplete({
				...params,
				value: focusedValue,
			})
			await interaction.respond(options)
		}
		if (interaction.isButton()) {
			const params = getCommandParams(interaction)
			callModules('onButton', interaction.guildId, params)
		}
		if (!interaction.isCommand()) return
		await interaction.deferReply()
		const commandName = interaction.commandName
		const params = getCommandParams(interaction)
		commandHandler[commandName].handler(params)
	}
)

dcClient.on(Events.MessageCreate, (message) => {
	if (message.author.bot) return
	const getGuildModule = <T extends Modules>(moduleName: T): ModuleType<T> => getModule(message.guildId, moduleName)
	const params = { message, getModule: getGuildModule }
	callModules('onMessage', message.guildId, params)
})

function getCommandParams<
	Interaction extends ButtonInteraction | ChatInputCommandInteraction | AutocompleteInteraction
>(interaction: Interaction) {
	const getGuildModule = <T extends Modules>(moduleName: T): ModuleType<T> =>
		getModule(interaction.guildId, moduleName)
	return { interaction, getModule: getGuildModule }
}

dcClient.login(process.env.BOT_TOKEN)
