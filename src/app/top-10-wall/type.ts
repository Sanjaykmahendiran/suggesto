import defaultMovieImage from "@/assets/default-movie-image.png"

export type Top10MovieEntry = {
    top_id: number | string
    order_no: number
    user_id: string
    is_liked: boolean
    is_saved: boolean
    movie: Movie
    isMockData?: boolean
}

export type Movie = {
    movie_id: number
    title: string
    poster_path?: string
    release_date?: string
    language?: string
    rating?: number
}

 export const getMockData = (): Top10MovieEntry[] => [
    {
        top_id: "mock_1",
        order_no: 1,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 1,
            title: "Movie 1",
            poster_path: defaultMovieImage.src,
            release_date: "2023-01-01",
            language: "en",
            rating: 8.5
        }
    },
    {
        top_id: "mock_2",
        order_no: 2,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 2,
            title: "Movie 2",
            poster_path: defaultMovieImage.src,
            release_date: "2023-02-01",
            language: "en",
            rating: 8.2
        }
    },
    {
        top_id: "mock_3",
        order_no: 3,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 3,
            title: "Movie 3",
            poster_path: defaultMovieImage.src,
            release_date: "2023-03-01",
            language: "en",
            rating: 8.0
        }
    },
    {
        top_id: "mock_4",
        order_no: 4,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 4,
            title: "Movie 4",
            poster_path: defaultMovieImage.src,
            release_date: "2023-04-01",
            language: "en",
            rating: 7.8
        }
    },
    {
        top_id: "mock_5",
        order_no: 5,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 5,
            title: "Movie 5",
            poster_path: defaultMovieImage.src,
            release_date: "2023-05-01",
            language: "en",
            rating: 7.5
        }
    },
    {
        top_id: "mock_6",
        order_no: 6,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 6,
            title: "Movie 6",
            poster_path: defaultMovieImage.src,
            release_date: "2023-06-01",
            language: "en",
            rating: 7.3
        }
    },
    {
        top_id: "mock_7",
        order_no: 7,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 7,
            title: "Movie 7",
            poster_path: defaultMovieImage.src,
            release_date: "2023-07-01",
            language: "en",
            rating: 7.0
        }
    },
    {
        top_id: "mock_8",
        order_no: 8,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 8,
            title: "Movie 8",
            poster_path: defaultMovieImage.src,
            release_date: "2023-08-01",
            language: "en",
            rating: 6.8
        }
    },
    {
        top_id: "mock_9",
        order_no: 9,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 9,
            title: "Movie 9",
            poster_path: defaultMovieImage.src,
            release_date: "2023-09-01",
            language: "en",
            rating: 6.5
        }
    },
    {
        top_id: "mock_10",
        order_no: 10,
        user_id: "mock",
        is_liked: false,
        is_saved: false,
        isMockData: true,
        movie: {
            movie_id: 10,
            title: "Movie 10",
            poster_path: defaultMovieImage.src,
            release_date: "2023-10-01",
            language: "en",
            rating: 6.2
        }
    }
]