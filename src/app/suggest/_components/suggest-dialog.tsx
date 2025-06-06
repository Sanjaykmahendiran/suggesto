"use client"

import { type SetStateAction, useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from "js-cookie"

interface Movie {
  watchlist_id: number
  movie_id: string
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  language: string
  is_adult: string
  genres: string[]
  otts: Array<{
    ott_id: number
    name: string
    logo_url: string
  }>
}

interface Friend {
  friend_id: number
  name: string
  profile_pic: string
  joined_date: string
  genre: string
}

interface SuggestedMovie {
  movie_id: string
  suggested_to: string
}

interface SuggestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuggest: (movie: Movie, friend: Friend, note: string) => void
}

const MovieSkeleton = () => (
  <div className="flex items-center gap-3 p-2 rounded-lg">
    <Skeleton className="w-16 h-24 rounded-lg bg-[#181826]" />
    <div className="flex-1">
      <Skeleton className="h-4 w-32 mb-2 bg-[#181826]" />
      <Skeleton className="h-3 w-16 bg-[#181826]" />
    </div>
  </div>
)

const FriendSkeleton = () => (
  <div className="flex flex-col items-center gap-2 p-3 rounded-lg">
    <Skeleton className="w-14 h-14 rounded-full bg-[#181826]" />
    <Skeleton className="h-4 w-16 bg-[#181826]" />
  </div>
)

export function SuggestDialog({ isOpen, onClose, onSuggest }: SuggestDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [note, setNote] = useState("")
  const [suggestStep, setSuggestStep] = useState(1)
  const [movies, setMovies] = useState<Movie[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [suggestedMovies, setSuggestedMovies] = useState<SuggestedMovie[]>([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [loadingFriends, setLoadingFriends] = useState(false)
  const [loadingSuggested, setLoadingSuggested] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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

  const fetchMovies = async () => {
    setLoadingMovies(true)
    try {
      const userId = Cookies.get('userID') || '1'
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=watchlist&user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch movies')
      const data: Movie[] = await response.json()
      setMovies(data)
    } catch (error) {
      console.error('Error fetching movies:', error)
    } finally {
      setLoadingMovies(false)
    }
  }

  const fetchSuggestedMovies = async () => {
    setLoadingSuggested(true)
    try {
      const userId = Cookies.get('userID') || '1'
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

  const fetchFriends = async () => {
    setLoadingFriends(true)
    try {
      const userId = Cookies.get('userID') || '1'
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch friends')
      const data: Friend[] = await response.json()
      setFriends(data)
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoadingFriends(false)
    }
  }

  // Filter movies based on search query
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get available movies for the selected friend (not already suggested)
  const getAvailableMoviesForFriend = () => {
    if (!selectedFriend) return filteredMovies
    
    return filteredMovies.filter(movie => {
      // Check if this movie has already been suggested to this friend
      const alreadySuggested = suggestedMovies.some(suggested => 
        suggested.movie_id === movie.movie_id.toString() && 
        (suggested.suggested_to === selectedFriend.name || 
         suggested.suggested_to === selectedFriend.friend_id.toString())
      )
      return !alreadySuggested
    })
  }

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie)
    setSuggestStep(2)
  }

  const handleFriendSelect = (friend: Friend) => {
    setSelectedFriend(friend)
    setSuggestStep(3)
  }

  const handleSuggest = async () => {
    if (selectedMovie && selectedFriend) {
      setSubmitting(true)
      try {
        const userId = Cookies.get('userID') || ''
        const response = await fetch('https://suggesto.xyz/App/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gofor: 'suggestmovie',
            suggested_by: userId,
            suggested_to: selectedFriend.friend_id.toString(),
            movie_id: selectedMovie.movie_id.toString(),
            note: note || 'Recommended this movie for you!'
          })
        })

        if (!response.ok) throw new Error('Failed to suggest movie')

        // Update the suggested movies list to prevent re-suggesting
        setSuggestedMovies(prev => [...prev, {
          movie_id: selectedMovie.movie_id.toString(),
          suggested_to: selectedFriend.name
        }])

        onSuggest(selectedMovie, selectedFriend, note)
        resetSuggestFlow()
      } catch (error) {
        console.error('Error suggesting movie:', error)
        // You might want to show an error toast here
      } finally {
        setSubmitting(false)
      }
    }
  }

  const resetSuggestFlow = () => {
    setSuggestStep(1)
    setSelectedMovie(null)
    setSelectedFriend(null)
    setNote("")
    setSearchQuery("")
  }

  const handleBack = () => {
    if (suggestStep > 1) {
      setSuggestStep(suggestStep - 1)
      if (suggestStep === 3) {
        // Going back from step 3 to step 2, clear the friend selection
        setSelectedFriend(null)
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

  // Get the movies to display based on current step
  const moviesToDisplay = suggestStep === 1 ? filteredMovies : getAvailableMoviesForFriend()

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#292938] max-h-[700px] border-gray-700 text-white p-0 max-w-md">
        <div className="sticky top-0 z-10 bg-[#292938] p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {suggestStep === 1
                ? "Find a movie to suggest"
                : suggestStep === 2
                  ? "Select a friend"
                  : "Add a note (optional)"}
            </DialogTitle>
            <button
              onClick={handleBack}
              className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700"
            >
              {suggestStep > 1 ? <ArrowLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>
          {suggestStep === 1 && (
            <div className="mt-4">
              <div className="flex items-center bg-[#181826] rounded-full px-4 py-3">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search for a movie..."
                  className="bg-transparent w-full focus:outline-none text-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {suggestStep === 1 && (
            <div className="space-y-3">
              {(loadingMovies || loadingSuggested) ? (
                Array(5).fill(0).map((_, index) => (
                  <MovieSkeleton key={index} />
                ))
              ) : (
                moviesToDisplay.map((movie) => (
                  <motion.div
                    key={movie.watchlist_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#181826] cursor-pointer"
                    onClick={() => handleMovieSelect(movie)}
                  >
                    <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={`https://suggesto.xyz/App/${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/api/placeholder/64/96"
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{movie.title}</h3>
                      <p className="text-xs text-gray-400">{new Date(movie.release_date).getFullYear()}</p>
                      <p className="text-xs text-gray-400">Rating: {movie.rating}/10</p>
                    </div>
                  </motion.div>
                ))
              )}
              {!(loadingMovies || loadingSuggested) && moviesToDisplay.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  {searchQuery ? 'No movies found matching your search.' : 'No movies available.'}
                </div>
              )}
            </div>
          )}

          {suggestStep === 2 && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={`https://suggesto.xyz/App/${selectedMovie?.poster_path}`}
                    alt={selectedMovie?.title ?? "Movie image"}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/api/placeholder/64/96"
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium">{selectedMovie?.title}</h3>
                  <p className="text-xs text-gray-400">{selectedMovie?.release_date ? new Date(selectedMovie.release_date).getFullYear() : 'N/A'}</p>
                  <p className="text-xs text-gray-400">Rating: {selectedMovie?.rating}/10</p>
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
                  {friends.map((friend) => {
                    const alreadySuggested = selectedMovie && suggestedMovies.some(suggested => 
                      suggested.movie_id === selectedMovie.movie_id.toString() && 
                      (suggested.suggested_to === friend.name || 
                       suggested.suggested_to === friend.friend_id.toString())
                    )

                    return (
                      <motion.button
                        key={friend.friend_id}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg relative ${
                          alreadySuggested 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-[#181826] cursor-pointer'
                        }`}
                        whileHover={!alreadySuggested ? { scale: 1.05 } : {}}
                        onClick={() => !alreadySuggested && handleFriendSelect(friend)}
                        disabled={!!alreadySuggested}
                      >
                        <Avatar className="w-14 h-14">
                          <AvatarImage
                            src={friend.profile_pic}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/api/placeholder/56/56"
                            }}
                          />
                          <AvatarFallback>{friend.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-center">{friend.name}</span>
                        {alreadySuggested && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <span className="text-xs text-center px-2">Already Suggested</span>
                          </div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
              {!loadingFriends && friends.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No friends found. Add some friends to start suggesting movies!
                </div>
              )}
            </div>
          )}

          {suggestStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={`https://suggesto.xyz/App/${selectedMovie?.poster_path}`}
                    alt={selectedMovie?.title ?? "Movie image"}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/api/placeholder/64/96"
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{selectedMovie?.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">To:</span>
                    <Avatar className="w-5 h-5">
                      <AvatarImage
                        src={selectedFriend?.profile_pic}
                        alt={selectedFriend?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/api/placeholder/20/20"
                        }}
                      />
                      <AvatarFallback>{selectedFriend?.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{selectedFriend?.name}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Why are you recommending this?</label>
                <Textarea
                  placeholder="Write a short note..."
                  className="bg-[#181826] text-white border-gray-700"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="mt-4 p-3 bg-[#181826] rounded-lg">
                <h4 className="text-sm font-medium mb-2">Smart Suggestion</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <p className="text-xs text-gray-300">
                    {selectedFriend?.name} enjoys {selectedFriend?.genre} movies. This recommendation matches their interests!
                  </p>
                </div>
              </div>

              <Button
                className="w-full bg-[#6c5ce7] hover:bg-[#6c5ce7]/80 h-12"
                onClick={handleSuggest}
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Suggestion"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}