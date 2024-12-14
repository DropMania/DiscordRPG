import { GuessrDifficulty, GuessrType } from '../../enums'
import { TMDB } from '../../types/responses'
import { GuessrGameItem } from '../../types/varTypes'
import { callTMDBApi } from '../../util/fetchData'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original'

export default async function getMovie(type: GuessrType, difficulty: GuessrDifficulty): Promise<GuessrGameItem> {
	let page = Math.floor(Math.random() * getPages(difficulty)) + 1
	let movies = await callTMDBApi<TMDB.MovieResponse>('movie/popular', {
		page: page.toString(),
	})
	let movie = movies.results[Math.floor(Math.random() * movies.results.length)]
	let movieData = await callTMDBApi<TMDB.FullMovieResponse>(`movie/${movie.id}`, {
		include_image_language: 'null',
		append_to_response: 'images,alternative_titles',
	})
	let names = [movie.title, ...movieData.alternative_titles.titles.map((title) => title.title)]
	let images = movieData.images.backdrops.map((image) => `${IMAGE_BASE_URL}${image.file_path}`)
	let hints = createHints(movieData)
	return {
		names,
		images,
		hints,
		cover: `${IMAGE_BASE_URL}${movie.poster_path}`,
	}
}

function createHints(movieData: TMDB.FullMovieResponse) {
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
		case GuessrDifficulty.TERMINSENDUNG:
			return 500
	}
}
