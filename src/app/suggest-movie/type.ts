import { Key, ReactNode } from "react"

export interface SuggestedMovie {
  group_id: string
  suggested_on: string
  movies: Array<{
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
    suggested_by_name: string
    suggested_to_name: string
    genres: string[]
    is_boosted: number
    viewed_count: number
  }>
}

export interface ReceivedMovie {
  suggested_tophoto: string | undefined
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
  suggested_by_name: string
  genres: string[]
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
  watchlist_users: string
  watch_id?: Key | null | undefined
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
  user_id: string
  name: string
  imgname?: string
  location: string
  payment_status?: number
}

export type Request = {
  request_id: string
  request_text: string
  to_users: Array<{
    user_id: number
    name: string
    imgname: string
  }>
  created_date: string
  genre: string
  status: string
}

export type Responder = {
  responder_detail: {
    name: string
    profile_pic?: string
  }
  movies: Array<{
    movie_id: string
    poster_path?: string
    title: string
    rating?: number
    response_note?: string
    in_watchlist?: number
  }>
}

export type SuggestionRequestType = {
  genre: string
  request_id: number
  request_text: string
  question?: string | null
  created_date: string
  from_user: {
    user_id: number
    name: string
    profile_pic: string
  }
  is_suggested: number
}

export type SuggestedMovieDetail = {
    crew: any
    cast: any
    video: any
    actor_id: string
    movie_buddies: MovieBuddy[] | undefined
    movsug_id: number
    group_id: string
    movie_id: number
    title: string
    poster_path: string
    backdrop_path: string
    release_date: string
    rating: string
    genres: string[]
    suggested_by: {
        profile_photo: string | undefined
        user_id: number
        name: string
        imgname: string
    }
    suggested_to: {
        user_id: number
        name: string
        imgname: string
    }
    status: string
    note: string
    added_date: string
    already_in_watchlist: boolean
    liked: number
    rated: number
    available_on_ott: any[]
    group_viewers: Array<{
        user_id: number
        name: string
        imgname: string
        status: string
        viewed_on: string
    }>
    overview?: string
    language: string
    is_adult: string
}