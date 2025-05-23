const GUILDS: GuildConfig[] = [
	{
		id: '980947206863470622', //dropma
		goldRole: '1354157905473179860',
		dropRole: '1071029552186396782',
		gambleRole: '1357095753310540067',
		minesweeper: {
			nightTime: {
				start: 23,
				end: 6,
			},
		},
		dropgame: {
			interval: 1000 * 60 * 5,
			chance: 5,
		},
		ai: {
			ignoreChannels: ['1080469173127348344'],
			initiateChance: 0,
			answerChance: 0,
			initiateChannels: ['980947899628273714', '980947904422379520', '1248643273522937938'],
		},
	},
	{
		id: '1059613070785257494', //illu
		goldRole: '1354157905473179860',
		dropRole: '1059634799679115285',
		gambleRole: '1357095753310540067',
		minesweeper: {
			nightTime: {
				start: 23,
				end: 6,
			},
		},
		dropgame: {
			interval: 1000 * 60 * 5,
			chance: 5,
		},
		ai: {
			ignoreChannels: [],
			initiateChance: 0,
			answerChance: 0,
			initiateChannels: [],
		},
	},
]
export default GUILDS

export function getGuild(guildId: string) {
	return GUILDS.find((g) => g.id === guildId)
}
