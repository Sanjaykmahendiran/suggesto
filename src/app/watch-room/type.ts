export type Friend = {
    image: string
    friend_id: string
    name: string
    profile_pic?: string
    joined_date: string
    genre: string
}

export type Room = {
    id: string
    name: string
    is_creator: boolean
    members: string[]
    friends: Friend[]
    suggestedMovies: Movie[]
    created_date?: string
    member_count?: number
    movie_count?: number
}

export type Movie = {
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

export type CreateRoomPayload = {
    gofor: "watchroom"
    creator_id: number
    room_name: string
    members: number[]
}

// API Response export type for watch room list
export type WatchRoomAPIResponse = {
    room_id: number
    room_name: string
    created_date: string
    is_creator: boolean
    members: Array<{
        user_id: number
        name: string
        image: string
    }>
}