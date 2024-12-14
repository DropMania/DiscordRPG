export default class Log {
	static #getDateTime() {
		let date = new Date()
		return `[${date.toISOString()}]`
	}
	static info(...value: any[]) {
		console.log('[INFO]', this.#getDateTime(), ...value)
	}
	static error(...value: any[]) {
		console.error('[ERROR]', this.#getDateTime(), ...value)
	}
}
