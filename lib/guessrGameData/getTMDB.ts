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
		case GuessrType.ACTOR:
			return await getActorData(difficulty)
	}
}
const moviePages = {
	[GuessrDifficulty.VERY_EASY]: 10,
	[GuessrDifficulty.EASY]: 20,
	[GuessrDifficulty.MEDIUM]: 50,
	[GuessrDifficulty.HARD]: 100,
	[GuessrDifficulty.VERY_HARD]: 200,
	[GuessrDifficulty.IMPOSSIBLE]: 300,
	[GuessrDifficulty.TERMINSENDUNG]: 492,
}
async function getMovieData(difficulty: GuessrDifficulty) {
	let page = Math.floor(Math.random() * moviePages[difficulty]) + 1
	let movies = await callTMDBApi<TMDB.TMDBResponse<TMDB.Movie>>('discover/movie', {
		page: page.toString(),
		include_adult: 'false',
		include_video: 'false',
		language: 'en-US',
		sort_by: 'vote_count.desc',
		'vote_count.gte': '280',
		without_genres: '99,10755',
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

const showPages = {
	[GuessrDifficulty.VERY_EASY]: 10,
	[GuessrDifficulty.EASY]: 20,
	[GuessrDifficulty.MEDIUM]: 50,
	[GuessrDifficulty.HARD]: 75,
	[GuessrDifficulty.VERY_HARD]: 100,
	[GuessrDifficulty.IMPOSSIBLE]: 150,
	[GuessrDifficulty.TERMINSENDUNG]: 200,
}
async function getShowData(difficulty: GuessrDifficulty) {
	let page = Math.floor(Math.random() * showPages[difficulty]) + 1
	let shows = await callTMDBApi<TMDB.TMDBResponse<TMDB.Show>>('discover/tv', {
		page: page.toString(),
		include_adult: 'false',
		language: 'en-US',
		sort_by: 'vote_count.desc',
		'vote_count.gte': '50',
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

const actorPages = {
	[GuessrDifficulty.VERY_EASY]: 10,
	[GuessrDifficulty.EASY]: 20,
	[GuessrDifficulty.MEDIUM]: 50,
	[GuessrDifficulty.HARD]: 75,
	[GuessrDifficulty.VERY_HARD]: 100,
	[GuessrDifficulty.IMPOSSIBLE]: 150,
	[GuessrDifficulty.TERMINSENDUNG]: 200,
}
async function getActorData(difficulty: GuessrDifficulty) {
	let page = Math.floor(Math.random() * actorPages[difficulty]) + 1
	let actors = await callTMDBApi<TMDB.TMDBResponse<TMDB.Actor>>('person/popular', {
		page: page.toString(),
	})
	let actor = actors.results[Math.floor(Math.random() * actors.results.length)]
	let actorData = await callTMDBApi<TMDB.FullActorResponse>(`person/${actor.id}`, {
		append_to_response: 'images,combined_credits',
	})
	let characters = actorData.combined_credits.cast.map((credit) => credit.character)
	let set = new Set(characters)
	characters = [...set]
	characters = characters.filter((character, i) => {
		if (!character) return false
		if (character.toLowerCase().includes('self')) return false
		return true
	}, [])
	let names = [actor.name, ...actorData.also_known_as, ...characters]
	let images = actorData.images.profiles.map((image) => `${IMAGE_BASE_URL}${image.file_path}`)
	let hints = createActorHints(actorData)
	let cover = `${IMAGE_BASE_URL}${actor.profile_path}`
	return {
		names,
		images,
		hints,
		cover,
	}
}
function createActorHints(actorData: TMDB.FullActorResponse) {
	let hints: string[] = []
	if (actorData.birthday) {
		let date = new Date(actorData.birthday)
		hints.push(`Geburtstag: **${date.toLocaleDateString()}**`)
	}
	if (actorData.place_of_birth) {
		hints.push(`Geburtsort: **${actorData.place_of_birth}**`)
	}
	if (actorData.combined_credits.cast.length > 0) {
		let list = actorData.combined_credits.cast.filter((_, i) => i < 5)
		let credits = list.map((credit) => {
			if (credit.media_type === 'movie') {
				return `Film: **${credit.title}** (${credit.release_date})`
			} else {
				return `Serie: **${credit.name}** (${credit.first_air_date})`
			}
		})
		hints.push(`Bekannte Rollen:\n${credits.join('\n')}`)
	}
	if (actorData.deathday) {
		let date = new Date(actorData.deathday)
		hints.push(`Todesdatum: **${date.toLocaleDateString()}**`)
	}
	if (actorData.known_for_department) {
		hints.push(`Bekannt für: **${actorData.known_for_department}**`)
	}
	return hints
}
