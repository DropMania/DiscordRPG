import { callIGDBApi } from '../../util/fetchData'
import { IGDBGame } from '../../types/responses'
import { GuessrGameItem } from '../../types/varTypes'
import { GuessrDifficulty, GuessrType } from '../../enums'

const categoryEnum = [
	'Hauptspiel',
	'DLC',
	'Expansion',
	'Bundle',
	'Standalone Expansion',
	'Mod',
	'Episode',
	'Season',
	'Remake',
	'Remaster',
	'Expanded Game',
	'Port',
	'Fork',
	'Pack',
	'Update',
]
export default async function getGame(
	type: GuessrType,
	difficulty: GuessrDifficulty,
	filter: string
): Promise<GuessrGameItem> {
	let ratings = getRatings(difficulty)
	let countQuery = `where total_rating_count > ${ratings}`
	if (difficulty === GuessrDifficulty.TERMINSENDUNG) {
		countQuery = `where name != null`
	}
	if (filter) {
		countQuery += ` & ${filter}`
	}
	let countResponse = await callIGDBApi<{ count: number }>('games/count', `${countQuery};`)
	let count = countResponse.count || 800
	let offset = Math.floor(Math.random() * count)
	let query = `
        fields 
            name, 
            screenshots.url, 
            alternative_names.name, 
            genres.name, 
            first_release_date, 
            rating, 
            similar_games.name, 
            storyline, 
            cover.url,
            category,
            platforms.name,
            game_localizations.name,
            themes.name;
        ${countQuery};
        offset ${offset};
        limit 1;`
	console.log(query)
	let response = await callIGDBApi<IGDBGame[]>('games', query)
	let game = response[0]
	let names = [game.name, ...(game.alternative_names ? game.alternative_names.map((name) => name.name) : [])]
	let images = game.screenshots
		? game.screenshots.map((screenshot) => 'https:' + screenshot.url.replace('thumb', '1080p'))
		: []
	let hints = createHints(game)
	let cover = game.cover?.url ? 'https:' + game.cover.url.replace('thumb', '1080p') : ''
	return {
		names,
		images,
		hints,
		cover,
	}
}

function createHints(game: IGDBGame): string[] {
	let hints = []
	if (game.first_release_date) {
		hints.push(`Das Spiel ist von **${new Date(game.first_release_date * 1000).getFullYear()}**`)
	}
	if (game.genres?.length) {
		let genres = game.genres.map((genre) => genre.name).filter((v, i) => i < 3)
		hints.push(`Das Spiel ist ein **${genres.join(', ')}**`)
	}
	if (game.rating) {
		hints.push(`Das Spiel hat eine Bewertung von **${game.rating.toFixed(2)}/100**`)
	}
	if (game.similar_games?.length) {
		let similarGames = game.similar_games.map((game) => game.name).filter((v, i) => i < 3)
		hints.push(`Ähnliche Spiele sind z.B.: **${similarGames.join(', ')}**`)
	}
	if (game.storyline) {
		let story = game.storyline.substring(0, 100)
		hints.push(`Hier ist ein Ausschnitt der Story: **${story}...**`)
	}
	hints.push(`Die Kategorie des Spiels ist: **${categoryEnum[game.category || 0]}**  `)
	if (game.platforms?.length) {
		let platforms = game.platforms.map((platform) => platform.name)
		hints.push(`Das Spiel ist auf **${platforms.join(', ')}** verfügbar`)
	}
	if (game.themes?.length) {
		let themes = game.themes.map((theme) => theme.name)
		hints.push(`Das Theme des Spiels ist: **${themes.join(', ')}**`)
	}
	return hints
}

function getRatings(difficulty: GuessrDifficulty) {
	switch (difficulty) {
		case GuessrDifficulty.VERY_EASY:
			return '200'
		case GuessrDifficulty.EASY:
			return '100'
		case GuessrDifficulty.MEDIUM:
			return '50'
		case GuessrDifficulty.HARD:
			return '25'
		case GuessrDifficulty.VERY_HARD:
			return '10'
		case GuessrDifficulty.IMPOSSIBLE:
			return '5'
	}
}
