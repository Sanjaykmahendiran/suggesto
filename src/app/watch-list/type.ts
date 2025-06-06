// Movie interface based on API response
export interface Movie {
  watchlist_id: string
  movie_id: number
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  status: string
  added_date: string
  overview?: string
}

// Filtered movie interface from filter API
export interface FilteredMovie {
  movie_id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  rating: string
  language: string
  genres: string[]
  otts: {
    ott_id: number
    name: string
    logo_url: string
  }[]
}