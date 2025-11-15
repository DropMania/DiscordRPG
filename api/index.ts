import express from 'express'
import redisClient from '../redis'
const app = express()

app.use('/', express.static('./api/dataViewer'))
app.use(express.json())

app.get('/get-rpg', async (req, res) => {
	const guildId = req.query.guildId as string
	if (!guildId) {
		res.status(400).send('guildId query parameter is required')
		return
	}
	const rpgData = await redisClient.get(`rpg_new:${guildId}`)
	res.send(rpgData)
})

app.get('/get-guilds', async (req, res) => {
	const keys = await redisClient.getAllKeys('rpg_new:*')
	const guilds = []
	for (let key of keys) {
		let guild = await redisClient.get<any>(key)
		guilds.push({ id: guild.guildId, name: guild?.name || 'Unknown Guild' })
	}
	res.send(guilds)
})

app.post('/set-rpg', async (req, res) => {
	const guildId = req.query.guildId as string
	if (!guildId) {
		res.status(400).send('guildId query parameter is required')
		return
	}
	const rpgData = req.body
	await redisClient.set(`rpg_new:${guildId}`, rpgData)
	res.send('RPG data saved successfully')
})

app.listen(3000, () => {
	console.log('API server running on http://localhost:3000')
})
