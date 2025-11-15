import { get7TVEmote } from '../util/fetchData'
import Log from '../util/log'

export async function addEmote({ interaction, getModule }: CommandParams) {
	const emote = interaction.options.get('emote')?.value as string
	const name = interaction.options.get('name')?.value as string
	if (!emote) return await interaction.editReply('Bitte gib einen 7TV Emote Link an!')
	if (emote.match(/https:\/\/7tv\.app\/emotes\/[a-zA-Z0-9]{24}/) === null)
		return await interaction.editReply('Bitte gib einen gültigen 7TV Emote Link an!')
	const emoteId = emote.split('/').pop()
	if (!emoteId) return await interaction.editReply('Bitte gib einen 7TV Emote Link an!')
	const emoteData = await get7TVEmote(emoteId)
	if (!emoteData) return await interaction.editReply('Bitte gib einen gültigen 7TV Emote Link an!')
	const emoteName = name || emoteData.name
	const maxSize = 256000 // 256kb
	let sizeName = '4x.png'
	if (emoteData.animated) {
		let filteredEmotes = emoteData.host.files.filter((f) => f.format === 'GIF')
		filteredEmotes = filteredEmotes.sort((a, b) => b.size - a.size)
		const fitEmote = filteredEmotes.find((f) => f.size < maxSize)
		if (!fitEmote) return await interaction.editReply('Der Emote ist zu groß!')
		sizeName = fitEmote.name
	} else {
		let filteredEmotes = emoteData.host.files.filter((f) => f.format === 'PNG')
		filteredEmotes = filteredEmotes.sort((a, b) => b.size - a.size)
		const fitEmote = filteredEmotes.find((f) => f.size < maxSize)
		if (!fitEmote) return await interaction.editReply('Der Emote ist zu groß!')
		sizeName = fitEmote.name
	}
	Log.info(
		`Adding emote ${emoteName} (${emoteId}) to guild ${interaction.guild.name} (${
			interaction.guild.id
		}) with size ${sizeName} (${emoteData.host.files.find((f) => f.name === sizeName)?.size})`
	)
	const emoteUrl = `https://cdn.7tv.app/emote/${emoteId}/${sizeName}`
	const newEmote = await interaction.guild.emojis.create({
		name: emoteName,
		attachment: emoteUrl,
	})
	await interaction.editReply(`${interaction.user} Emote ${newEmote} (${emoteName}) wurde erfolgreich hinzugefügt!`)
}
