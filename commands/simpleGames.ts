import { sleep } from '../util/misc.js'

export async function hangman({ interaction, getModule }: CommandParams) {
	let hangman = getModule('Hangman')
	hangman.pickWord()
	await interaction.editReply(
		'Neues Spiel Hangman gestartet! \nSchreibe z.B. `!w A` um den Buchstaben A zu raten. \nSchreibe `!w Wort` um das Wort zu raten',
	)
	await interaction.followUp(hangman.display())
}
export async function battleships({ interaction, getModule }: CommandParams) {
	let battleships = getModule('Battleships')
	battleships.startGame()
	await interaction.editReply(
		`Neues Spiel Schiffe versenken gestartet! Screibe \`!bomb a,1\` um zu Bomben!\n${battleships.showBoard()}`,
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

export async function game2048({ interaction, getModule }: CommandParams) {
	let game2048 = getModule('Game2048')
	game2048.newGame()
	await interaction.editReply({
		content: `Neues 2048 Spiel gestartet! Benutze \`!2048 up/down/left/right\` um zu spielen!\n**Wichtig:** Nur ein Zug pro Person hintereinander erlaubt!`,
		embeds: [
			{
				title: '🎮 2048 Game',
				description: `**Score:** ${game2048.getGameState().score}\n**Züge:** 0\n🎯 **Erreiche 2048!**`,
				image: {
					url: 'attachment://2048.png',
				},
				color: 0x0099ff,
				footer: {
					text: 'Commands: !2048 up/down/left/right | !2048 new',
				},
			},
		],
		files: [{ attachment: game2048.drawCanvas(), name: '2048.png' }],
	})
}
