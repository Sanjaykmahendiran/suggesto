export type WatchlistData = {
    watch_id: number
    user_id: number
    movie_id: number
    friend_id: number
    status: string
    created_date: string
}

export type Movie = {
    rated: number
    movie_id?: string
    tmdb_movie_id?: string
    title?: string
    poster_path?: string
    backdrop_path?: string
    genres?: string[]
    rating?: number | string
    release_date?: string
    language?: string
    overview?: string
    runtime?: string
    watchlist_data?: WatchlistData[]
    otts?: { name: string; logo?: string }[]
    liked?: number 
    is_adult : string
}

export const mockMovies = [
    {
        movie_id: 1,
        title: "Inception",
        poster_path: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
        rating: 8.8,
        release_date: "2010-07-16",
        language: "en",
    },
    {
        movie_id: 2,
        title: "Interstellar",
        poster_path: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
        rating: 8.6,
        release_date: "2014-11-07",
        language: "en",
    },
    {
        movie_id: 3,
        title: "Parasite",
        poster_path: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        rating: 8.5,
        release_date: "2019-05-30",
        language: "ko",
    },
    {
        movie_id: 4,
        title: "Spirited Away",
        poster_path: "https://image.tmdb.org/t/p/w500/oRvMaJOmapypFUcQqpgHMZA6qL9.jpg",
        rating: 8.6,
        release_date: "2001-07-20",
        language: "ja",
    },
    {
        movie_id: 5,
        title: "The Dark Knight",
        poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        rating: 9.0,
        release_date: "2008-07-18",
        language: "en",
    },
]