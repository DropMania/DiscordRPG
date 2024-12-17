import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import commandHandler from './commands'

const commands = Object.entries(commandHandler).map(([name, { description, options }]) => {
	let builder = new SlashCommandBuilder().setName(name).setDescription(description)
	if (options) options(builder)
	return builder
})
const rest = new REST().setToken(process.env.BOT_TOKEN)

export default async function registerCommands(guildId: string) {
	try {
		console.log('Started refreshing application (/) commands.')

		await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands })

		console.log('Successfully reloaded application (/) commands.')
	} catch (error) {
		console.error(error)
	}
}