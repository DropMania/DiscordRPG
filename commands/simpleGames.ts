export async function hangman({ interaction, getModule }: CommandParams) {
	let hangman = getModule('Hangman')
	hangman.pickWord()
	await interaction.editReply(
		'Neues Spiel Hangman gestartet! \nSchreibe z.B. `!w A` um den Buchstaben A zu raten. \nSchreibe `!w Wort` um das Wort zu raten'
	)
	await interaction.followUp(hangman.display())
}
