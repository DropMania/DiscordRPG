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
const moduleTmp = guilds.reduce((acc, guild) => {
	acc[guild.id] = {}
	return acc
}, {})
const modules = moduleClasses.reduce((acc, module) => {
	guilds.forEach((guild) => {
		acc[guild.id][module.default.name] = new module.default(guild.id)
	})
	return acc
}, moduleTmp) as {
	[guild: string]: {
		[module: string]: ModuleType<Modules>
	}
}

export default modules

export function callAllModules(method: string, ...args: any[]) {
	for (const guild in modules) {
		for (const module in modules[guild]) {
			modules[guild][module][method]?.(...args)
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
