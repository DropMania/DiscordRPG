type Achievement = {
	id: string
	name: string
	description: string
	icon: string
	progress: number
	maxProgress: number
	unlocked: boolean
	unlockedAt: number
}
const achievements = [
	{
		id: 'first_login',
		name: 'First Login',
		description: 'You logged in for the first time.',
		icon: 'https://cdn.discordapp.com/emojis/1108917530440040468.webp?size=96&quality=lossless',
		progress: 1,
		maxProgress: 1,
		unlocked: false,
		unlockedAt: 0,
	},
]
