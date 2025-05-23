"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import React from "react"

type Movie = {
  movie_id: string | number
  title: string
  poster_path: string
  rating: number | string
  release_date: string
}

type WatchlistSectionProps = {
  movies: Movie[]
  title?: string
}

export const WatchlistSection: React.FC<WatchlistSectionProps> = ({
  movies,
  title = "Your Watchlist",
}) => {
  const router = useRouter()

  if (!movies || movies.length === 0) {
    return null
  }

  return (
    <div className="px-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <a href="/watchlist" className="text-sm text-primary">
          See All
        </a>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {movies.map((movie, index) => (
          <motion.div
            key={movie.movie_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
            onClick={() => router.push(`/movie-detail-page?movie_id=${movie.movie_id}`)}
          >
            <img
              src={
                movie.poster_path.startsWith("http")
                  ? movie.poster_path
                  : `https://suggesto.xyz/App/${movie.poster_path}`
              }
              alt={movie.title}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
              {parseFloat(movie.rating.toString()).toFixed(1)}
            </div>
            <div className="absolute bottom-2 left-2">
              <h3 className="text-sm font-medium text-white">{movie.title}</h3>
              <p className="text-xs text-gray-300">
                {new Date(movie.release_date).getFullYear()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
