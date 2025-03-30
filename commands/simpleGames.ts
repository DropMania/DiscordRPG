import { sleep } from '../util/misc'

export async function hangman({ interaction, getModule }: CommandParams) {
	let hangman = getModule('Hangman')
	hangman.pickWord()
	await interaction.editReply(
		'Neues Spiel Hangman gestartet! \nSchreibe z.B. `!w A` um den Buchstaben A zu raten. \nSchreibe `!w Wort` um das Wort zu raten'
	)
	await interaction.followUp(hangman.display())
}
export async function battleships({ interaction, getModule }: CommandParams) {
	let battleships = getModule('Battleships')
	battleships.startGame()
	await interaction.editReply(
		`Neues Spiel Schiffe versenken gestartet! Screibe \`!bomb a,1\` um zu Bomben!\n${battleships.showBoard()}`
	)
}

export async function picross({ interaction, getModule }: CommandParams) {
	let picross = getModule('Picross')
	let dim = interaction.options.get('dim')?.value as number
	if (dim < 5 || dim > 15) return await interaction.editReply('Dimension muss zwischen 5 und 15 liegen!')
	picross.startGame(dim)
	await interaction.editReply({
		content: `Neues Spiel Picross gestartet! Schreibe \`!pic a,1\` um das Feld A,1 zu füllen!`,
		files: [{ attachment: picross.renderBoard(), name: 'picross.png' }],
	})
}

export async function minesweeper({ interaction, getModule }: CommandParams) {
	let minesweeper = getModule('Minesweeper')
	let difficulty = (interaction.options.get('difficulty')?.value as string) ?? 'medium'
	minesweeper.startGame(difficulty)
	await interaction.editReply({
		content: `Neues Spiel Minesweeper gestartet! Schreibe \`!dig a,1\` um das Feld A,1 aufzudecken!\nSchwierigkeit: **${difficulty}**`,
		files: [{ attachment: minesweeper.renderBoard(), name: 'minesweeper.png' }],
	})
}

export async function slotMachine({ interaction, getModule, player }: CommandParams) {
	let bet = interaction.options.get('bet')?.value as number
	if (bet < 1) return await interaction.editReply('Der Einsatz muss mindestens 1 sein!')
	if (bet > player.gold) return await interaction.editReply('Du hast nicht genug Gold!')
	if (bet > 1000) return await interaction.editReply('Der Einsatz darf maximal 1000 sein!')
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
