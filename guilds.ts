const GUILDS: GuildConfig[] = [
	{
		id: '980947206863470622',
		goldRole: '1354157905473179860',
	},
]
export default GUILDS

export function getGuild(guildId: string) {
	return GUILDS.find((g) => g.id === guildId)
}
