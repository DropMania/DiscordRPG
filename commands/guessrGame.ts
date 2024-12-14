import { Command, GuessrDifficulty, GuessrType } from '../enums'

export async function pickItem({ interaction, getModule }: CommandParams) {
	const guessrGame = getModule('GuessrGame')
	let typName = interaction.options.get('typ', true).value as GuessrType
	let difficulty = interaction.options.get('difficulty')?.value as GuessrDifficulty
	difficulty = difficulty || GuessrDifficulty.MEDIUM
	await guessrGame.pickItem(typName, difficulty)
	let image = guessrGame.getImage()
	if (!image) return await interaction.editReply('Es ist ein Fehler aufgetreten!')
	const content = `Rate den ${guessrGame.type}! *Schwierigkeit: **${difficulty}** *
Mit **/${Command.GUESSR_GUESS}** kannst du den ${guessrGame.type} raten.
Mit **/${Command.GUESSR_NEW_IMAGE}** kannst du ein neues Bild anfordern.
Mit **/${Command.GUESSR_HINT}** kannst du einen Hinweis anfordern.
Mit **/${Command.GUESSR_GIVE_UP}** kannst du aufgeben.`
	await interaction.editReply({ content, files: [image] })
}

export async function newImage({ interaction, getModule }: CommandParams) {
	const guessrGame = getModule('GuessrGame')
	if (!guessrGame.item) return await interaction.editReply(`Es wurde noch kein ${guessrGame.type} ausgewählt!`)
	let image = guessrGame.getImage()
	if (!image) return await interaction.editReply('Es gibt keine weiteren Bilder!')
	await interaction.editReply({ files: [image] })
}

export async function newHint({ interaction, getModule }: CommandParams) {
	const guessrGame = getModule('GuessrGame')
	if (!guessrGame.item) return await interaction.editReply(`Es wurde noch kein ${guessrGame.type} ausgewählt!`)
	let hint = guessrGame.getHint()
	if (!hint) return await interaction.editReply('Es gibt keine weiteren Hinweise!')
	await interaction.editReply(hint)
}

export async function guessItem({ interaction, getModule, player }: CommandParams) {
	const guessrGame = getModule('GuessrGame')
	if (!guessrGame.item) return await interaction.editReply(`Es wurde noch kein ${guessrGame.type} ausgewählt!`)
	let guess = interaction.options.get('guess', true).value as string
	let correct = guessrGame.guessItem(guess)
	if (!correct) return await interaction.editReply(`❌ **${guess}** ist leider nicht korrekt!`)
	let item = guessrGame.getItem()
	await interaction.editReply({
		content: `✅ **${guess}** ist korrekt! Der gesuchte ${guessrGame.type} war: **${item.names[0]}**`,
		files: [item.cover || 'https://via.placeholder.com/150.png'],
	})
	const difficultyExp = {
		[GuessrDifficulty.VERY_EASY]: 10,
		[GuessrDifficulty.EASY]: 20,
		[GuessrDifficulty.MEDIUM]: 30,
		[GuessrDifficulty.HARD]: 40,
		[GuessrDifficulty.VERY_HARD]: 50,
		[GuessrDifficulty.IMPOSSIBLE]: 75,
		[GuessrDifficulty.TERMINSENDUNG]: 100,
	}
	player?.giveExperience(difficultyExp[guessrGame.difficulty], interaction.channel)
}

export async function showItem({ interaction, getModule }: CommandParams) {
	const guessrGame = getModule('GuessrGame')
	if (!guessrGame.item) return await interaction.editReply(`Es wurde noch kein ${guessrGame.type} ausgewählt!`)
	let item = guessrGame.getItem()
	await interaction.editReply({
		content: `Der gesuchte ${guessrGame.type} war: **${item.names[0]}**`,
		files: [item.cover || 'https://via.placeholder.com/150.png'],
	})
	guessrGame.item = null
}
