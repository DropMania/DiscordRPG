const GUILDS: GuildConfig[] = [
	{
		id: '980947206863470622', //dropma
		goldRole: '1354157905473179860',
		dropRole: '1071029552186396782',
		minesweeper: {
			nightTime: {
				start: 23,
				end: 6,
			},
		},
	},
	/* {
		id: '1059613070785257494', //illu
		goldRole: '1354157905473179860',
		dropRole: '1059634799679115285',
	}, */
]
export default GUILDS

export function getGuild(guildId: string) {
	return GUILDS.find((g) => g.id === guildId)
}
