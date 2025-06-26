export interface SuggestedMovie {
  suggested_by_name: string
  suggested_to_name: string
  genres: string
  name: string
  movsug_id: number
  movie_id: number | string
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  status: string
  added_date: string
  note?: string
}

export interface ReceivedMovie {
  suggested_by_name: string
  name: string
  genres: any
  movsug_id: number
  movie_id: number
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  status: string
  added_date: string
  note?: string
}

export interface ReceivedSuggestion {
  movsug_id: number 
  movie_id: number | string
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  status: string
  added_date: string
  note: string
  suggested_by_name: string
  suggested_by_profile: string
}

export interface Movie {
  movie_id: number | string
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  language: string
  is_adult: string
  genres: string[]
  otts: Array<{
    ott_id: number
    name: string
    logo_url: string
  }>
}

export interface Friend {
  friend_id: number
  name: string
  profile_pic: string
  joined_date: string
  genre: string
}

export type User = {
  location: string
  user_id: string
  name: string
  imgname?: string
}

export type Request = {
    request_id: string;
    request_text: string;
    to_users: {
        user_id: number;
        name: string;
        imgname: string;
    }[];
    created_date: string;
    genre: string;
    status: string;
};

export type Responder = {
    responder_detail: {
        name: string;
        profile_pic?: string;
    };
    movies: {
        movie_id: string;
        poster_path?: string;
        title: string;
        rating?: number;
        response_note?: string;
        in_watchlist?: number;
    }[];
};

export type SuggestionRequestType = {
    request_text: string
    request_id: number;
    question: string | null;
    created_date: string;
    from_user: {
        user_id: number;
        name: string;
        profile_pic: string;
    };
    is_suggested: number;
};