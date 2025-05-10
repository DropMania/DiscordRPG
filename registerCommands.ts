import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import commandHandler from './commands'

const commands = Object.entries(commandHandler).map(([name, { description, options, permission }]) => {
	let builder = new SlashCommandBuilder().setName(name).setDescription(description)
	if (options) options(builder)
	if (permission) builder.setDefaultMemberPermissions(permission)
	return builder
})
const rest = new REST().setToken(process.env.BOT_TOKEN)

export default async function registerCommands(guildId: string) {
	try {
		console.log(`Started refreshing application (/) commands. ${guildId}`)

		await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: commands })

		console.log(`Successfully reloaded application (/) commands. ${guildId}`)
	} catch (error) {
		console.error(error)
	}
}
