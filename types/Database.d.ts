export interface Database {
	games: GameTable
	player: PlayerTable
	items: ItemTable
}
export interface GameTable {
	guildId: string
}
export interface PlayerTable {
	userId: string
	guildId: string
	level: number
	exp: number
	health: number
	maxHealth: number
}
export interface ItemTable {
	id: string
	name: string
	description: string
}
