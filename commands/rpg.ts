import { EmbedBuilder } from 'discord.js'
import game from '../Game'

export async function addPlayer({ interaction }: CommandParams) {
	let success = game.addPlayer(interaction.user.id)
	if (!success) return await interaction.editReply('Du bist bereits als Spieler hinzugefügt!')
	await interaction.editReply('Du wurdest als Spieler hinzugefügt!')
}

export async function showStats({ interaction }: CommandParams) {
	let player = game.players.find((player) => player.userId === interaction.user.id)
	if (!player) return await interaction.editReply('Du bist noch nicht als Spieler hinzugefügt!')
	const embed = new EmbedBuilder()
		.setTitle(`${interaction.user['displayName']}'s Stats`)
		.setImage(interaction.user.avatarURL())
		.setDescription('Hier sind deine Statistiken')
		.setColor(0x0099ff)
		.setTimestamp()
		.addFields(
			{ name: 'Level', value: String(player.level), inline: true },
			{ name: 'Health', value: `${player.health}/${player.maxHealth}`, inline: true },
			{ name: 'Attack', value: String(player.attack), inline: true },
			{ name: 'Defense', value: String(player.defense), inline: true },
			{ name: 'EXP', value: String(player.experience), inline: true },
			{ name: 'Gold', value: String(player.gold), inline: true }
		)
	await interaction.editReply({ embeds: [embed] })
}
