import { Command, GuessrDifficulty, GuessrType } from '../enums'
import redisClient from '../redis'

export async function pickItem({ interaction, getModule }: CommandParams) {
	const guessrGame = getModule('GuessrGame')
	let typName = interaction.options.get('typ', true).value as GuessrType
	let difficulty = interaction.options.get('difficulty')?.value as GuessrDifficulty
	difficulty = difficulty || GuessrDifficulty.MEDIUM
	await guessrGame.pickItem(typName, difficulty)
	let image = guessrGame.getImage()
	if (!image) return await interaction.editReply('Es ist ein Fehler aufgetreten!')
	const content = `Rate den **${guessrGame.type}**! *Schwierigkeit: **${difficulty}** *
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
	let result = guessrGame.guessItem(guess)
	if (!result.correct) {
		await player?.addStats({ health: -1 })
		return await interaction.editReply(
			`❌ **${guess}** ist leider nicht korrekt!\nDu hast einen **-1** Lebenspunkt verloren! (${player?.health}/${player?.maxHealth})`
		)
	}
	let item = guessrGame.getItem()
	let content = `✅ **${guess}** ist korrekt! Der gesuchte ${guessrGame.type} war: **${item.names[0]}**`
	let bonus = 1
	if (result.bonus) {
		content = `${content}\n🎉 Du hast den exakten Titel gewusst! **+10% Bonus EXP!**`
		bonus = 1.1
	}
	let files = [item.cover || 'https://via.placeholder.com/150.png']
	if (!item.cover.endsWith('.png') && !item.cover.endsWith('.jpg')) {
		files = []
		content = `${content}\n${item.cover}`
	}
	await interaction.editReply({
		content,
		files,
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
	guessrGame.item = null
	let exp = Math.floor(difficultyExp[guessrGame.difficulty] * bonus)
	await player?.addStats({ exp }, interaction.channel)
	await redisClient.deleteCache(`${guessrGame.guildId}:guessrItem`)
}

export async function showItem({ interaction, getModule }: CommandParams) {
	const guessrGame = getModule('GuessrGame')
	if (!guessrGame.item) return await interaction.editReply(`Es wurde noch kein ${guessrGame.type} ausgewählt!`)
	let item = guessrGame.getItem()
	let content = `Der gesuchte ${guessrGame.type} war: **${item.names[0]}**`
	let files = [item.cover || 'https://via.placeholder.com/150.png']
	if (!item.cover.endsWith('.png') && !item.cover.endsWith('.jpg')) {
		files = []
		content = `Der gesuchte ${guessrGame.type} war: **${item.names[0]}**\n${item.cover}`
	}
	await interaction.editReply({
		content,
		files,
	})
	await redisClient.deleteCache(`${guessrGame.guildId}:guessrItem`)
	guessrGame.item = null
}
