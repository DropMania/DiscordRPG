import {
	ButtonInteraction,
	ButtonStyle,
	InteractionEditReplyOptions,
	ComponentType,
	Component,
	ActionRowBuilder,
	ButtonBuilder,
	TextInputBuilder,
} from 'discord.js'
import Module from './_Module'
import Player from '../rpg/Player'
type ShopHandlerParams = {
	interaction: ButtonInteraction
	guildConfig: GuildConfig
	player: Player
}
type ShopItem = {
	name: string
	id: string
	price: number
	description: string
	handler: (params: ShopHandlerParams) => Promise<boolean>
}
const SHOP_ITEMS: ShopItem[] = [
	{
		name: 'Gold Rolle 🤑',
		id: 'goldrole',
		price: 2000,
		description: 'Kaufe dir die Gold-Gräber Rolle und hab einen Gold-Namen!',
		handler: async ({ interaction, guildConfig }) => {
			let user = interaction.user
			let role = interaction.guild.roles.cache.get(guildConfig.goldRole)
			if (!role) {
				await interaction.reply('Die Gold-Rolle wurde nicht gefunden!')
				return false
			}
			let member = interaction.guild.members.cache.get(user.id)
			if (member.roles.cache.has(role.id)) {
				await interaction.reply(`${user} Du hast die Gold-Rolle bereits!`)
				return false
			}
			await member.roles.add(role)
			await interaction.reply(`${user} Du hast die Gold-Rolle erhalten!`)
			return true
		},
	},
]
export default class Shop extends Module {
	constructor(guildId: string) {
		super(guildId)
	}
	init() {}
	async onButtonPress(id: string, { interaction, player }: ButtonParams) {
		if (!id.startsWith('shop_')) return
		let item = SHOP_ITEMS.find((item) => item.id === id.slice(5))
		if (!item) return
		if (player.gold < item.price) {
			await interaction.reply(`${interaction.user} Du hast nicht genug Gold!`)
			return
		}
		let success = await item.handler({ interaction, player, guildConfig: this.guildConfig })
		if (success) {
			await player.addStats({ gold: -item.price })
		}
	}
	showShop(): InteractionEditReplyOptions {
		let components = []
		SHOP_ITEMS.forEach((item) => {
			let button = new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(`${item.price}x🪙: ${item.name}`)
				.setCustomId(`shop_${item.id}`)
			let button2 = new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel(`${item.description}`)
				.setCustomId(`shop_${item.id}_desc`)
				.setDisabled(true)
			//let textField = new TextInputBuilder().setCustomId(`shop_${item.id}`).setValue(item.description)

			let row = new ActionRowBuilder().addComponents([button, button2])

			components.push(row)
		})
		return {
			content: 'Willkommen im Shop!',
			components,
		}
	}
}
