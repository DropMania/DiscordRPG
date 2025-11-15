import Item from './Item'

class Player {
	level: number = 1
	exp: number = 0
	health: number = 100
	maxHealth: number = 100
	name: string = ''
	items: Item[] = []
	constructor(public userId: string, data?: any) {
		if (data) this.initCacheData(data)
	}
	initCacheData(data: any) {
		Object.entries(data).forEach(([key, value]) => {
			if (key === 'items' && Array.isArray(value)) {
				this.items = value.map((itemData: any) => new Item(itemData.name, itemData.description))
			} else if (key in this) {
				;(this as any)[key] = value
			}
		})
	}
	getCacheObject() {
		return {
			userId: this.userId,
			name: this.name,
			level: this.level,
			exp: this.exp,
			health: this.health,
			maxHealth: this.maxHealth,
			items: this.items.map((item) => ({ name: item.name, description: item.description })),
		}
	}
}
export default Player
