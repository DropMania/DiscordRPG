import fs from 'fs'
cacheSpotifySongs()
let total = 0
let songs = []
async function cacheSpotifySongs() {
	let inital = await getItems(0)
	total = inital.total
	songs = inital.items
	let offset = 100
	while (offset < total) {
		let next = await getItems(offset)
		songs = songs.concat(next.items)
		offset += 100
	}
	songs.sort((a, b) => a.track.popularity - b.track.popularity)
	let data = songs.map((song) => ({
		url: song.track.external_urls.spotify,
		name: song.track.name,
		albumName: song.track.album.name,
		duration: song.track.duration_ms,
		popularity: song.track.popularity,
		artists: song.track.artists.map((artist) => artist.name).join(', '),
	}))
	let json = JSON.stringify(data)
	fs.writeFileSync('./lib/data/spotifySongs_games.json', json)
}
//const PLAYLIST_ID = '2YRe7HRKNRvXdJBp9nXFza' // popular
const PLAYLIST_ID = '2mIgGNvWhF6f45XIBWNWx7' // games
async function getItems(offset) {
	let at = await getAccessToken()
	const URL = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks?offset=${offset}&limit=100`
	const headers = {
		Authorization: 'Bearer ' + at,
	}
	let res = await fetch(URL, { headers: headers })
	let json = await res.json()
	return json
}

async function getAccessToken() {
	const form = new FormData()
	form.append('grant_type', 'client_credentials')
	const url = 'https://accounts.spotify.com/api/token'
	const headers = {
		Authorization:
			'Basic ' +
			Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
		'Content-Type': 'application/x-www-form-urlencoded',
	}
	let res = await fetch(url, { method: 'POST', body: new URLSearchParams(form), headers: headers })
	let json = await res.json()
	return json.access_token
}
