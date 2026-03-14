export async function createImage({ interaction, getModule }: CommandParams) {
	const aiModule = getModule('AI')
	let prompt = interaction.options.get('prompt', true).value as string
	let reply = await interaction.editReply('Erstelle dein Bild, bitte warte...')
	let aiResponse = await aiModule.createImage(prompt)
	await interaction.editReply({
		...aiResponse,
	})
}

export async function changeImage({ interaction, getModule }: CommandParams) {
	const aiModule = getModule('AI')
	let image = interaction.options.getAttachment('image', true)
	let prompt = interaction.options.get('prompt')?.value as string | undefined
	let reply = await interaction.editReply('Ändere dein Bild, bitte warte...')
	let aiResponse = await aiModule.changeImage(image, prompt)
	await interaction.editReply({
		...aiResponse,
	})
}
