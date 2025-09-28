import { TextChannel } from 'discord.js'
import { sleep } from '../util/misc'

export async function slotMachine({ interaction, getModule, player }: CommandParams) {
	let bet = interaction.options.get('bet')?.value as number
	if (bet < 1) return await interaction.editReply('Der Einsatz muss mindestens 1 sein!')
	if (bet > player.gold) return await interaction.editReply('Du hast nicht genug Gold!')
	//if (bet > 1000) return await interaction.editReply('Der Einsatz darf maximal 1000 sein!')
	await interaction.editReply(
		`${interaction.user} Neues Spiel Slot Machine gestartet! Einsatz: **${bet}** Gold! (Aktuell: ${player.gold})`
	)
	await player.addStats({ gold: -bet })
	let followup = await interaction.followUp({
		content: 'Die Slot Machine dreht sich...',
	})
	await sleep(5000)
	let slotMachine = getModule('SlotMachine')
	let result = slotMachine.spin()
	let reward = slotMachine.calculateWinnings(result, bet)
	await player.addStats({ gold: reward })
	let resultText = result.map((r) => `${r.display}`).join(' | ')
	await followup.edit({
		content: `${interaction.user} Die Slot Machine hat gedreht!\n# Ergebnis: ${resultText}\nEinsatz: **${bet}** Gold\nBelohnung: **${reward}** Gold!\n# Neuer Kontostand: ${player.gold} Gold`,
	})
}

export async function blackjack({ interaction, getModule, player }: CommandParams) {
	let blackjack = getModule('Blackjack')
	blackjack.createGame(interaction.channel as TextChannel)
	await interaction.editReply(
		`${interaction.user} Neues Spiel Blackjack gestartet! \nSchreibe z.B. \`!bj 100\` um mit 100 Gold einzusteigen.
\nSchreibe \`!start-bj\` um das Spiel zu starten!`
	)
}
