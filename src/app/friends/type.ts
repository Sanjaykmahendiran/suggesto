export interface Friend {
    is_starred: number
    friends_count: number
    friend_id: number
    name: string
    profile_pic: string
    genre: string
    joined_date: string
    common_genres?: string
    user_id: number
}

export interface SearchUser {
    friend_id: Key | null | undefined
    user_id: number
    name: string
    profile_pic: string
    genre: string
    email?: string
    mobile?: string
}

export interface UserData {
    user_id: number
    name: string
    mobilenumber: string
    email: string
    location: string
    imgname: string
    dob: string | null
    gender: string | null
    created_date: string
    badge: string
    common_languages: string[]
    common_languages_count: number
    common_interests: string[]
    common_interests_count: number
    common_watchlist: string[]
    common_watchlist_count: number
    mutual_friends: any[]
    mutual_friends_count: number
    commonality_percent: number
    is_friend?: boolean // Add this line
}