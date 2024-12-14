import Log from './util/log'

let twitch_access_token = ''

export async function refreshAccessToken() {
	let url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
	let res = await fetch(url, {
		method: 'POST',
	})
	let data = await res.json()
	twitch_access_token = data.access_token
	Log.info('token refresh', data.access_token)
}

setInterval(refreshAccessToken, 1000 * 60 * 60 * 3)

export function getTwitchAccessToken() {
	return twitch_access_token
}
