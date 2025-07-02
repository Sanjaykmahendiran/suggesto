export interface Friend {
    dob: string
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
    friend_id: number | string
    user_id: number
    name: string
    profile_pic: string
    genre: string
    email?: string
    mobile?: string
}

export interface MovieSuggestion {
    movie_id: number;
    poster: string;
    title: string;
    rating: string;
    relevance?: number; // Optional because it's not always present
}

export interface UserData {
    user_id: number;
    name: string;
    mobilenumber: string;
    otp?: string;
    otp_status?: string;
      friends: any[];
      friends_count: number;
    register_level_status?: number;
    email?: string;
    country?: string;
    state?: string;
    location?: string;
    imgname: string;
    dob?: string;
    gender?: string;
    referral_code?: string;
    referred_by?: string | null;
    status?: string;
    created_date?: string;
    modified_date?: string;
    badge?: string;

    // Language fields
    user_languages: string[];
    user_languages_count?: number;
    common_languages?: string[];
    common_languages_count?: number;

    // Interests
    user_interests?: string[];
    user_interests_count?: number;
    common_interests?: string[];
    common_interests_count?: number;

    // Watchlist
    common_watchlist?: string[];
    common_watchlist_count?: number;
    watchlist_count?: number;
    watched_count?: number;

    // Social
    is_friend?: boolean;
    is_pending?: boolean;
    mutual_friends?: any[];
    mutual_friends_count?: number;

    // Suggestions
    suggested_from_you?: MovieSuggestion[];
    suggested_to_you?: MovieSuggestion[];
    improve_your_match_by_watching?: MovieSuggestion[];

    // Matching
    commonality_percent?: number;
}
