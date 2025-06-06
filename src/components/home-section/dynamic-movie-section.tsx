"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Sparkles, TrendingUp, Clock, Star, Users, Bot } from "lucide-react"
import React from "react"

type Movie = {
  movie_id: string | number
  title: string
  poster_path: string
  rating: number | string
  release_date: string
  language: string
}

interface DynamicMovieSectionProps {
  movies: Movie[]
  title: string
  sectionType?: string
}

// Icon mapping for different section types
const getIconForSection = (sectionType: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    watchlist: <Sparkles className="w-5 h-5 text-primary" />,
    trending: <TrendingUp className="w-5 h-5 text-primary" />,
    classic: <Clock className="w-5 h-5 text-primary" />,
    popular: <Users className="w-5 h-5 text-primary" />,
    ai: <Bot className="w-5 h-5 text-primary" />,
    default: <Star className="w-5 h-5 text-primary" />
  }
  return iconMap[sectionType] || iconMap.default
}

export const DynamicMovieSection: React.FC<DynamicMovieSectionProps> = ({
  movies,
  title,
  sectionType = "default"
}) => {
  const router = useRouter()

  if (!movies || movies.length === 0) {
    return null
  }

  const icon = getIconForSection(sectionType)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 mb-8"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm text-primary hover:text-white transition-colors"
          onClick={() => {
            console.log(`See all for ${title}`)
          }}
        >
          See All
        </motion.button>
      </div>

      {/* Movies Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {movies.map((movie, index) => (
          <motion.div
            key={`${movie.movie_id}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
            onClick={() => router.push(`/movie-detail-page?movie_id=${movie.movie_id}`)}
          >
            <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-[#292938]">
              {/* Rest of your existing movie card content remains the same */}
              <img
                src={`https://suggesto.xyz/App/${movie.poster_path}`}
                alt={movie.title}
                className="min-w-[120px] h-[180px] object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-movie.jpg'
                }}
              />

              {/* Rating Badge */}
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs font-medium text-white">
                    {parseFloat(movie.rating.toString()).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Movie Info Overlay at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <span className="uppercase font-medium">
                      {movie.language}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
