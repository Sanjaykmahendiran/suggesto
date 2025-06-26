export interface Movie {
  movie_id?: number;
  id?: number;
  movie_code?: string;
  is_tmdb?: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  rating?: string;
  language?: string;
  is_adult?: string;
  status?: number;
}

export interface MovieResult {
  movie_id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  rating: string;
  language: string;
  is_adult: string;
  genres: string[];
  otts: {
    ott_id: number;
    name: string;
    logo_url: string;
  }[];
}

export interface Genre {
  genre_id: number;
  genre_code: string;
  tmdb_id: number;
  name: string;
  status: number;
}

export interface Language {
  language_id: number;
  code: string;
  name: string;
  status: number;
}

export interface OTT {
  ott_id: number;
  name: string;
  logo_url: string;
  status: number;
}

export interface Mood {
  mood_name: string ;
  mood_id:  number
  image?: string
}