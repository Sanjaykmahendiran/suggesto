"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, Shuffle, Sparkles, Clock, Star, Plus, Play, X } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import WatchNowFilterComponent from "@/components/watchnow-filter"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from 'js-cookie'
import Link from "next/link"

// Movie interface based on API response
interface Movie {
  watchlist_id: string
  movie_id: number
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  status: string
  added_date: string
  overview?: string
}

export default function WatchNow() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilter, setShowFilter] = useState(false)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlaylist, setShowPlaylist] = useState(false)

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const userId = Cookies.get('userID') || ''
        const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchlist&user_id=${userId}&status=planned`)

        if (!response.ok) {
          throw new Error('Failed to fetch movies')
        }

        const data = await response.json()
        setMovies(data)
        setError(null)
      } catch (err) {
        setError('Failed to load movies')
        console.error('Error fetching movies:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  // Smart suggestion based on time
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay() // 0 is Sunday, 6 is Saturday

    if ((day === 5 || day === 6) && hour >= 20) {
      setSuggestion("Perfect for a Friday night?")
    } else if (hour >= 22) {
      setSuggestion("Looking for something before bed?")
    } else if (hour >= 17 && hour < 20) {
      setSuggestion("Evening movie time?")
    } else {
      setSuggestion(null)
    }
  }, [])

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      // Skip this movie
      shuffleNext()
    } else {
      // Like this movie
      setExpandedCard(currentIndex)
    }
  }

  const shuffleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }

  const feelingLucky = () => {
    if (movies.length > 0) {
      const randomIndex = Math.floor(Math.random() * movies.length)
      setCurrentIndex(randomIndex)
      setExpandedCard(randomIndex)
    }
  }

  const handleViewDetail = (movieId: number) => {
    router.push(`/movie-detail-page?movie_id=${movieId}`)
  }

  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist)
  }

  const formatReleaseYear = (dateString: string) => {
    return new Date(dateString).getFullYear().toString()
  }

  // Helper function to format full date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Helper function to get poster URL
  const getPosterUrl = (path: string) => {
    return path.includes('http') ? path : `https://image.tmdb.org/t/p/w500${path}`
  }

  return (
    <div className="bg-[#181826] text-white min-h-screen mb-18">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Watch List</h1>
          <p className="text-xs text-gray-400">
            Find your next favorite from your planned list
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className={`text-gray-300 ${showPlaylist ? "bg-[#292938] rounded-full p-2" : ""}`}
            onClick={togglePlaylist}
          >
            {showPlaylist ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            )}
          </button>
          {!showPlaylist && (
            <>
              <button className="text-gray-300" onClick={() => setShowFilter(true)}>
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <button className="text-gray-300" onClick={shuffleNext}>
                <Shuffle className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </header>

      {showPlaylist ? (
        <div className="px-4 pb-20">
          {loading ? (
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="flex gap-4 py-3 border-b border-gray-800">
                <Skeleton className="flex-shrink-0 w-16 h-24 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/4 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          ) : movies.length > 0 ? (
            movies.map((movie) => (
              <Link href={`/movie-detail-page?movie_id=${movie.movie_id}`} key={movie.watchlist_id}>
                <div className="flex gap-4 py-3 border-b border-gray-800">
                  <div className="flex-shrink-0 w-16 h-24 relative rounded-md overflow-hidden">
                    {movie.poster_path ? (
                      <Image
                        src={getPosterUrl(movie.poster_path)}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{movie.title}</h3>
                    <p className="text-gray-400 text-sm mb-1">{formatDate(movie.release_date)}</p>
                    <p className="text-gray-300 text-sm line-clamp-2">{movie.overview || "No overview available"}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-4">
                <Plus className="w-12 h-12 text-[#9370ff] mx-auto" />
              </div>
              <h3 className="text-xl font-bold mb-2">No planned movies</h3>
              <p className="text-gray-400 mb-4">
                Your planned watchlist is empty. Add some movies to get started!
              </p>
              <button
                className="text-[#9370ff] font-medium"
                onClick={() => router.push("/search")}
              >
                Find movies to add
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="top-0 bg-[#181826] z-10 px-4 pt-2 pb-4">
            <div className="flex items-center bg-[#292938] rounded-full px-4 py-4">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by title, genre..."
                className="bg-transparent w-full focus:outline-none text-gray-300"
                onClick={() => router.push("/search")}
              />
            </div>
          </div>

          {/* Smart Suggestion */}
          {suggestion && (
            <div className="px-4 mb-4">
              <div className="bg-[#292938]/50 rounded-lg p-3 flex items-center">
                <Sparkles className="w-4 h-4 text-[#9370ff] mr-2" />
                <p className="text-sm text-gray-200">{suggestion}</p>
              </div>
            </div>
          )}

          {/* Movie Cards Stack */}
          <div className="relative h-[450px] px-4 mb-6">
            {loading ? (
              <div className="absolute inset-x-4 rounded-xl overflow-hidden bg-[#292938] shadow-lg" style={{ top: "10px", bottom: "10px" }}>
                <Skeleton className="h-3/5 w-full" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex gap-3 mb-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ) : error ? (
              <div className="absolute inset-x-4 rounded-xl overflow-hidden bg-[#292938] shadow-lg flex items-center justify-center" style={{ top: "10px", bottom: "10px" }}>
                <div className="text-center p-6">
                  <div className="mb-4">
                    <X className="w-12 h-12 text-red-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Error Loading Movies</h3>
                  <p className="text-gray-400 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-[#9370ff] text-white px-6 py-2 rounded-lg"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {expandedCard !== null && movies.length > 0 ? (
                  <motion.div
                    key="expanded"
                    initial={{ scale: 0.9, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute inset-0 bg-[#292938] rounded-xl overflow-hidden"
                  >
                    <div className="relative h-[250px]">
                      <Image
                        src={movies[expandedCard].backdrop_path || movies[expandedCard].poster_path || "/placeholder.svg"}
                        alt={movies[expandedCard].title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181826] to-transparent"></div>
                      <button
                        className="absolute top-4 right-4 bg-black/50 rounded-full p-2"
                        onClick={() => setExpandedCard(null)}
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    <div className="p-4">
                      <h2 className="text-xl font-bold mb-2">{movies[expandedCard].title}</h2>

                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" fill="rgb(250 204 21)" />
                          <span className="text-sm">{movies[expandedCard].rating}</span>
                        </div>
                        <span className="text-sm bg-[#9370ff]/20 text-[#9370ff] px-2 py-0.5 rounded">
                          {formatReleaseYear(movies[expandedCard].release_date)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-300 mb-4">
                        Release Date {new Date(movies[expandedCard].release_date).toLocaleDateString()}
                      </p>

                      <div className="flex gap-3">
                        <button
                          className="flex-1 bg-[#9370ff] text-white py-3 rounded-lg flex items-center justify-center gap-2"
                          onClick={() => handleViewDetail(movies[expandedCard].movie_id)}
                        >
                          <Play className="w-4 h-4" fill="white" />
                          View Detail
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {movies.length > 0 ? (
                      [2, 1, 0].map((offset) => {
                        const index = (currentIndex + offset) % movies.length
                        return (
                          <motion.div
                            key={movies[index].movie_id}
                            initial={offset === 0 ? { scale: 0.8, y: 20, opacity: 0 } : {}}
                            animate={{
                              scale: 1 - offset * 0.05,
                              y: offset * 15,
                              opacity: 1 - offset * 0.2,
                              zIndex: 10 - offset,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-x-4 rounded-xl overflow-hidden bg-[#292938] shadow-lg"
                            style={{ top: "10px", bottom: "10px" }}
                            onClick={() => offset === 0 && setExpandedCard(index)}
                            drag={offset === 0 ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.7}
                            onDragEnd={(e, { offset, velocity }) => {
                              if (offset.x < -100) handleSwipe("left")
                              else if (offset.x > 100) handleSwipe("right")
                            }}
                          >
                            {offset === 0 && (
                              <div className="absolute inset-x-0 top-4 z-20 flex justify-center">
                                <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                                  Swipe left to skip • Swipe right or tap to view
                                </div>
                              </div>
                            )}
                            <div className="relative h-full">
                              <Image
                                src={movies[index].backdrop_path || movies[index].poster_path || "/placeholder.svg"}
                                alt={movies[index].title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#181826] via-transparent to-transparent"></div>

                              <div className="absolute inset-x-0 bottom-0 p-4">
                                <h2 className="text-xl font-bold mb-2">{movies[index].title}</h2>
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 mr-1" fill="rgb(250 204 21)" />
                                    <span className="text-sm">{movies[index].rating}</span>
                                  </div>
                                  <span className="text-sm bg-[#9370ff]/20 text-[#9370ff] px-2 py-0.5 rounded">
                                    {formatReleaseYear(movies[index].release_date)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-[#292938] rounded-xl p-6 text-center">
                        <div className="mb-4">
                          <Plus className="w-12 h-12 text-[#9370ff] mx-auto" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No planned movies</h3>
                        <p className="text-gray-400 mb-4">
                          Your planned watchlist is empty. Add some movies to get started!
                        </p>
                        <button
                          className="text-[#9370ff] font-medium"
                          onClick={() => router.push("/search")}
                        >
                          Find movies to add
                        </button>
                      </div>
                    )}
                  </>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-4 mb-6">
            {loading ? (
              <Skeleton className="w-full h-14 rounded-xl" />
            ) : (
              <button
                onClick={feelingLucky}
                disabled={movies.length === 0}
                className="w-full bg-gradient-to-r from-[#9370ff] to-[#6c5ce7] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5" />
                I'm Feeling Lucky
              </button>
            )}
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation currentPath="/watch-now" />

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 backdrop-blur-xs bg-white/30 transition-all duration-300"
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute bottom-0 w-full shadow-xl"
                >
                  <WatchNowFilterComponent onClick={() => setShowFilter(false)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}