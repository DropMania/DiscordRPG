import { ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js'
import dcClient from '../discord'
import { DropNames } from '../enums'
import dropTypes from '../lib/dropgame/dropTypes'
import Module from './_Module'
import Log from '../util/log'
import messageDeleter from '../messageDeleter'

export default class DropGame extends Module {
	constructor(guildId: string) {
		super(guildId)
	}
	init() {
		let channels = this.getChannels()
		Log.info('DropGame', channels)
		const frequency = 1000 * 60 * 5
		const chance = 5
		//const chance = 1

		setInterval(async () => {
			let random = Math.floor(Math.random() * 100)
			//Log.info('DropGame', `trying to drop with ${random} and ${chance}`)
			if (random > chance) return
			let channel = channels[Math.floor(Math.random() * channels.length)]
			let dropName = this.getRandDrop()
			await this.drop(channel, dropName)
		}, frequency)
		this.calculateChances()
	}
	calculateChances() {
		let allDropTypes = Object.entries(dropTypes)
		let totalChance = allDropTypes.reduce((a, [_, dropType]) => a + dropType.chance, 0)
		let chanceTable = allDropTypes.reduce((a, [name, dropType]) => {
			a.push([name, `${Math.round((dropType.chance / totalChance) * 100)}%`])
			return a
		}, [] as [string, string][])
		Log.info('DropGame', 'Drop Chances:', chanceTable)
	}
	getChannels() {
		let validRoles = [dcClient.guilds.cache.get(this.guildId).roles.cache.get('1071029552186396782')]
		let channels = dcClient.channels.cache.toJSON()
		let channelIds = channels.reduce((a, c) => {
			if (
				c.type === ChannelType.GuildText &&
				validRoles.some((r) =>
					c.permissionsFor(r).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])
				)
			) {
				a.push(c.id)
			}
			return a
		}, [] as string[])
		return channelIds
	}
	getRandDrop() {
		let allDropTypes = Object.entries(dropTypes)
		let totalChance = allDropTypes.reduce((a, [_, dropType]) => a + dropType.chance, 0)
		let random = Math.floor(Math.random() * totalChance)
		let chanceTable = allDropTypes.reduce((a, [name, dropType]) => {
			a[name] = dropType.chance
			return a
		}, {} as Record<DropNames, number>)
		let total = 0
		let dropName = DropNames.RAT
		for (let [name, chance] of Object.entries(chanceTable)) {
			total += chance
			if (random <= total) {
				dropName = name as DropNames
				break
			}
		}
		return dropName
	}
	async drop(channelId: string, dropName: DropNames) {
		const dropType = dropTypes[dropName]
		let channel = dcClient.channels.cache.get(channelId) as TextChannel
		Log.info(`Dropping ${dropName} in ${channel.guild.name} > ${channel.name}`)
		let requires = Object.entries(dropType.requirements)
			.map(([stat, value]) => `${stat} = **${value}**`)
			.join(', ')

		let response = {
			...dropType.response,
			content: `${dropType.response.content}\n-# *Benötigt: ${requires}*`,
		}
		let m = await channel.send(response)
		await messageDeleter.addMessage(m, 1000 * 60 * 60)
	}
	onButtonPress(id: DropNames, { player, interaction }: ButtonParams) {
		if (!(id in dropTypes)) return
		if (!player)
			return interaction.channel.send({
				content: `${interaction.user} Du hast noch keinen Charakter! Schreibe \`/add-me\` um hinzugefügt zu werden!`,
			})
		let dropType = dropTypes[id]
		let required = dropType.requirements
		let doable = true
		let missingText = ''
		Object.entries(required).forEach(([stat, value]) => {
			if (player[stat] < value) {
				doable = false
				missingText = `${interaction.user} Du hast nicht genug ${stat}! (${player[stat]}/${value})`
			}
		})
		if (!doable) return interaction.update({ components: [], files: [], content: missingText })
		dropType.handler(player, interaction.channel)
		interaction.update({ components: [], files: [], content: `${interaction.user} ${dropType.winMessage}` })
	}
}
