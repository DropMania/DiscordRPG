import {
	Events,
	CommandInteraction,
	TextChannel,
	ButtonInteraction,
	AutocompleteInteraction,
	Client,
	Interaction,
	Message,
} from 'discord.js'
import dcClient from './discord.js'
import registerCommands from './registerCommands.js'
import commandHandler from './commands.js'
import guilds from './guilds.js'
import { callAllModules, callModules, getModule } from './modules.js'
import { refreshAccessToken } from './twitch.js'
import game from './rpg/Game.js'
import messageDeleter from './messageDeleter.js'
import { Drops } from './enums.js'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { loadGraphics } from './lib/casino/cards.js'
import ai from './util/ai.js'

await refreshAccessToken()
await loadGraphics()

guilds.forEach((guild: GuildConfig) => {
	registerCommands(guild.id)
})

dcClient.once(Events.ClientReady, (readyClient: Client<true>) => {
	callAllModules('init')

	//getModule(guilds[0].id, 'DropGame').drop('980947899628273714', Drops.PRESENT)
	//messageDeleter.cleanUp(guilds[0])
	console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

dcClient.on(Events.InteractionCreate, async (interaction: Interaction) => {
	if (interaction.isAutocomplete()) {
		const params = getCommandParams(interaction)
		const focusedValue = interaction.options.getFocused()
		let options = await commandHandler[interaction.commandName].automcomplete?.({ ...params, value: focusedValue })
		if (options) await interaction.respond(options)
	}
	if (interaction.isButton()) {
		const params = getCommandParams(interaction)
		callModules('onButton', interaction.guildId!, params)
	}
	if (!interaction.isCommand()) return
	await interaction.deferReply()
	const commandName = interaction.commandName
	const params = getCommandParams(interaction)
	commandHandler[commandName].handler(params as unknown as CommandParams)
})

dcClient.on(Events.MessageCreate, (message: Message) => {
	if (message.author.bot) return
	const getGuildModule = <T extends Modules>(moduleName: T): ModuleType<T> => getModule(message.guildId!, moduleName)
	let player = game.getPlayer(message.author.id)
	const params = { message, getModule: getGuildModule, player }
	callModules('onMessage', message.guildId!, params)
})

function getCommandParams<Interaction extends ButtonInteraction | CommandInteraction | AutocompleteInteraction>(
	interaction: Interaction,
) {
	const getGuildModule = <T extends Modules>(moduleName: T): ModuleType<T> =>
		getModule(interaction.guildId!, moduleName)
	const player = game.getPlayer(interaction.user.id)
	return { interaction, getModule: getGuildModule, player }
}

dcClient.login(process.env.BOT_TOKEN)

const rl = readline.createInterface({ input: stdin, output: stdout })

rl.on('line', (input) => {
	let [command, ...args] = input.split(' ')
	if (command === 'exit') {
		process.exit(0)
	}
	if (command === 'drop') {
		let [channelId, ...dropName] = args
		getModule(guilds[0].id, 'DropGame').drop(channelId, dropName.join(' ') as Drops)
	}
})
