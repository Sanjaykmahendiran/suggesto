"use client"

import { type SetStateAction, useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, ArrowLeft, X, User, Check, Crown, Star, Heart, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import DefaultImage from "@/assets/default-user.webp"
import CoinAnimation from "@/components/coin-animation"
import { useUser } from "@/contexts/UserContext"
import { Movie, Friend } from "@/app/suggest-movie/type"
import { useRouter } from "next/navigation"

interface SuggestedMovie {
  movie_id: number | string
  suggested_to: string
}

interface SuggestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuggest: (movies: Movie[], friends: Friend[], note: string) => void
}

const MovieSkeleton = () => (
  <div className="relative flex w-full h-[230px] rounded-lg overflow-hidden bg-[#2b2b2b]">
    <Skeleton className="w-full h-full bg-[#3b3b3b]" />
  </div>
)

const SearchMovieSkeleton = () => (
  <div className="flex items-center gap-3 p-2">
    <Skeleton className="w-16 h-24 bg-[#3b3b3b] rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32 bg-[#3b3b3b]" />
      <Skeleton className="h-3 w-16 bg-[#3b3b3b]" />
      <Skeleton className="h-3 w-20 bg-[#3b3b3b]" />
    </div>
  </div>
)

const FriendSkeleton = () => (
  <div className="flex flex-col items-center gap-2 p-3 rounded-lg">
    <Skeleton className="w-14 h-14 rounded-full bg-[#2b2b2b]" />
    <Skeleton className="h-4 w-16 bg-[#2b2b2b]" />
  </div>
)

export function SuggestDialog({ isOpen, onClose, onSuggest }: SuggestDialogProps) {
  const router = useRouter()
  const { user, setUser } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([])
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([])
  const [note, setNote] = useState("")
  const [suggestStep, setSuggestStep] = useState(1)
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchMovies, setSearchMovies] = useState<Movie[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [suggestedMovies, setSuggestedMovies] = useState<SuggestedMovie[]>([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [loadingSuggested, setLoadingSuggested] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [friendSearchQuery, setFriendSearchQuery] = useState("")
  const [friendsOffset, setFriendsOffset] = useState(0)
  const [friendsHasMore, setFriendsHasMore] = useState(true)
  const [totalFriendsCount, setTotalFriendsCount] = useState(0)
  const [friendsInitialLoad, setFriendsInitialLoad] = useState(true)
  const friendsObserverRef = useRef<HTMLDivElement>(null)
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Check if user is paid (payment_status = 1)
  const isPaidUser = user?.payment_status === 1
  const maxMovies = isPaidUser ? 3 : 1
  const maxFriends = isPaidUser ? 3 : 1

  const triggerCoinAnimation = (coinsEarned: number) => {
    setCoinsEarned(coinsEarned);
    setShowCoinAnimation(true);
  };

  // Get poster URL helper function
  const getPosterUrl = (posterPath: string) => {
    if (!posterPath) return "/api/placeholder/300/450"
    return `https://suggesto.xyz/App/${posterPath}`
  }

  // Fetch movies and suggested movies when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (movies.length === 0) {
        fetchMovies()
      }
      fetchSuggestedMovies()
    }
  }, [isOpen])

  // Fetch friends when step 2 is reached
  useEffect(() => {
    if (suggestStep === 2 && friends.length === 0) {
      fetchFriends()
    }
  }, [suggestStep])

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchMoviesAPI(searchQuery.trim())
      }, 300)
    } else {
      setSearchMovies([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const fetchMovies = async () => {
    setLoadingMovies(true)
    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=top10watchlisted`)
      if (!response.ok) throw new Error('Failed to fetch movies')
      const result = await response.json()
      // Extract the data array from the response
      const data: Movie[] = result.data || []
      setMovies(data)
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoadingMovies(false)
    }
  }

  const searchMoviesAPI = async (searchText: string) => {
    setSearchLoading(true)
    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=searchmovies&searchtext=${encodeURIComponent(searchText)}`)
      if (!response.ok) throw new Error('Failed to search movies')
      const data: Movie[] = await response.json()
      // Search API returns array directly, not wrapped in status/data
      setSearchMovies(data || [])
    } catch (error) {
      console.error('Error searching movies:', error)
      setSearchMovies([])
    } finally {
      setSearchLoading(false)
    }
  }

  const fetchSuggestedMovies = async () => {
    setLoadingSuggested(true)
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userID') : null
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=suggestedmovies&user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch suggested movies')
      const data = await response.json()

      // Extract movie_id and suggested_to for filtering
      const suggestedData: SuggestedMovie[] = data.map((item: any) => ({
        movie_id: item.movie_id.toString(),
        suggested_to: item.suggested_to_name || item.suggested_to
      }))

      setSuggestedMovies(suggestedData)
    } catch (error) {
      console.error('Error fetching suggested movies:', error)
    } finally {
      setLoadingSuggested(false)
    }
  }

  const fetchFriends = async (currentOffset: number = 0, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoadingFriends(true)
    }

    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userID') : null || ''
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${userId}&limit=10&offset=${currentOffset}`)
      if (!response.ok) throw new Error('Failed to fetch friends')

      const result = await response.json()
      const fetchedFriends: Friend[] = result.data || []

      // Set total count from API response
      if (result?.total_count !== undefined) {
        setTotalFriendsCount(result.total_count)
      }

      if (isLoadMore) {
        setFriends(prev => [...prev, ...fetchedFriends])
      } else {
        setFriends(fetchedFriends)
      }

      // Check if there are more friends to load
      if (fetchedFriends.length < 10) {
        setFriendsHasMore(false)
      }

      if (fetchedFriends.length > 0) {
        setFriendsOffset(currentOffset + fetchedFriends.length)
      }

    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoadingFriends(false)
      setFriendsInitialLoad(false)
    }
  }

  useEffect(() => {
    if (suggestStep === 2 && friends.length === 0) {
      fetchFriends(0, false)
    }
  }, [suggestStep])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !loadingFriends && friendsHasMore && !friendsInitialLoad && suggestStep === 2) {
          fetchFriends(friendsOffset, true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (friendsObserverRef.current && suggestStep === 2) {
      observer.observe(friendsObserverRef.current)
    }

    return () => observer.disconnect()
  }, [loadingFriends, friendsHasMore, friendsOffset, friendsInitialLoad, suggestStep])

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase())
  )

  // Render movie grid for top 10 watchlisted movies
  const renderMovieGrid = (movies: Movie[]) => (
    <div className="grid grid-cols-2 gap-4">
      {movies.map((movie, index) => {
        const isSelected = selectedMovies.some(m => m.movie_id === movie.movie_id)
        const canSelect = selectedMovies.length < maxMovies || isSelected

        return (
          <motion.div
            key={`${movie.movie_id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: canSelect ? 1.05 : 1 }}
            className={`relative flex w-full h-[230px] rounded-lg overflow-hidden cursor-pointer ${isSelected
                ? 'ring-2 ring-primary'
                : canSelect
                  ? 'hover:shadow-lg'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            onClick={() => canSelect && handleMovieSelect(movie)}
          >
            <Image
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/api/placeholder/300/450"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

            {/* Rating badge */}
            <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
              <Star className="w-3 h-3 text-white" />
              {movie.rating}
            </div>

            {/* Watchlisted badge */}
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {movie.watchlist_users || 'N/A'}
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
            )}

            <div className="absolute bottom-2 left-2 right-2">
              <h3 className="text-sm font-medium text-white line-clamp-2">{movie.title}</h3>
            </div>
          </motion.div>
        )
      })}
    </div>
  )

  // Get available movies for the selected friends (not already suggested)
  const getAvailableMoviesForFriends = () => {
    if (selectedFriends.length === 0) return searchQuery ? searchMovies : movies

    const moviesToCheck = searchQuery ? searchMovies : movies
    return moviesToCheck.filter(movie => {
      // For paid users, check if movie has been suggested to ALL selected friends
      // For free users, check if movie has been suggested to the single selected friend
      if (isPaidUser) {
        // Movie is available if it hasn't been suggested to at least one of the selected friends
        return selectedFriends.some(friend => {
          const alreadySuggested = suggestedMovies.some(suggested =>
            suggested.movie_id === movie.movie_id.toString() &&
            (suggested.suggested_to === friend.name ||
              suggested.suggested_to === friend.friend_id.toString())
          )
          return !alreadySuggested
        })
      } else {
        // For free users, check the single selected friend
        const friend = selectedFriends[0]
        const alreadySuggested = suggestedMovies.some(suggested =>
          suggested.movie_id === movie.movie_id.toString() &&
          (suggested.suggested_to === friend.name ||
            suggested.suggested_to === friend.friend_id.toString())
        )
        return !alreadySuggested
      }
    })
  }

  const handleMovieSelect = (movie: Movie) => {
    if (isPaidUser) {
      // Paid user can select multiple movies
      if (selectedMovies.find(m => m.movie_id === movie.movie_id)) {
        // Remove if already selected
        setSelectedMovies(prev => prev.filter(m => m.movie_id !== movie.movie_id))
      } else if (selectedMovies.length < maxMovies) {
        // Add if under limit
        setSelectedMovies(prev => [...prev, movie])
      }
      // Don't automatically move to step 2 for paid users
    } else {
      // Free user can only select one movie and auto-advance
      setSelectedMovies([movie])
      setSuggestStep(2)
    }
  }

  const handleFriendSelect = (friend: Friend) => {
    if (isPaidUser) {
      // Paid user can select multiple friends
      if (selectedFriends.find(f => f.friend_id === friend.friend_id)) {
        // Remove if already selected
        setSelectedFriends(prev => prev.filter(f => f.friend_id !== friend.friend_id))
      } else if (selectedFriends.length < maxFriends) {
        // Add if under limit
        setSelectedFriends(prev => [...prev, friend])
      }
    } else {
      // Free user can only select one friend
      setSelectedFriends([friend])
      setSuggestStep(3)
    }
  }

  const handleSuggest = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedMovies.length > 0 && selectedFriends.length > 0) {
      setSubmitting(true)

      try {
        const userId = typeof window !== 'undefined' ? localStorage.getItem('userID') : null;

        // Prepare arrays of IDs
        const movieIds = selectedMovies.map(movie => movie.movie_id);
        const friendIds = selectedFriends.map(friend => friend.friend_id);

        // Send single bulk API call
        const response = await fetch('https://suggesto.xyz/App/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gofor: 'suggestmovie',
            suggested_by: userId,
            movie_ids: movieIds,
            friend_ids: friendIds,
            note: note || 'Recommended this movie for you!'
          })
        })

        if (!response.ok) throw new Error('Failed to suggest movies')
        const result = await response.json()

        // Trigger coin animation if coins were earned
        if (result.coins_earned) {
          triggerCoinAnimation(result.coins_earned);
        }

        // Update the suggested movies list for all combinations
        const newSuggestedMovies: { movie_id: string; suggested_to: string }[] = [];
        selectedMovies.forEach(movie => {
          selectedFriends.forEach(friend => {
            newSuggestedMovies.push({
              movie_id: movie.movie_id.toString(),
              suggested_to: friend.name
            });
          });
        });

        setSuggestedMovies(prev => [...prev, ...newSuggestedMovies]);

        onSuggest(selectedMovies, selectedFriends, note)
        resetSuggestFlow()
      } catch (error) {
        console.error('Error suggesting movies:', error)
        // You might want to show an error toast here
      } finally {
        setSubmitting(false)
      }
    }
  }

  const resetSuggestFlow = () => {
    setSuggestStep(1)
    setSelectedMovies([])
    setSelectedFriends([])
    setNote("")
    setSearchQuery("")
    setSearchMovies([])
    setFriendSearchQuery("")
    // Reset friends pagination states
    setFriendsOffset(0)
    setFriendsHasMore(true)
    setFriendsInitialLoad(true)
    setTotalFriendsCount(0)
  }

  const handleBack = () => {
    if (suggestStep > 1) {
      setSuggestStep(suggestStep - 1)
      if (suggestStep === 3) {
        // Going back from step 3 to step 2, clear the friends selection for free users
        if (!isPaidUser) {
          setSelectedFriends([])
        }
      }
    } else {
      onClose()
      setTimeout(resetSuggestFlow, 200)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setTimeout(resetSuggestFlow, 200)
    }
  }

  const handleContinueToFriends = () => {
    if (selectedMovies.length > 0) {
      setSuggestStep(2)
    }
  }

  const handleContinueToNote = () => {
    if (selectedFriends.length > 0) {
      setSuggestStep(3)
    }
  }

  // Get the movies to display based on current step
  const moviesToDisplay = suggestStep === 1 ? (searchQuery ? searchMovies : movies) : getAvailableMoviesForFriends()

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="bg-[#1f1f21] border border-none bottom-0 text-white p-0 max-w-md h-[700px] flex flex-col">
          <div className="sticky top-0 z-10 bg-[#1f1f21] p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DialogTitle>
                  {suggestStep === 1
                    ? `Select ${isPaidUser ? 'movies' : 'a movie'} to suggest`
                    : suggestStep === 2
                      ? `Select ${isPaidUser ? 'friends' : 'a friend'}`
                      : "Add a note (optional)"}
                </DialogTitle>
                {isPaidUser && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <button
                onClick={handleBack}
                className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700"
              >
                {suggestStep > 1 ? <ArrowLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>

            {/* Selection counters for paid users */}
            {isPaidUser && (
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>Movies: {selectedMovies.length}/{maxMovies}</span>
                <span>Friends: {selectedFriends.length}/{maxFriends}</span>
              </div>
            )}

            {(suggestStep === 1 || suggestStep === 2) && (
              <div className="mt-4">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder={suggestStep === 1 ? "Search for movies..." : "Search for friends..."}
                    className="w-full px-3 py-2 rounded-md bg-[#2b2b2b] border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={suggestStep === 1 ? searchQuery : friendSearchQuery}
                    onChange={(e) => suggestStep === 1 ? setSearchQuery(e.target.value) : setFriendSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Continue button for paid users */}
            {isPaidUser && suggestStep === 1 && selectedMovies.length > 0 && (
              <Button
                onClick={handleContinueToFriends}
                className="w-full mt-3 bg-primary hover:bg-primary/90"
              >
                Continue to Select Friends ({selectedMovies.length} movie{selectedMovies.length > 1 ? 's' : ''} selected)
              </Button>
            )}
            {isPaidUser && suggestStep === 2 && selectedFriends.length > 0 && (
              <Button
                onClick={handleContinueToNote}
                className="w-full mt-3 bg-primary hover:bg-primary/90"
              >
                Continue to Add Note ({selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected)
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[#1f1f21]">
            {suggestStep === 1 && (
              <div className="space-y-3">
                {searchQuery ? (
                  /* Search Results */
                  <div className="rounded-lg">
                    {searchLoading ? (
                      <div className="p-4 space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <SearchMovieSkeleton key={index} />
                        ))}
                      </div>
                    ) : searchMovies.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-400">
                          No movies found matching "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {searchMovies.map((movie, index) => {
                          const isSelected = selectedMovies.some(m => m.movie_id === movie.movie_id)
                          const canSelect = selectedMovies.length < maxMovies || isSelected

                          return (
                            <motion.div
                              key={movie.movie_id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer relative ${isSelected
                                  ? 'bg-primary/20 border border-primary/50'
                                  : canSelect
                                    ? 'hover:bg-[#3b3b3b]'
                                    : 'opacity-50 cursor-not-allowed'
                                }`}
                              onClick={() => canSelect && handleMovieSelect(movie)}
                            >
                              <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={getPosterUrl(movie.poster_path)}
                                  alt={movie.title}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/api/placeholder/64/96"
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-white">{movie.title}</h3>
                                <p className="text-xs text-gray-400">
                                  {new Date(movie.release_date).getFullYear()}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Rating: {movie.rating}/10
                                </p>
                              </div>
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Top 10 Watchlisted Movies Grid */
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="w-5 h-5 text-[#ee2a7b]" />
                      <h2 className="text-lg font-bold text-white">Top 10 Watchlisted</h2>
                    </div>
                    {(loadingMovies || loadingSuggested) ? (
                      <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <MovieSkeleton key={index} />
                        ))}
                      </div>
                    ) : movies.length === 0 ? (
                      <div className="flex items-center justify-center min-h-[200px]">
                        <div className="text-center text-gray-400">
                          <p>No watchlisted movies available at the moment</p>
                        </div>
                      </div>
                    ) : (
                      renderMovieGrid(movies)
                    )}
                  </div>
                )}
              </div>
            )}

            {suggestStep === 2 && (
              <div>
                {/* Selected movies preview */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Selected Movies:</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedMovies.map((movie) => (
                      <div key={movie.movie_id} className="flex items-center gap-2 bg-[#2b2b2b] rounded-lg p-2">
                        <div className="relative w-8 h-12 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={getPosterUrl(movie.poster_path)}
                            alt={movie.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/api/placeholder/32/48"
                            }}
                          />
                        </div>
                        <span className="text-xs">{movie.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {loadingFriends ? (
                  <div className="grid grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, index) => (
                      <FriendSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredFriends.map((friend) => {
                      const isSelected = selectedFriends.some(f => f.friend_id === friend.friend_id)
                      const canSelect = selectedFriends.length < maxFriends || isSelected

                      // Check if any selected movie has been suggested to this friend
                      const hasUnavailableMovie = selectedMovies.some(movie =>
                        suggestedMovies.some(suggested =>
                          suggested.movie_id === movie.movie_id.toString() &&
                          (suggested.suggested_to === friend.name || suggested.suggested_to === friend.friend_id.toString())
                        )
                      )

                      return (
                        <motion.button
                          key={friend.friend_id}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg relative ${isSelected
                            ? 'bg-primary/20 border border-primary/50'
                            : canSelect && !hasUnavailableMovie
                              ? 'hover:bg-[#2b2b2b] cursor-pointer'
                              : 'opacity-50 cursor-not-allowed'
                            }`}
                          whileHover={canSelect && !hasUnavailableMovie && !isSelected ? { scale: 1.05 } : {}}
                          onClick={() => canSelect && !hasUnavailableMovie && handleFriendSelect(friend)}
                          disabled={!canSelect || hasUnavailableMovie}
                        >
                          <Avatar className="w-14 h-14">
                            <AvatarImage
                              src={friend.profile_pic || (typeof DefaultImage === "string" ? DefaultImage : DefaultImage.src)}
                              alt={friend.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = DefaultImage.src
                              }}
                            />
                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-center">{friend.name}</span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {hasUnavailableMovie && !isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                              <span className="text-xs text-center px-2">Already Suggested</span>
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                )}

                {!loadingFriends && filteredFriends.length === 0 && friends.length > 0 && (
                  <div className="text-center text-gray-400 py-8 flex flex-col items-center gap-2">
                    <User size={40} className="text-[#ff7db8]" />
                    <p>No friends found matching your search.</p>
                  </div>
                )}

                {!loadingFriends && friends.length === 0 && (
                  <div className="text-center text-gray-400 py-8 flex flex-col items-center gap-2">
                    <User size={40} className="text-[#ff7db8]" />
                    <p>No friends found. Add some friends to start suggesting movies!</p>
                  </div>
                )}
              </div>
            )}

            {/* Loading more friends indicator */}
            {loadingFriends && !friendsInitialLoad && friendSearchQuery === '' && (
              <div className="flex justify-center py-4">
                <div className="grid grid-cols-3 gap-4">
                  {Array(3).fill(0).map((_, index) => (
                    <FriendSkeleton key={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Friends intersection observer target */}
            {friendsHasMore && !loadingFriends && friendSearchQuery === '' && (
              <div ref={friendsObserverRef} className="h-4 w-full" />
            )}

            {suggestStep === 3 && (
              <div className="space-y-4">
                {/* Summary of selections */}
                <div className="bg-[#2b2b2b] rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-3">Suggestion Summary:</h4>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Movies ({selectedMovies.length}):</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedMovies.map((movie) => (
                          <div key={movie.movie_id} className="flex items-center gap-2 bg-[#2b2b2b] rounded p-1">
                            <div className="relative w-6 h-9 rounded overflow-hidden">
                              <Image
                                src={getPosterUrl(movie.poster_path)}
                                alt={movie.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/api/placeholder/24/36"
                                }}
                              />
                            </div>
                            <span className="text-xs">{movie.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-2">To ({selectedFriends.length}) friend{selectedFriends.length > 1 ? 's' : ''}:</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedFriends.map((friend) => (
                          <div key={friend.friend_id} className="flex items-center gap-2 bg-[#2b2b2b] rounded p-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage
                                src={friend.profile_pic || (typeof DefaultImage === "string" ? DefaultImage : DefaultImage.src)}
                                alt={friend.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = typeof DefaultImage === "string" ? DefaultImage : DefaultImage.src
                                }}
                              />
                              <AvatarFallback>{friend.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{friend.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Why are you recommending {selectedMovies.length > 1 ? 'these movies' : 'this movie'}?</label>
                  <Textarea
                    placeholder="Write a short note..."
                    className="bg-[#2b2b2b] text-white border-gray-700"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                {isPaidUser && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      Pro Bulk Suggestion
                    </h4>
                    <p className="text-xs text-gray-300">
                      You're sending {selectedMovies.length} movie{selectedMovies.length > 1 ? 's' : ''} to {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} ({selectedMovies.length * selectedFriends.length} total suggestions)
                    </p>
                  </div>
                )}

                {!isPaidUser && selectedFriends.length > 0 && (
                  <div className="mt-4 p-3 bg-[#2b2b2b] rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Smart Suggestion</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <p className="text-xs text-gray-300">
                        {selectedFriends[0]?.name} enjoys {selectedFriends[0]?.genre} movies. This recommendation matches their interests!
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  variant="default"
                  className="w-full h-12"
                  onClick={handleSuggest}
                  disabled={submitting || selectedMovies.length === 0 || selectedFriends.length === 0}
                >
                  {submitting ? "Sending..." : `Send ${selectedMovies.length * selectedFriends.length} Suggestion${selectedMovies.length * selectedFriends.length > 1 ? 's' : ''}`}
                </Button>

                {!isPaidUser && (
                  <Button
                    variant="outline"
                    className="w-full bg-[#2b2b2b] h-12 mt-3 border-yellow-600/50 text-yellow-500 hover:bg-yellow-500/10"
                    onClick={() => router.push('/premium')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Suggest Multiple Movies - Upgrade to Pro
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CoinAnimation
        show={showCoinAnimation}
        coinsEarned={coinsEarned}
        message="Coins Earned!"
        onAnimationEnd={() => setShowCoinAnimation(false)}
        duration={3000}
      />
    </>
  )
}