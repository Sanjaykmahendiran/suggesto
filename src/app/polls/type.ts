// Define types for polls
export interface Movie  {
    movie_id: number
    title: string
    poster_path: string
    release_date: string
    vote_count?: number
    percentage?: number // Add this line
}

export interface Poll  {
    poll_id: number
    user_id: number
    question: string
    status: number
    is_voted: number // Add this field from API
    movies: Movie[]
    total_votes?: number
    created_at?: string
    created_by?: {
        name: string
        imgname?: string
    }
    user_voted_movie_id?: string // Add this to track if user has voted
}

export interface users {
    imgname: string
    user_id: number
    name: string
}