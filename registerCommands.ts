import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import commandHandler from './commands.js'

const commands = Object.entries(commandHandler).map(([name, cmd]) => {
	const { description, options, permission } = cmd as {
		description: string
		options?: (b: SlashCommandBuilder) => void
		permission?: bigint
	}
	let builder = new SlashCommandBuilder().setName(name).setDescription(description)
	if (options) options(builder)
	if (permission) builder.setDefaultMemberPermissions(permission)
	return builder
})
const rest = new REST().setToken(process.env.BOT_TOKEN!)

export default async function registerCommands(guildId: string) {
	try {
		console.log(`Started refreshing application (/) commands. ${guildId}`)

		await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId), { body: commands })

		console.log(`Successfully reloaded application (/) commands. ${guildId}`)
	} catch (error) {
		console.error(error)
	}
}
