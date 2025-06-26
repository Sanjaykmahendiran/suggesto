export interface Friend {
    friend_id: number; // Changed from string to number
    name: string;
    profile_pic: string;
    joined_date: string;
    genre: string;
    friends_count: number;
    watchlist_count: number;
    is_starred: number;
}

// Add this interface for the API response
export interface FriendsAPIResponse {
    total_count: number;
    data: Friend[];
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
    movie_count: any
    room_id: number
    room_name: string
    created_date: string
    is_creator: boolean
    members: Array<{
        is_creator: any
        user_id: number
        name: string
        image: string
    }>
}