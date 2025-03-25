export async function showShop({ interaction, getModule, player }: CommandParams) {
	let shop = getModule('Shop')
	let reply = shop.showShop()
	await interaction.editReply(reply)
}
