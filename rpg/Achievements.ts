import Player from './Player'

type Achievement = {
	id: string
	name: string
	description: string
	icon: string
	maxProgress: number
}
const achievements: Achievement[] = [
	{
		id: '10000_gold',
		name: '10.000 Gold',
		description: 'Verdiene 10.000 Gold!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 1,
	},
	{
		id: '100000_gold',
		name: '100.000 Gold',
		description: 'Verdiene 100.000 Gold!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 1,
	},
	{
		id: '1000000_gold',
		name: '1.000.000 Gold',
		description: 'Verdiene 1.000.000 Gold!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 1,
	},
	{
		id: 'level_50',
		name: 'Level 50',
		description: 'Erreiche Level 50!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 1,
	},
	{
		id: 'level_100',
		name: 'Level 100',
		description: 'Erreiche Level 100!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 1,
	},
	{
		id: 'guessr_pro',
		name: 'Guessr Pro',
		description: 'Gewinne 100 Spiele in Guessr!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 100,
	},
	{
		id: 'guessr_legend',
		name: 'Guessr Legend',
		description: 'Gewinne 500 Spiele in Guessr!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 500,
	},
	{
		id: 'mine_pro',
		name: 'Minesweeper Pro',
		description: 'Gewinne 50 Spiele in Minesweeper!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 50,
	},
	{
		id: 'mine_legend',
		name: 'Minesweeper Legend',
		description: 'Gewinne 100 Spiele in Minesweeper!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 100,
	},
	{
		id: 'blackjack_pro',
		name: 'Blackjack Pro',
		description: 'Gewinne 50 Spiele in Blackjack!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 50,
	},
	{
		id: 'blackjack_legend',
		name: 'Blackjack Legend',
		description: 'Gewinne 100 Spiele in Blackjack!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 100,
	},
	{
		id: 'hangman_pro',
		name: 'Hangman Pro',
		description: 'Gewinne 50 Spiele in Hangman!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 50,
	},
	{
		id: 'hangman_legend',
		name: 'Hangman Legend',
		description: 'Gewinne 100 Spiele in Hangman!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 100,
	},
	{
		id: 'monster_killer',
		name: 'Monster Killer',
		description: 'Besiege 100 Monster!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 100,
	},
	{
		id: 'monster_legend',
		name: 'Monster Legend',
		description: 'Besiege 500 Monster!',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		maxProgress: 500,
	},
]

export default achievements

export function drawAchievements(player: Player) {
	let embed = {
		title: 'Achievements',
		description: 'Hier sind deine Erfolge!',
		color: 0x00ff00,
		fields: [],
	}
	for (let achievement of achievements) {
		let progress = player.achievements.find((a) => a.id === achievement.id)
		if (!progress) {
			progress = { id: achievement.id, progress: 0, unlocked: false, unlockDate: 0 }
		}
		let progressText = `${progress.progress}/${achievement.maxProgress}`
		if (progress.unlocked) progressText = '✅'
		embed.fields.push({
			name: `${achievement.name}`,
			value: `${achievement.description}\n${progressText}`,
			inline: true,
		})
	}
	return embed
}
