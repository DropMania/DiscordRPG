export async function createImage({ interaction, getModule }: CommandParams) {
	const aiModule = getModule('AI')
	let prompt = interaction.options.get('prompt', true).value as string
	let reply = await interaction.editReply('Erstelle dein Bild, bitte warte...')
	let aiResponse = await aiModule.createImage(prompt)
	await interaction.editReply({
		...aiResponse,
	})
}
