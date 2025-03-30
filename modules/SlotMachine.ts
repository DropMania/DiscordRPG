import Module from './_Module'

type Symbol = {
	display: string
	value: number
}
export default class SlotMachine extends Module {
	symbols: Symbol[] = [
		{ display: '🍒', value: 2 },
		{ display: '🍋', value: 3 },
		{ display: '🍊', value: 4 },
		{ display: '🍉', value: 5 },
		{ display: '🍇', value: 6 },
		{ display: '⭐', value: 10 },
	]
	constructor(guildId: string) {
		super(guildId)
	}
	init() {}
	spin() {
		let spinResult = [
			this.symbols[Math.floor(Math.random() * this.symbols.length)],
			this.symbols[Math.floor(Math.random() * this.symbols.length)],
			this.symbols[Math.floor(Math.random() * this.symbols.length)],
		]
		return spinResult
	}
	calculateWinnings(spinResult: Symbol[], bet: number) {
		let winnings = 0
		let multiplier = 0
		if (spinResult[0].value === spinResult[1].value && spinResult[1].value === spinResult[2].value) {
			multiplier = spinResult[0].value
		} else if (spinResult[0].value === spinResult[1].value || spinResult[1].value === spinResult[2].value) {
			if (spinResult[0].value === spinResult[1].value) {
				multiplier = spinResult[0].value * 0.5
			} else {
				multiplier = spinResult[1].value * 0.5
			}
		}
		winnings = bet * multiplier
		return winnings
	}
}
