"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, Clock, Star, Plus, Play, X, ArrowLeft, Heart, Shuffle, Film } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import WatchNowFilterComponent from "@/components/watchnow-filter"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from 'js-cookie'
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { Movie, FilteredMovie } from "@/app/watch-list/type"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import NotFound from "@/components/notfound"

type SearchState = "initial" | "results" | "not-found"

const SkeletonMovie = () => (
  <div className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden">
    <Skeleton className="h-full w-full bg-[#292938]" />
    <div className="absolute bottom-2 left-2 right-2">
      <Skeleton className="h-4 w-24 bg-[#292938]/80 mb-1" />
    </div>
  </div>
)

export default function WatchNow() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilter, setShowFilter] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showWatchlist, setShowWatchlist] = useState(false)

  // Filter related states
  const [filteredMovies, setFilteredMovies] = useState<FilteredMovie[]>([])
  const [isFiltered, setIsFiltered] = useState(false)

  // Search related states
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchState, setSearchState] = useState<SearchState>("initial")
  const [searchFilteredMovies, setSearchFilteredMovies] = useState<Movie[]>([])
  const [lastSearches, setLastSearches] = useState<string[]>([])
  const { user, setUser } = useUser()

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

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchState("initial")
      return
    }

    const lowercaseSearch = searchTerm.toLowerCase()

    // Filter movies based on search term (title and overview)
    const results = movies.filter((movie) =>
      movie.title.toLowerCase().includes(lowercaseSearch) ||
      (movie.overview && movie.overview.toLowerCase().includes(lowercaseSearch))
    )

    if (results.length > 0) {
      setSearchFilteredMovies(results)
      setSearchState("results")
    } else {
      setSearchState("not-found")
    }
  }, [searchTerm, movies])

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
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    } else {
      // Like this movie - go directly to movie detail page
      const currentMovie = movies[currentIndex]
      router.push(`/movie-detail-page?movie_id=${currentMovie.movie_id}`)
    }
  }

  const handleViewDetail = (movieId: number) => {
    router.push(`/movie-detail-page?movie_id=${movieId}`)
  }

  const togglePlaylist = () => {
    setShowWatchlist(!showWatchlist)
  }

  const formatReleaseYear = (dateString: string) => {
    return new Date(dateString).getFullYear().toString()
  }

  // Helper function to get poster URL
  const getPosterUrl = (path: string) => {
    return path.includes('http') ? path : `https://suggesto.xyz/App/${path}`
  }

  // Search handlers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchState("initial")
  }

  const handleLastSearchClick = (search: string) => {
    setSearchTerm(search)
  }

  const removeFromLastSearches = (search: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLastSearches(lastSearches.filter((item) => item !== search))
  }

  const clearAllLastSearches = () => {
    setLastSearches([])
  }

  const addToLastSearches = (term: string) => {
    if (term.trim() && !lastSearches.includes(term)) {
      setLastSearches(prev => [term, ...prev.slice(0, 4)])
    }
  }

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      addToLastSearches(searchTerm.trim())
    }
  }

  const openSearch = () => {
    setShowSearch(true)
  }

  const closeSearch = () => {
    setShowSearch(false)
    setSearchTerm("")
    setSearchState("initial")
  }

  // Handle random movie suggestion
  const handleSuggestMovie = () => {
    if (movies.length > 0) {
      const randomIndex = Math.floor(Math.random() * movies.length)
      setCurrentIndex(randomIndex)
    }
  }

  // Handle filter results
  const handleApplyFilters = (filterResults: FilteredMovie[]) => {
    setFilteredMovies(filterResults)
    setIsFiltered(true)
    setShowWatchlist(true)
  }

  // Clear filters
  const clearFilters = () => {
    setFilteredMovies([])
    setIsFiltered(false)
  }

  // Get movies to display in watchlist view
  const getMoviesToDisplay = () => {
    if (isFiltered) {
      return filteredMovies.map(movie => ({
        watchlist_id: movie.movie_id.toString(),
        movie_id: movie.movie_id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.poster_path, // Use poster as backdrop fallback
        release_date: movie.release_date,
        rating: movie.rating,
        status: 'planned',
        added_date: new Date().toISOString(),
        overview: movie.overview
      }))
    }
    return movies
  }

  // If search is open, show search interface
  if (showSearch) {
    return (
      <div className="min-h-screen bg-[#181826] text-white">
        <div className="w-full max-w-md mx-auto p-4">
          <div className="flex items-center mb-6">
            <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={closeSearch}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold">Search Watchlist</h1>
          </div>

          <div className="relative mb-6">
            <div className="flex items-center bg-[#292938] rounded-full px-4 py-4">
              <Search size={20} className="text-gray-400 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="Search your watchlist..."
                className="bg-transparent border-none outline-none flex-1 text-white"
                autoFocus
              />
              {searchTerm && (
                <button onClick={clearSearch} className="ml-2">
                  <X size={20} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {searchState === "initial" && (
            <div>
              {lastSearches.length > 0 && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Recent Searches</h2>
                    <button onClick={clearAllLastSearches} className="text-sm text-red-500">
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {lastSearches.map((search, index) => (
                      <div
                        key={index}
                        onClick={() => handleLastSearchClick(search)}
                        className="flex items-center justify-between border-b border-[#292938] p-3 cursor-pointer hover:bg-[#292938]/30 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Clock size={18} className="text-gray-400 mr-3" />
                          <span>{search}</span>
                        </div>
                        <button onClick={(e) => removeFromLastSearches(search, e)} className="text-gray-400">
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h2 className="text-lg font-medium mb-4">Your Planned Movies ({movies.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {movies.slice(0, 6).map((movie) => (
                  <Link href={`/movie-detail-page?movie_id=${movie.movie_id}`} key={movie.watchlist_id}>
                    <motion.div
                      className="relative w-full h-[200px] rounded-lg overflow-hidden cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Image
                        src={getPosterUrl(movie.poster_path)}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute top-2 right-2 bg-[#9370ff] text-white text-xs px-1.5 py-0.5 rounded">
                        {movie.rating}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <h3 className="text-sm font-medium text-white line-clamp-2">{movie.title}</h3>
                        <p className="text-xs text-gray-300">{formatReleaseYear(movie.release_date)}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {searchState === "results" && (
            <div>
              <h2 className="text-lg font-medium mb-4">Found ({searchFilteredMovies.length})</h2>

              <div className="space-y-4">
                {searchFilteredMovies.map((movie) => (
                  <Link href={`/movie-detail-page?movie_id=${movie.movie_id}`} key={movie.watchlist_id}>
                    <div className="flex bg-[#292938] rounded-lg overflow-hidden hover:bg-[#333342] transition-colors">
                      <div className="relative w-24 h-32 flex-shrink-0">
                        <Image
                          src={getPosterUrl(movie.poster_path)}
                          alt={movie.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#9370ff] text-xs font-bold px-2 py-0.5 rounded text-white">
                          {movie.rating}
                        </div>
                      </div>
                      <div className="flex-1 p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-white">{movie.title}</h3>
                          <button className="text-gray-400">
                            <Heart size={20} />
                          </button>
                        </div>
                        <p className="text-xs text-[#9370ff] mb-1">{formatReleaseYear(movie.release_date)}</p>
                        <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                          {movie.overview || "No description available"}
                        </p>
                        <div className="flex text-xs text-gray-400 space-x-2">
                          <span>Added: {new Date(movie.added_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {searchState === "not-found" && (
            <div className="flex flex-col items-center justify-center text-center mt-16">
              <div className="w-16 h-16 bg-[#292938] rounded-lg flex items-center justify-center mb-4">
                <Search size={32} className="text-[#9370ff]" />
              </div>
              <h2 className="text-2xl font-medium mb-2">
                No movies found
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                We couldn't find "{searchTerm}" in your watchlist
              </p>
              <button
                onClick={clearSearch}
                className="text-[#9370ff] font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const moviesToDisplay = getMoviesToDisplay()

  return (
    
      // <PageTransitionWrapper>
        <div className="min-h-screen bg-[#181826]">
          {/* Header */}
          <header className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Watch List
                </h1>
                <p className="text-xs text-gray-400">
                  Explore your planned picks
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="text-gray-300  rounded-full "
                onClick={openSearch}
              >
                <Search size={20} />
              </button>
              <button
                className={`text-gray-300 ${showWatchlist ? "bg-[#292938] rounded-full p-2" : ""}`}
                onClick={togglePlaylist}
              >
                {showWatchlist ? (
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
              {!showWatchlist && (
                <button className="text-gray-300" onClick={() => setShowFilter(true)}>
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              )}
              <Link href="/profile">
                <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                  <Image
                    src={user?.imgname || "/placeholder.svg"}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            </div>
          </header>

          {/* Clear Filters Button */}
          {isFiltered && (
            <div className="px-4 mb-4 flex items-center justify-between p-3">
              <div>
                <h1 className="text-xl font-bold text-white">
                  Filtered Results
                </h1>
                <p className="text-xs text-gray-400">
                  {filteredMovies.length} movies found
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 bg-[#292938] text-white px-4 py-2 rounded-lg text-sm"
              >
                <X size={16} />
                Clear Filters
              </button>
            </div>
          )}

          {showWatchlist ? (
            <div className="grid grid-cols-2 gap-4 p-4">
              {loading ? (
                <>
                  <SkeletonMovie />
                  <SkeletonMovie />
                  <SkeletonMovie />
                  <SkeletonMovie />
                </>
              ) : (
                moviesToDisplay.map((movie) => (
                  <Link href={`/movie-detail-page?movie_id=${movie.movie_id}`} key={movie.watchlist_id || movie.movie_id}>
                    <motion.div
                      key={movie.movie_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: movie.movie_id * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative w-full h-[200px] rounded-lg overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={getPosterUrl(movie.poster_path)}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                        {movie.rating}
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                      </div>
                      {/* Show genres for filtered results */}
                      {isFiltered && 'genres' in movie && (
                        <div className="absolute bottom-8 left-2">
                          <div className="flex flex-wrap gap-1">
                            {(movie as any).genres.slice(0, 2).map((genre: string, index: number) => (
                              <span key={index} className="text-xs bg-[#9370ff]/80 text-white px-1.5 py-0.5 rounded">
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                ))
              )}
            </div>

          ) : (
            <>
              {/* Smart Suggestion */}
              <div className="px-4 mb-4">
                <div className="flex justify-between items-start gap-4">
                  {suggestion && (
                    <div className="bg-[#292938]/50 rounded-lg p-3 flex items-center">
                      <Clock className="w-4 h-4 text-[#9370ff] mr-2" />
                      <p className="text-sm text-gray-200">{suggestion}</p>
                    </div>
                  )}
                  <div className="ml-auto flex items-center gap-2 bg-[#6c5ce7] text-white px-4 py-2 rounded-xl shadow-md">
                    <Film className="w-5 h-5" />
                    <span className="ml-1 bg-white text-[#6c5ce7] font-semibold px-2 py-0.5 rounded-md text-sm">
                      {loading ? '00' : movies.length.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

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
                    {movies.length > 0 ? (
                      [2, 1, 0].map((offset) => {
                        const index = (currentIndex + offset) % movies.length
                        return (
                          <motion.div
                            key={movies[index].movie_id}
                            initial={offset === 0 ? { scale: 0.8, y: 20, opacity: 0 } : {}}
                            animate={{
                              scale: 1 - offset * 0.05,
                              y: offset * 22,
                              opacity: 1 - offset * 0.2,
                              zIndex: 10 - offset,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-x-4 h-[500px] rounded-xl overflow-hidden bg-[#292938] border-10 shadow-lg"
                            style={{ top: "10px", bottom: "10px" }}
                            onClick={() => offset === 0 && handleViewDetail(movies[index].movie_id)}
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
                                  Swipe left to skip • Swipe right or tap to watch
                                </div>
                              </div>
                            )}
                            <div className="relative h-full">
                              <Image
                                src={getPosterUrl(movies[index].poster_path || movies[index].backdrop_path || "/placeholder.svg")}
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
                                  <span className="text-sm bg-[#9370ff]/20 text-[#9370ff] text-white px-2 py-0.5 rounded">
                                    {formatReleaseYear(movies[index].release_date)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-[#292938] rounded-xl p-4 text-center">
                        <NotFound
                          title="No Movies Planned"
                          description="Your watchlist is empty. Start adding movies to plan your next watch!"   />
                        {/* <h3 className="text-xl font-bold mb-2">No planned movies</h3>
                        <p className="text-gray-400 mb-4">
                          Your planned watchlist is empty. Add some movies to get started!
                        </p> */}
                        <button
                          className="text-primary font-medium mt-4"
                          onClick={() => router.push("/add-movie")}
                        >
                          Find movies to add
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* Bottom Navigation */}
              <BottomNavigation currentPath="/watch-list" />

              {/* Filter Panel */}
              <AnimatePresence>
                {showFilter && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 backdrop-blur-xs bg-black/30 transition-all duration-300"
                  >
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="absolute bottom-0 w-full shadow-xl"
                    >
                      <WatchNowFilterComponent
                        onClick={() => setShowFilter(false)}
                        onApplyFilters={handleApplyFilters}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Floating Action Buttons */}
          <div className="fixed bottom-24 left-4 right-4 flex justify-between items-end z-40">
            {/* Left Side: Suggest Movie Button */}
            <div>
              {!loading && movies.length > 0 && !showWatchlist && (
                <motion.button
                  className="w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSuggestMovie}
                >
                  <Shuffle className="w-6 h-6 text-white" />
                </motion.button>
              )}
            </div>

            {/* Right Side: Add Movie Button */}
            <div>
              <motion.button
                className="w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg "
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/add-movie")}
              >
                <Plus className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      // {/* </PageTransitionWrapper> */}
    
  )
}