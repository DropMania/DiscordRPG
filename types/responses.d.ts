export namespace TMDB {
	export type Movie = {
		adult: boolean
		backdrop_path: string
		genre_ids: Array<number>
		id: number
		original_language: string
		original_title: string
		overview: string
		popularity: number
		poster_path: string
		release_date: string
		title: string
		video: boolean
		vote_average: number
		vote_count: number
	}
	export type TMDBResponse<T> = {
		page: number
		results: Array<T>
		total_pages: number
		total_results: number
	}
	export type Image = {
		aspect_ratio: number
		height: number
		iso_639_1?: string
		file_path: string
		vote_average: number
		vote_count: number
		width: number
	}
	export type ImageResponse = {
		backdrops: Array<Image>
		id: number
		logos: Array<Image>
		posters: Array<Image>
	}

	export type FullMovieResponse = {
		adult: boolean
		backdrop_path: string
		belongs_to_collection: {
			id: number
			name: string
			poster_path: string
			backdrop_path: string
		}
		budget: number
		genres: Array<{
			id: number
			name: string
		}>
		homepage: string
		id: number
		imdb_id: string
		origin_country: Array<string>
		original_language: string
		original_title: string
		overview: string
		popularity: number
		poster_path: string
		production_companies: Array<{
			id: number
			logo_path: string
			name: string
			origin_country: string
		}>
		production_countries: Array<{
			iso_3166_1: string
			name: string
		}>
		release_date: string
		revenue: number
		runtime: number
		spoken_languages: Array<{
			english_name: string
			iso_639_1: string
			name: string
		}>
		status: string
		tagline: string
		title: string
		video: boolean
		vote_average: number
		vote_count: number
		images: {
			backdrops: Array<{
				aspect_ratio: number
				height: number
				iso_639_1: any
				file_path: string
				vote_average: number
				vote_count: number
				width: number
			}>
			logos: Array<any>
			posters: Array<{
				aspect_ratio: number
				height: number
				iso_639_1: any
				file_path: string
				vote_average: number
				vote_count: number
				width: number
			}>
		}
		alternative_titles: {
			titles: Array<{
				iso_3166_1: string
				title: string
				type: string
			}>
		}
	}
	export type Show = {
		adult: boolean
		backdrop_path: string
		genre_ids: Array<number>
		id: number
		origin_country: Array<string>
		original_language: string
		original_name: string
		overview: string
		popularity: number
		poster_path: string
		first_air_date: string
		name: string
		vote_average: number
		vote_count: number
	}

	export type FullShowResponse = {
		adult: boolean
		backdrop_path: string
		created_by: Array<{
			id: number
			credit_id: string
			name: string
			original_name: string
			gender: number
			profile_path: string
		}>
		episode_run_time: Array<any>
		first_air_date: string
		genres: Array<{
			id: number
			name: string
		}>
		homepage: string
		id: number
		in_production: boolean
		languages: Array<string>
		last_air_date: string
		last_episode_to_air: {
			id: number
			name: string
			overview: string
			vote_average: number
			vote_count: number
			air_date: string
			episode_number: number
			episode_type: string
			production_code: string
			runtime: number
			season_number: number
			show_id: number
			still_path: string
		}
		name: string
		next_episode_to_air: any
		networks: Array<{
			id: number
			logo_path: string
			name: string
			origin_country: string
		}>
		number_of_episodes: number
		number_of_seasons: number
		origin_country: Array<string>
		original_language: string
		original_name: string
		overview: string
		popularity: number
		poster_path: string
		production_companies: Array<{
			id: number
			logo_path?: string
			name: string
			origin_country: string
		}>
		production_countries: Array<{
			iso_3166_1: string
			name: string
		}>
		seasons: Array<{
			air_date: string
			episode_count: number
			id: number
			name: string
			overview: string
			poster_path: string
			season_number: number
			vote_average: number
		}>
		spoken_languages: Array<{
			english_name: string
			iso_639_1: string
			name: string
		}>
		status: string
		tagline: string
		type: string
		vote_average: number
		vote_count: number
		images: {
			backdrops: Array<any>
			logos: Array<any>
			posters: Array<any>
		}
		alternative_titles: {
			results: Array<{
				iso_3166_1: string
				title: string
				type: string
			}>
		}
	}
	export type Actor = {
		adult: boolean
		gender: number
		id: number
		known_for_department: string
		name: string
		original_name: string
		popularity: number
		profile_path: string
		known_for: Array<{
			backdrop_path?: string
			id: number
			title?: string
			original_title?: string
			overview: string
			poster_path: string
			media_type: string
			adult: boolean
			original_language: string
			genre_ids: Array<number>
			popularity: number
			release_date?: string
			video?: boolean
			vote_average: number
			vote_count: number
			name?: string
			original_name?: string
			first_air_date?: string
			origin_country?: Array<string>
		}>
	}

	export type FullActorResponse = {
		adult: boolean
		also_known_as: Array<string>
		biography: string
		birthday: string
		deathday: any
		gender: number
		homepage: any
		id: number
		imdb_id: string
		known_for_department: string
		name: string
		place_of_birth: string
		popularity: number
		profile_path: string
		images: {
			profiles: Array<{
				aspect_ratio: number
				height: number
				iso_639_1: any
				file_path: string
				vote_average: number
				vote_count: number
				width: number
			}>
		}
		combined_credits: {
			cast: Array<{
				adult: boolean
				backdrop_path?: string
				genre_ids: Array<number>
				id: number
				original_language: string
				original_title?: string
				overview: string
				popularity: number
				poster_path?: string
				release_date?: string
				title?: string
				video?: boolean
				vote_average: number
				vote_count: number
				character: string
				credit_id: string
				order?: number
				media_type: string
				origin_country?: Array<string>
				original_name?: string
				first_air_date?: string
				name?: string
				episode_count?: number
			}>
			crew: Array<{
				adult: boolean
				backdrop_path?: string
				genre_ids: Array<number>
				id: number
				original_language: string
				original_title?: string
				overview: string
				popularity: number
				poster_path: string
				release_date?: string
				title?: string
				video?: boolean
				vote_average: number
				vote_count: number
				credit_id: string
				department: string
				job: string
				media_type: string
				origin_country?: Array<string>
				original_name?: string
				first_air_date?: string
				name?: string
				episode_count?: number
			}>
		}
	}
}

export type IGDBGame = {
	id: number
	alternative_names?: Array<{
		id: number
		name: string
	}>
	category?: number
	cover?: {
		id: number
		url: string
	}
	first_release_date?: number
	genres?: Array<{
		id: number
		name: string
	}>
	name: string
	platforms?: Array<{
		id: number
		name: string
	}>
	rating?: number
	screenshots?: Array<{
		id: number
		url: string
	}>
	similar_games?: Array<{
		id: number
		name: string
	}>
	storyline?: string
	themes?: Array<{
		id: number
		name: string
	}>
}

export type SpotifyItem = {
	url: string
	name: string
	albumName: string
	duration: number
	popularity: number
	artists: string
}
