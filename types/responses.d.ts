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
	export type MovieResponse = {
		page: number
		results: Array<Movie>
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
