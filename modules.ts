import guilds from './guilds.js'
import Module from './modules/_Module.js'
import fs from 'fs/promises'
const moduleFiles = await fs.readdir('./modules')
let moduleNames = moduleFiles.map((file) => file.split('.')[0])
moduleNames = moduleNames.filter((name) => !['_Module'].includes(name))

const moduleClasses = await Promise.all(
	moduleNames.map((name) => {
		return import(`./modules/${name}.js`) as Promise<{
			default: new (guildId: string) => Module
			scope: string
		}>
	})
)

if (!moduleClasses) throw new Error('Error loading modules')
const moduleTmp = guilds.reduce((acc, guildId) => {
	acc[guildId] = {}
	return acc
}, {})
const modules = moduleClasses.reduce((acc, module) => {
	guilds.forEach((guildId) => {
		acc[guildId][module.default.name] = new module.default(guildId)
	})
	return acc
}, moduleTmp) as {
	[channel: string]: {
		[module: string]: ModuleType<Modules>
	}
}

export default modules

export function callAllModules(method: string, ...args: any[]) {
	for (const channel in modules) {
		for (const module in modules[channel]) {
			modules[channel][module][method]?.(...args)
		}
	}
}
export function callModules(method: string, guildId: string, ...args: any[]) {
	for (const module in modules[guildId]) {
		modules[guildId][module][method]?.(...args)
	}
}
export function getModule<T extends Modules>(guildId: string, moduleName: T): ModuleType<T> {
	if (guildId[0] == '#') guildId = guildId.slice(1)
	const module = modules[guildId]?.[moduleName]
	return module as ModuleType<T>
}
