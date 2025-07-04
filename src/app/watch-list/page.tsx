"use client"

import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
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
import WatchListNotFound from "@/assets/not-found-watchlist.png"
import toast from "react-hot-toast"
import DefaultImage from "@/assets/default-user.webp"
import CachedImage from "@/components/CachedImage"
import { useImagePreloader } from "@/hooks/useCachedImage"

type SearchState = "initial" | "results" | "not-found"

const SkeletonMovie = () => (
  <div className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden">
    <Skeleton className="h-full w-full bg-[#2b2b2b]" />
    <div className="absolute bottom-2 left-2 right-2">
      <Skeleton className="h-4 w-24 bg-[#2b2b2b]/80 mb-1" />
    </div>
  </div>
)

export default function Watchlist() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilter, setShowFilter] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWatchlist, setShowWatchlist] = useState(false)

  // Pagination states
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([])
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const [watchlistHasMore, setWatchlistHasMore] = useState(true)
  const [watchlistOffset, setWatchlistOffset] = useState(0)
  const [watchlistInitialLoad, setWatchlistInitialLoad] = useState(true)
  const watchlistObserverRef = useRef<HTMLDivElement>(null)

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
  const [totalCount, setTotalCount] = useState(0)
  const { preloadImages } = useImagePreloader()

  // Fetch watchlist movies with pagination
  const fetchWatchlistMovies = useCallback(async (offset: number = 0, isLoadMore: boolean = false) => {
    try {
      if (!isLoadMore) {
        setWatchlistLoading(true)
      }

      const userId = Cookies.get('userID') || ''
      const response = await fetch(
        `https://suggesto.xyz/App/api.php?gofor=watchlist&user_id=${userId}&status=planned&limit=10&offset=${offset}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch watchlist movies')
      }

      const data = await response.json()
      const movies = data?.data || []

      // Set total count from API response
      if (data?.total_count !== undefined) {
        setTotalCount(data.total_count)
      }

      if (isLoadMore) {
        setWatchlistMovies(prev => [...prev, ...movies])
      } else {
        setWatchlistMovies(movies)
      }

      if (movies.length < 10) {
        setWatchlistHasMore(false)
      }

      if (movies.length > 0) {
        setWatchlistOffset(offset + movies.length)
      }
    } catch (err) {
      toast.error('Failed to load watchlist movies')
      console.error('Error fetching watchlist movies:', err)
    } finally {
      setWatchlistLoading(false)
      setWatchlistInitialLoad(false)
      setLoading(false) // Set main loading to false after first fetch
    }
  }, [])

  // Load initial watchlist movies when component mounts
  useEffect(() => {
    fetchWatchlistMovies(0, false)
  }, [fetchWatchlistMovies])

  // Intersection Observer for movie cards stack
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !watchlistLoading && watchlistHasMore && !showWatchlist && !watchlistInitialLoad) {
          fetchWatchlistMovies(watchlistOffset, true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    const cardStackObserver = document.getElementById('card-stack-observer')
    if (cardStackObserver) {
      observer.observe(cardStackObserver)
    }

    return () => observer.disconnect()
  }, [watchlistLoading, watchlistHasMore, watchlistOffset, showWatchlist, fetchWatchlistMovies, watchlistInitialLoad])

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchState("initial")
      return
    }

    const lowercaseSearch = searchTerm.toLowerCase()

    // Filter movies based on search term (title and overview)
    const results = watchlistMovies.filter((movie) =>
      movie.title.toLowerCase().includes(lowercaseSearch) ||
      (movie.overview && movie.overview.toLowerCase().includes(lowercaseSearch))
    )

    if (results.length > 0) {
      setSearchFilteredMovies(results)
      setSearchState("results")
    } else {
      setSearchState("not-found")
    }
  }, [searchTerm, watchlistMovies])

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
      const newIndex = (currentIndex + 1) % watchlistMovies.length
      setCurrentIndex(newIndex)

      // Load more movies when we're near the end (within last 3 movies)
      if (newIndex >= watchlistMovies.length - 3 && watchlistHasMore && !watchlistLoading) {
        fetchWatchlistMovies(watchlistOffset, true)
      }
    } else {
      const currentMovie = watchlistMovies[currentIndex]
      router.push(`/movie-detail-page?movie_id=${currentMovie.movie_id}`)
    }
  }

  const handleViewDetail = (movieId: number) => {
    router.push(`/movie-detail-page?movie_id=${movieId}`)
  }

  const togglePlaylist = () => {
    setShowWatchlist(!showWatchlist)
    // If switching to watchlist view and we haven't loaded initial data, load it
    if (!showWatchlist && watchlistInitialLoad) {
      fetchWatchlistMovies(0, false)
    }
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
    if (watchlistMovies.length > 0) {
      const randomIndex = Math.floor(Math.random() * watchlistMovies.length)
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
        backdrop_path: movie.poster_path,
        release_date: movie.release_date,
        rating: movie.rating,
        status: 'planned',
        added_date: new Date().toISOString(),
        overview: movie.overview
      }))
    }
    return watchlistMovies.map(movie => ({
      ...movie,
      watchlist_id: movie.watch_id || movie.movie_id.toString()
    }))
  }

  useEffect(() => {
    if (watchlistMovies.length > 0) {
      // Preload next batch of images in background
      const imagesToPreload = watchlistMovies
        .slice(currentIndex + 1, currentIndex + 6) // Preload next 5 images
        .map(movie => getPosterUrl(movie.poster_path))
        .filter(url => url !== getPosterUrl("/placeholder.svg"))

      if (imagesToPreload.length > 0) {
        preloadImages(imagesToPreload)
      }
    }
  }, [watchlistMovies, currentIndex, preloadImages])

  // If search is open, show search interface
  if (showSearch) {
    return (
      <div className="min-h-screen text-white">
        <div className="w-full max-w-md mx-auto px-4 pt-8">
          <div className="flex items-center mb-6">
            <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={closeSearch}>
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-semibold">Search Watchlist</h1>
          </div>

          <div className="relative mb-6">
            <div className="flex items-center bg-[#2b2b2b] rounded-full px-4 py-4">
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
                        className="flex items-center justify-between border-b border-[#2b2b2b] p-3 cursor-pointer rounded-lg"
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

              <h2 className="text-lg font-medium mb-4">Your Planned Movies ({watchlistMovies.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {watchlistMovies.slice(0, 6).map((movie) => (
                  <Link href={`/movie-detail-page?movie_id=${movie.movie_id}`} key={movie.watchlist_id}>
                    <motion.div
                      className="relative w-full h-[200px] rounded-lg overflow-hidden cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <CachedImage
                        src={getPosterUrl(movie.poster_path)}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        width={0}
                        height={0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff968b] to-[#ff2251] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Star className="w-3 h-3 text-white" />
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
                    <div className="flex bg-[#2b2b2b] rounded-lg overflow-hidden hover:bg-[#333342] transition-colors">
                      <div className="relative w-24 h-32 flex-shrink-0">
                        <CachedImage
                          src={getPosterUrl(movie.poster_path)}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          width={0}
                          height={0}
                        />
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff968b] to-[#ff2251] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 text-white" />
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
              <div className="w-16 h-16 bg-[#2b2b2b] rounded-lg flex items-center justify-center mb-4">
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
    <div className="min-h-screen  text-white">
      {/* Header */}
      <header className="p-4 flex items-center justify-between pt-8">
        <div className="flex items-center gap-2">
          <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
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
            className="text-gray-300 rounded-full"
            onClick={openSearch}
          >
            <Search size={20} />
          </button>
          <button
            className={`text-gray-300 ${showWatchlist ? "bg-[#2b2b2b] rounded-full p-2" : ""}`}
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
            <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-[#ff968b] to-[#ff2251]">
              <div className="h-full w-full rounded-full overflow-hidden bg-black">
                <Image
                  src={user?.imgname || DefaultImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
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
            className="flex items-center gap-2 bg-[#2b2b2b] text-white px-4 py-2 rounded-lg text-sm"
          >
            <X size={16} />
            Clear Filters
          </button>
        </div>
      )}

      {showWatchlist ? (
        <div className="px-6">
          <div className="grid grid-cols-2 gap-4">
            {watchlistInitialLoad ? (
              // Show skeleton loading for initial load
              Array.from({ length: 6 }).map((_, index) => (
                <SkeletonMovie key={index} />
              ))
            ) : (
              moviesToDisplay.map((movie, index) => (
                <Link href={`/movie-detail-page?movie_id=${movie.movie_id}`} key={`${movie.watchlist_id || movie.movie_id}-${index}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative flex w-full h-[230px] rounded-lg overflow-hidden cursor-pointer"
                  >
                    <CachedImage
                      src={getPosterUrl(movie.poster_path)}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      width={0}
                      height={0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff968b] to-[#ff2251] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Star className="w-3 h-3 text-white" />
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

          {/* Loading more indicator */}
          {watchlistLoading && !watchlistInitialLoad && (
            <div className="flex justify-center py-8">
              <div className="grid grid-cols-2 gap-4 w-full">
                <SkeletonMovie />
                <SkeletonMovie />
              </div>
            </div>
          )}

          {/* Intersection observer target */}
          {watchlistHasMore && !watchlistLoading && (
            <div ref={watchlistObserverRef} className="h-4 w-full" />
          )}

          {/* End of list indicator */}
          {!watchlistHasMore && !watchlistInitialLoad && moviesToDisplay.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">You've reached the end of your watchlist</p>
            </div>
          )}

          {/* Empty state */}
          {!watchlistInitialLoad && moviesToDisplay.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <NotFound
                imageSrc={WatchListNotFound}
                title="No Movies Found"
                description="Your watchlist is empty or no movies match your filters."
              />
              <button
                className="mt-4 font-medium bg-gradient-to-r from-[#ff968b] to-[#ff2251] text-transparent bg-clip-text"
                onClick={() => router.push("/add-movie")}
              >
                Find movies to add
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Smart Suggestion */}
          <div className="px-4 mb-4">
            <div className="flex justify-between items-start gap-4">
              {suggestion && (
                <div className="bg-[#2b2b2b] rounded-lg p-3 flex items-center">
                  <Clock className="w-4 h-4 text-[#ff968b] mr-2" />
                  <p className="text-sm text-gray-200">{suggestion}</p>
                </div>
              )}
              <div className="ml-auto flex items-center gap-1 bg-gradient-to-r from-[#ff968b] to-[#ff2251] text-white px-2 py-1.5 rounded-xl shadow-md">
                <Film className="w-4 h-4" />
                <span className="text-white font-semibold text-xs flex items-center gap-1">
                  {totalCount || watchlistMovies.length}
                  <span>Movies</span>
                </span>
              </div>
            </div>
          </div>

          {/* Movie Cards Stack */}
          <div className="relative h-[450px] px-4 mb-6">
            {loading ? (
              <div className="absolute inset-x-4 rounded-xl overflow-hidden bg-[#2b2b2b] shadow-lg" style={{ top: "10px", bottom: "10px" }}>
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
            ) : (
              <AnimatePresence>
                {watchlistMovies.length > 0 ? (
                  [2, 1, 0].map((offset) => {
                    const index = (currentIndex + offset) % watchlistMovies.length
                    return (
                      <motion.div
                        key={watchlistMovies[index].movie_id}
                        initial={offset === 0 ? { scale: 0.8, y: 20, opacity: 0 } : {}}
                        animate={{
                          scale: 1 - offset * 0.05,
                          y: offset * 22,
                          opacity: 1 - offset * 0.2,
                          zIndex: 10 - offset,
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-x-4 h-[500px] rounded-xl overflow-hidden bg-[#2b2b2b] shadow-lg"
                        style={{ top: "10px", bottom: "10px" }}
                        onClick={() => offset === 0 && handleViewDetail(watchlistMovies[index].movie_id)}
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
                          <CachedImage
                            src={getPosterUrl(watchlistMovies[index].poster_path || watchlistMovies[index].backdrop_path || "/placeholder.svg")}
                            alt={watchlistMovies[index].title}
                            fill
                            className="object-cover"
                            width={0}
                            height={0}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#2b2b2b] via-transparent to-transparent"></div>

                          <div className="absolute inset-x-0 bottom-0 p-4">
                            <h2 className="text-xl font-bold mb-2">{watchlistMovies[index].title}</h2>
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 mr-1" fill="rgb(250 204 21)" />
                                <span className="text-sm">{watchlistMovies[index].rating}</span>
                              </div>
                              <span className="text-sm bg-[#9370ff]/20 text-[#9370ff] text-white px-2 py-0.5 rounded">
                                {formatReleaseYear(watchlistMovies[index].release_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-[#2b2b2b] rounded-xl p-4 text-center">
                    <NotFound
                      imageSrc={WatchListNotFound}
                      title="No Movies Planned"
                      description="Your watchlist is empty. Start adding movies to plan your next watch!" />
                    <button
                      className="mt-4 font-medium bg-gradient-to-r from-[#ff968b] to-[#ff2251] text-transparent bg-clip-text"
                      onClick={() => router.push("/add-movie")}
                    >
                      Find movies to add
                    </button>

                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
          {!showWatchlist && watchlistHasMore && !watchlistLoading && !watchlistInitialLoad && (
            <div id="card-stack-observer" className="h-4 w-full" />
          )}

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
          {!loading && watchlistMovies.length > 0 && !showWatchlist && (
            <motion.button
              className="w-14 h-14 rounded-full bg-gradient-to-r from-[#ff968b] to-[#ff2251] flex items-center justify-center shadow-lg"
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
            className="w-14 h-14 rounded-full bg-gradient-to-r from-[#ff968b] to-[#ff2251] flex items-center justify-center shadow-lg "
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