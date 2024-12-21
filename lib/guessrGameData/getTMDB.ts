import { GuessrDifficulty, GuessrType } from '../../enums'
import { TMDB } from '../../types/responses'
import { GuessrGameItem } from '../../types/varTypes'
import { callTMDBApi } from '../../util/fetchData'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'

export default async function getTMDB(type: GuessrType, difficulty: GuessrDifficulty): Promise<GuessrGameItem> {
	switch (type) {
		case GuessrType.MOVIE:
			return await getMovieData(difficulty)
		case GuessrType.SHOW:
			return await getShowData(difficulty)
	}
}

function getMoviePages(difficulty: GuessrDifficulty) {
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
			return 350
		case GuessrDifficulty.IMPOSSIBLE:
			return 400
		case GuessrDifficulty.TERMINSENDUNG:
			return 492
	}
}

async function getMovieData(difficulty: GuessrDifficulty) {
	let page = Math.floor(Math.random() * getMoviePages(difficulty)) + 1
	let movies = await callTMDBApi<TMDB.TMDBResponse<TMDB.Movie>>('movie/top_rated', {
		page: page.toString(),
	})
	let movie = movies.results[Math.floor(Math.random() * movies.results.length)]
	let movieData = await callTMDBApi<TMDB.FullMovieResponse>(`movie/${movie.id}`, {
		include_image_language: 'null',
		append_to_response: 'images,alternative_titles',
	})
	let names = [movie.title, ...movieData.alternative_titles.titles.map((title) => title.title)]
	let images = movieData.images.backdrops.map((image) => `${IMAGE_BASE_URL}${image.file_path}`)
	let hints = createMovieHints(movieData)
	let cover = `${IMAGE_BASE_URL}${movie.poster_path}`
	return {
		names,
		images,
		hints,
		cover,
	}
}

function createMovieHints(movieData: TMDB.FullMovieResponse) {
	let hints: string[] = []
	if (movieData.genres.length > 0) {
		hints.push(`Genre des Films: **${movieData.genres.map((genre) => genre.name).join(', ')}**`)
	}
	if (movieData.production_countries.length > 0) {
		hints.push(`Produktionsländer: **${movieData.production_countries.map((country) => country.name).join(', ')}**`)
	}
	if (movieData.budget > 0) {
		hints.push(`Budget: **$${movieData.budget.toLocaleString()}**`)
	}
	if (movieData.overview) {
		hints.push(`Ausschnitt der Handlung: ${movieData.overview.substring(0, 100)}...`)
	}
	if (movieData.production_companies.length > 0) {
		hints.push(`Produktionsfirmen: **${movieData.production_companies.map((company) => company.name).join(', ')}**`)
	}
	if (movieData.release_date) {
		let date = new Date(movieData.release_date)
		hints.push(`Erscheinungsdatum: **${date.toLocaleDateString()}**`)
	}
	if (movieData.runtime > 0) {
		hints.push(`Laufzeit: **${movieData.runtime} Minuten**`)
	}
	if (movieData.revenue > 0) {
		hints.push(`Einnahmen: **$${movieData.revenue.toLocaleString()}**`)
	}
	if (movieData.vote_average > 0) {
		hints.push(`Bewertung: **${movieData.vote_average}/10**`)
	}
	return hints
}

function getShowPages(difficulty: GuessrDifficulty) {
	switch (difficulty) {
		case GuessrDifficulty.VERY_EASY:
			return 25
		case GuessrDifficulty.EASY:
			return 40
		case GuessrDifficulty.MEDIUM:
			return 50
		case GuessrDifficulty.HARD:
			return 60
		case GuessrDifficulty.VERY_HARD:
			return 75
		case GuessrDifficulty.IMPOSSIBLE:
			return 90
		case GuessrDifficulty.TERMINSENDUNG:
			return 105
	}
}
async function getShowData(difficulty: GuessrDifficulty) {
	let page = Math.floor(Math.random() * getShowPages(difficulty)) + 1
	let shows = await callTMDBApi<TMDB.TMDBResponse<TMDB.Show>>('tv/top_rated', {
		page: page.toString(),
	})
	let show = shows.results[Math.floor(Math.random() * shows.results.length)]
	let showData = await callTMDBApi<TMDB.FullShowResponse>(`tv/${show.id}`, {
		include_image_language: 'null',
		append_to_response: 'images,alternative_titles',
	})
	let names = [show.name, ...showData.alternative_titles.results.map((title) => title.title)]
	let images = showData.images.backdrops.map((image) => `${IMAGE_BASE_URL}${image.file_path}`)
	let hints = createShowHints(showData)
	let cover = `${IMAGE_BASE_URL}${show.poster_path}`
	return {
		names,
		images,
		hints,
		cover,
	}
}

function createShowHints(showData: TMDB.FullShowResponse) {
	let hints: string[] = []
	if (showData.genres?.length > 0) {
		hints.push(`Genre der Serie: **${showData.genres.map((genre) => genre.name).join(', ')}**`)
	}
	if (showData.origin_country?.length > 0) {
		hints.push(`Ursprungsland: **${showData.origin_country.join(', ')}**`)
	}
	if (showData.overview) {
		hints.push(`Ausschnitt der Handlung: ${showData.overview.substring(0, 100)}...`)
	}
	if (showData.production_companies?.length > 0) {
		hints.push(`Produktionsfirmen: **${showData.production_companies.map((company) => company.name).join(', ')}**`)
	}
	if (showData.first_air_date) {
		let date = new Date(showData.first_air_date)
		hints.push(`Erstausstrahlungsdatum: **${date.toLocaleDateString()}**`)
	}
	if (showData.last_air_date) {
		let date = new Date(showData.last_air_date)
		hints.push(`Letzte Ausstrahlung: **${date.toLocaleDateString()}**`)
	}
	if (showData.number_of_episodes > 0) {
		hints.push(`Anzahl der Episoden: **${showData.number_of_episodes}**`)
	}
	if (showData.number_of_seasons > 0) {
		hints.push(`Anzahl der Staffeln: **${showData.number_of_seasons}**`)
	}
	if (showData.vote_average > 0) {
		hints.push(`Bewertung: **${showData.vote_average}/10**`)
	}
	return hints
}
