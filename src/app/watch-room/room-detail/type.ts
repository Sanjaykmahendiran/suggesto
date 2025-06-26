export type Member = {
    is_creator: unknown
    image: any
    user_id: number
    name: string
    profile_pic?: string
}

export type Movie = {
    watchlist_id: any
    status: string
    movie_id: string
    title: string
    poster_path: string
    backdrop_path: string
    release_date: string
    rating: string
    overview: string
    language: string
    is_adult: string
    genres: string[]
    otts: {
        ott_id: number
        name: string
        logo_url: string
    }[]
}

export type RoomData = {
    room_id: number
    room_name: string
    created_date: string
    members: Member[]
    is_creator: boolean
}

export type Room = {
    id: string
    name: string
    creator_id: string
    members: Member[]
    suggestedMovies: Movie[]
    addedMovies: Movie[]
    created_date: string
    is_creator: boolean
    description?: string
}

export type Friend = {
    image: string
    friend_id: string
    name: string
    profile_pic?: string
    joined_date: string
    genre: string
}