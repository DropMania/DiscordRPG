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
	picross.startGame(5)
	await interaction.editReply({
		content: `Neues Spiel Picross gestartet! Schreibe \`!pic a,1\` um das Feld A,1 zu füllen!`,
		files: [{ attachment: picross.renderBoard(), name: 'picross.png' }],
	})
}
