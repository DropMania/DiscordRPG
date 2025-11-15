import rpgApi from '../lib/RPG/api'

export async function createGame({ interaction, getModule }: CommandParams) {
	await rpgApi.createGame(interaction.guildId!, interaction.guild?.name)
	return await interaction.editReply('RPG Spiel wurde erstellt!')
}

export async function addPlayer({ interaction, getModule }: CommandParams) {
	await rpgApi.addPlayerToGame(interaction.guildId!, interaction.user.id, interaction.user.displayName)
	return await interaction.editReply('Du wurdest dem RPG Spiel hinzugefügt!')
}
