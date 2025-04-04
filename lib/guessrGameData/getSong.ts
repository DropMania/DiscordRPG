import fs from 'fs'
import * as cheerio from 'cheerio'
import { GuessrDifficulty, GuessrType } from '../../enums'
import { SpotifyItem } from '../../types/responses'
import { GuessrGameItem } from '../../types/varTypes'
const SONGS = JSON.parse(fs.readFileSync('./lib/data/spotifySongs.json', 'utf-8')) as SpotifyItem[]
const GAME_SONGS = JSON.parse(fs.readFileSync('./lib/data/spotifySongs_games.json', 'utf-8')) as SpotifyItem[]

async function getPreviewUrl(song: string) {
	let res = await fetch(song)
	let text = await res.text()
	let $ = cheerio.load(text)
	let previewUrl = $('meta[property="og:audio"]').attr('content')
	return previewUrl + '.mp3'
}

export default async function getSong(
	type: GuessrType,
	difficulty: GuessrDifficulty,
	filter: string
): Promise<GuessrGameItem> {
	let songs = SONGS
	/* if (type === GuessrType.GAME_SONG) {
		songs = GAME_SONGS
	} */
	songs.sort((a, b) => a.popularity - b.popularity)
	let pages = getPages(difficulty)
	if (difficulty === GuessrDifficulty.TERMINSENDUNG) {
		pages = songs.length
	}
	let page = Math.floor(Math.random() * pages)
	let song = songs[page]
	let preview = await getPreviewUrl(song.url)
	let names = [song.name]
	let images = [preview]
	let hints = [
		`Interpreten: **${song.artists}**`,
		`Album des Songs: **${song.albumName}**`,
		`Dauer des Songs: **${Math.floor(song.duration / 60000)} Minuten**`,
	]
	/* if (type === GuessrType.GAME_SONG) {
		names.push(song.albumName)
		hints = [
			`Interpreten: **${song.artists}**`,
			`Dauer des Songs: **${Math.floor(song.duration / 60000)} Minuten**`,
		]
	} */
	let cover = song.url
	return { names, images, hints, cover }
}

function getPages(difficulty: GuessrDifficulty) {
	switch (difficulty) {
		case GuessrDifficulty.VERY_EASY:
			return 100
		case GuessrDifficulty.EASY:
			return 150
		case GuessrDifficulty.MEDIUM:
			return 250
		case GuessrDifficulty.HARD:
			return 300
		case GuessrDifficulty.VERY_HARD:
			return 400
		case GuessrDifficulty.IMPOSSIBLE:
			return 500
	}
}
