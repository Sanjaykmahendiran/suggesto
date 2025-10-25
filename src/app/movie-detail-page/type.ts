export type WatchlistData = {
    watch_id: number
    user_id: number
    movie_id: number
    friend_id: number
    status: string
    created_date: string
}

export interface Friend {
    user_id: number;
    name: string;
    imgname: string;
}

export interface MovieBuddyStatus {
    count: number;
    friends: Friend[];
}

export interface MovieBuddies {
    watched: MovieBuddyStatus;
    planned: MovieBuddyStatus;
}


export type Movie = {
    available_on_ott: boolean;
    movie_buddies?: MovieBuddies;
    actor_id: string;
    status?: string;
    movie_id: number;
    movie_code?: string;
    is_tmdb?: number;
    title: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    video: string;
    release_date: string;
    rating: string | number;
    sug_ratings?: any;
    language: string;
    popularity?: string;
    tagline?: string;
    revenue?: string;
    is_adult: string;
    actor1?: number;
    actor2?: number;
    actor3?: number;
    actor4?: number;
    rated: number;
    liked: number;
    genres: string[];
    watchlist_data: WatchlistData[];
    actors: {
        actor1?: {
            actor_id: number;
            name: string;
            image: string;
        };
        actor2?: {
            actor_id: number;
            name: string;
            image: string;
        };
        actor3?: {
            actor_id: number;
            name: string;
            image: string;
        };
        actor4?: {
            actor_id: number;
            name: string;
            image: string;
        };
    };
    director?: {
        actor_id: number;
        name: string;
        image: string;
    };
    music_director?: {
        actor_id: number;
        name: string;
        image: string;
    };
    cinematographer?: {
        actor_id: number;
        name: string;
        image: string;
    };
    editor?: {
        actor_id: number;
        name: string;
        image: string;
    };
    created_date?: string;
    modified_date?: string;
};



// export const mockMovies = [
//     {
//         movie_id: 1,
//         title: "Inception",
//         poster_path: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
//         rating: 8.8,
//         release_date: "2010-07-16",
//         language: "en",
//     },
//     {
//         movie_id: 2,
//         title: "Interstellar",
//         poster_path: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
//         rating: 8.6,
//         release_date: "2014-11-07",
//         language: "en",
//     },
//     {
//         movie_id: 3,
//         title: "Parasite",
//         poster_path: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
//         rating: 8.5,
//         release_date: "2019-05-30",
//         language: "ko",
//     },
//     {
//         movie_id: 4,
//         title: "Spirited Away",
//         poster_path: "https://image.tmdb.org/t/p/w500/oRvMaJOmapypFUcQqpgHMZA6qL9.jpg",
//         rating: 8.6,
//         release_date: "2001-07-20",
//         language: "ja",
//     },
//     {
//         movie_id: 5,
//         title: "The Dark Knight",
//         poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
//         rating: 9.0,
//         release_date: "2008-07-18",
//         language: "en",
//     },
// ]