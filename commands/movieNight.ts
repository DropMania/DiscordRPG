import { getGuild } from '../guilds.js'

export async function addMovie({ interaction, getModule }: CommandParams) {
	let movieNight = getModule('MovieNight')
	let title = interaction.options.get('title')?.value as string
	let result = await movieNight.addMovie(title, interaction.user)
	await interaction.editReply(result.text)
}

export async function listMovies({ interaction, getModule }: CommandParams) {
	let movieNight = getModule('MovieNight')
	let list = movieNight.listMovies()
	if (list.length === 0) {
		return await interaction.editReply('Die Liste ist leer.')
	}
	let formatted = list.map((item, i) => `${i + 1}. **${item.title}** (<@${item.userId}>)`).join('\n')
	await interaction.editReply({ content: `🎬 **Movie Night Liste:**\n${formatted}`, allowedMentions: { users: [] } })
}

export async function pickMovie({ interaction, getModule }: CommandParams) {
	let movieNight = getModule('MovieNight')
	let picked = movieNight.pickRandomMovie()
	let role = interaction.guild?.roles.cache.find((r) => r.id === getGuild(interaction.guildId!)?.movieNightRole)
	if (!picked) {
		return await interaction.editReply('Die Liste ist leer.')
	}
	await interaction.editReply({
		content: `${role ? `<@&${role.id}> ` : ''} 🎬 Wir schauen: **${picked.title}** (vorgeschlagen von <@${picked.userId}>)`,
		allowedMentions: { users: [] },
	})
	await movieNight.clearList()
}
