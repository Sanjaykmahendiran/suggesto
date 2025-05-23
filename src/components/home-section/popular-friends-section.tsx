"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Movie = {
  movie_id: string | number
  title: string
  poster_path: string
  rating: number | string
  release_date: string
  language: string
}

type PopularWithFriendsSectionProps = {
  movies: Movie[]
  title?: string
}

export const PopularWithFriendsSection = ({
  movies,
  title = "Popular Among Friends",
}: PopularWithFriendsSectionProps) => {
  const router = useRouter()

  if (!movies || movies.length === 0) {
    return null
  }

  return (
    <div className="px-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#9370ff]" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <a href="/friends-popular" className="text-sm text-[#9370ff]">
          See All
        </a>
      </div>

      <div className="bg-[#292938] rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="relative">
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-[#181826] w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="Friend 1" />
                  <AvatarFallback>F1</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-[#181826] w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="Friend 2" />
                  <AvatarFallback>F2</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-[#181826] w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="Friend 3" />
                  <AvatarFallback>F3</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium">{movies.length} popular movies</p>
              <p className="text-xs text-gray-400">Your friends are watching</p>
            </div>
          </div>
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
              onClick={() => router.push(`/movie-deatil-page?movie_id=${movie.movie_id}`)}
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
              <div className="absolute top-2 right-2 bg-[#9370ff] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{parseFloat(movie.rating.toString()).toFixed(1)}</span>
              </div>
              <div className="absolute bottom-2 left-2">
                <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded text-gray-300">
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                  <span className="text-xs bg-black/30 px-1.5 py-0.5 rounded text-gray-300 uppercase">
                    {movie.language}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
