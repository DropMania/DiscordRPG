import { getTwitchAccessToken } from '../twitch'

export async function callTMDBApi<T>(path: string, queryParameters: Record<string, string>) {
	const response = await fetch(`https://api.themoviedb.org/3/${path}?${new URLSearchParams(queryParameters)}`, {
		headers: {
			Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
			Accept: 'application/json',
		},
	})
	return (await response.json()) as T
}

export async function callIGDBApi<T>(path: string, query: string) {
	const response = await fetch(`https://api.igdb.com/v4/${path}`, {
		method: 'POST',
		headers: {
			'Client-ID': process.env.TWITCH_CLIENT_ID,
			Authorization: `Bearer ${getTwitchAccessToken()}`,
			'Content-Type': 'text/plain',
		},
		body: query,
	})
	return (await response.json()) as T
}
