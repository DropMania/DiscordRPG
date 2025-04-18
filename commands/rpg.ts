import { EmbedBuilder } from 'discord.js'
import game from '../rpg/Game'
import { drawAchievements } from '../rpg/Achievements'

export async function addPlayer({ interaction }: CommandParams) {
	let success = game.addPlayer(interaction.user.id)
	if (!success) return await interaction.editReply('Du bist bereits als Spieler hinzugefügt!')
	await interaction.editReply('Du wurdest als Spieler hinzugefügt!')
}

export async function showStats({ interaction, player }: CommandParams) {
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

export async function showItems({ interaction, player }: CommandParams) {
	if (!player) return await interaction.editReply('Du bist noch nicht als Spieler hinzugefügt!')
	const embed = new EmbedBuilder()
		.setTitle(`${interaction.user['displayName']}'s Items`)
		.setImage(interaction.user.avatarURL())
		.setDescription('Hier sind deine Items')
		.setColor(0x0099ff)
		.setTimestamp()

	if (player.items.length === 0) {
		embed.addFields({ name: 'Items', value: 'Du hast keine Items' })
	} else {
		player.items.forEach((item, i) => {
			embed.addFields({ name: `${i + 1}. ${item.name}`, value: item.description })
		})
	}
	await interaction.editReply({ embeds: [embed] })
}

export async function useItem({ interaction, player }: CommandParams) {
	if (!player) return await interaction.editReply('Du bist noch nicht als Spieler hinzugefügt!')

	let itemIdx = interaction.options.get('benutze', true).value as number
	let item = player.items[itemIdx - 1]
	if (!item) return await interaction.editReply('Dieses Item existiert nicht!')
	await player.useItem(itemIdx - 1, interaction.channel)
	await interaction.deleteReply()
}

export async function showAchievements({ interaction, player }: CommandParams) {
	if (!player) return await interaction.editReply('Du bist noch nicht als Spieler hinzugefügt!')
	var embed = drawAchievements(player)
	if (!embed) return await interaction.editReply('Du hast noch keine Erfolge!')
	await interaction.editReply({ embeds: [embed] })
}

export async function giveMoney({ interaction, player }: CommandParams) {
	if (!player) return await interaction.editReply('Du bist noch nicht als Spieler hinzugefügt!')
	let user = interaction.options.get('user', true).user
	if (!user) return await interaction.editReply('Dieser Spieler existiert nicht!')
	let amount = interaction.options.get('amount', true).value as number
	if (user.id === interaction.user.id) return await interaction.editReply('Du kannst dir kein Geld geben!')
	if (amount <= 0) return await interaction.editReply('Du kannst nur Geld geben, wenn es mehr als 0 ist!')
	if (player.gold < amount) return await interaction.editReply('Du hast nicht genug Geld!')
	let targetPlayer = game.getPlayer(user.id)
	if (!targetPlayer) return await interaction.editReply('Dieser Spieler existiert nicht!')
	await player.addStats({ gold: -amount })
	await targetPlayer.addStats({ gold: amount })
	await interaction.editReply(
		`${interaction.user} hast ${user} **${amount}** Gold gegeben!\n-# ${user} hat jetzt **${targetPlayer.gold}** Gold!\n-# ${interaction.user} hat jetzt **${player.gold}** Gold!`
	)
}
