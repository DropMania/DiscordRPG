import { ChannelType, PermissionFlagsBits, TextChannel } from 'discord.js'
import dcClient from '../discord'
import { Drops } from '../enums'
import dropTypes from '../lib/dropgame/dropTypes'
import Module from './_Module'
import Log from '../util/log'
import messageDeleter from '../messageDeleter'
import { BDAY } from '../constants'

export default class DropGame extends Module {
	constructor(guildId: string) {
		super(guildId)
	}
	init() {
		let channels = this.getChannels()
		//Log.info('DropGame',this.guildConfig, channels)
		const frequency = this.guildConfig.dropgame.interval
		const chance = this.guildConfig.dropgame.chance
		if (channels.length === 0) {
			Log.info('DropGame', 'No channels found')
			return
		}

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
			a.push([name, `${((dropType.chance / totalChance) * 100).toFixed(2)}%`])
			return a
		}, [] as [string, string][])
		//Log.info('DropGame', 'Drop Chances:', chanceTable)
	}
	getChannels() {
		let validRoles = [dcClient.guilds.cache.get(this.guildId).roles.cache.get(this.guildConfig.dropRole)]
		let channels = dcClient.channels.cache.toJSON()
		let channelIds = channels.reduce((a, c) => {
			if (
				c.type === ChannelType.GuildText &&
				c.guildId === this.guildId &&
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
		}, {} as Record<Drops, number>)
		let total = 0
		let dropName = Drops.RAT
		for (let [name, chance] of Object.entries(chanceTable)) {
			total += chance
			if (random <= total) {
				dropName = name as Drops
				break
			}
		}
		return dropName
	}
	async drop(channelId: string, dropName: Drops) {
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
	async onButtonPress(id: Drops, { player, interaction }: ButtonParams) {
		if (!(id in dropTypes)) return
		if (!player)
			return interaction.channel.send({
				content: `${interaction.user} Du hast noch keinen Charakter! Schreibe \`/add-me\` um hinzugefügt zu werden!`,
			})
		let dropType = dropTypes[id]
		let required = dropType.requirements
		let doable = true
		let missingText = ''
		if (id === Drops.PRESENT && interaction.user.id !== BDAY) {
			await player.addStats({ health: -10 })
			return await interaction.channel.send(
				`${interaction.user} Kannst du nicht lesen?! -10 HP! (HP: ${player.health}/${player.maxHealth})`
			)
		}
		Object.entries(required).forEach(([stat, value]) => {
			if (player[stat] < value) {
				doable = false
				missingText = `${interaction.user} Du hast nicht genug ${stat}! (${player[stat]}/${value})`
			}
		})
		if (!doable) return interaction.update({ components: [], files: [], content: missingText })
		await dropType.handler(player, interaction.channel)
		await interaction.update({ components: [], files: [], content: `${interaction.user} ${dropType.winMessage}` })
	}
}
