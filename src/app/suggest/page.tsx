"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Filter, Share2, Plus, CheckCircle, Clock, XCircle } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SuggestDialog } from "./_components/suggest-dialog"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"

// Skeleton component for suggestions
const SkeletonSuggestion = () => (
  <div className="bg-[#292938] rounded-lg w-full">
    <div className="flex p-3">
      <Skeleton className="w-20 h-28 rounded-lg bg-[#181826]" />
      <div className="ml-3 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton className="w-5 h-5 rounded-full bg-[#181826]" />
          <Skeleton className="h-3 w-24 bg-[#181826]" />
        </div>
        <Skeleton className="h-4 w-32 mb-2 bg-[#181826]" />
        <Skeleton className="h-16 w-full bg-[#181826] rounded-lg mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full bg-[#181826]" />
          <Skeleton className="h-8 w-24 rounded-full bg-[#181826]" />
          <Skeleton className="h-8 w-8 rounded-full bg-[#181826] ml-auto" />
        </div>
      </div>
    </div>
  </div>
)

// Types
interface SuggestedMovie {
  movsug_id: number
  movie_id: number
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  status: string
  added_date: string
  note?: string
}

interface ReceivedMovie {
  movsug_id: number
  movie_id: number
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  status: string
  added_date: string
  note?: string
}

interface ReceivedSuggestion {
  movsug_id: number
  movie_id: number
  title: string
  poster_path: string
  backdrop_path: string
  release_date: string
  rating: string
  status: string
  added_date: string
  note: string
  suggested_by_name: string
  suggested_by_profile: string
}

interface Movie {
  movie_id: number
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

type ReceivedStatus = "pending" | "accepted" | "rejected" | "all"

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`
  return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`
}

export default function SuggestPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("received")
  const [showSuggestDialog, setShowSuggestDialog] = useState(false)
  const [suggestedMovies, setSuggestedMovies] = useState<SuggestedMovie[]>([])
  const [receivedMovies, setReceivedMovies] = useState<ReceivedMovie[]>([])
  const [receivedStatus, setReceivedStatus] = useState<ReceivedStatus>("all")
  const [loading, setLoading] = useState(false)
  const [receivedLoading, setReceivedLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receivedError, setReceivedError] = useState<string | null>(null)

  // Fetch suggestions when component mounts
  useEffect(() => {
    fetchReceivedMovies()
  }, [receivedStatus])

  // Fetch sent suggestions when sent tab is active
  useEffect(() => {
    if (activeTab === "sent") {
      fetchSuggestedMovies()
    }
  }, [activeTab])

  const fetchSuggestedMovies = async () => {
    setLoading(true)
    setError(null)

    try {
      const userId = Cookies.get('userID') || ''
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=suggestedmovies&user_id=${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch suggested movies')
      }

      const data: SuggestedMovie[] = await response.json()
      setSuggestedMovies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching suggested movies:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReceivedMovies = async () => {
    setReceivedLoading(true)
    setReceivedError(null)

    try {
      const userId = Cookies.get('userID') || '1'
      let allMovies: ReceivedMovie[] = []
      
      if (receivedStatus === "all") {
        // Fetch movies from all statuses
        const statusTypes: ReceivedStatus[] = ["pending", "accepted", "rejected"]
        
        for (const status of statusTypes) {
          const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=receivedmovies&user_id=${userId}&status=${status}`)
          
          if (!response.ok) {
            throw new Error(`Failed to fetch ${status} received movies`)
          }
          
          const data: ReceivedMovie[] = await response.json()
          allMovies = [...allMovies, ...data]
        }
      } else {
        // Fetch movies for specific status
        const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=receivedmovies&user_id=${userId}&status=${receivedStatus}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${receivedStatus} received movies`)
        }
        
        allMovies = await response.json()
      }
      
      setReceivedMovies(allMovies)
    } catch (err) {
      console.error('Error fetching received movies:', err)
      setReceivedError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setReceivedLoading(false)
    }
  }

  // Handle suggestion from dialog
  const handleSuggest = (movie: Movie, friend: Friend, note: string) => {
    console.log('Suggesting:', { movie, friend, note })
    setShowSuggestDialog(false)
    // Show success message or notification
    // Optionally refresh the suggestions list
    if (activeTab === "sent") {
      fetchSuggestedMovies()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Watched'
      case 'rejected':
        return 'Declined'
      case 'pending':
      default:
        return 'Pending'
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-400'
      case 'rejected':
        return 'text-red-400'
      case 'pending':
      default:
        return 'text-yellow-400'
    }
  }

  return (
    <div className="text-white min-h-screen mb-18">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Suggest</h1>
        </div>
        <div className="flex gap-4">
          <button className="text-gray-300 p-2 rounded-full bg-[#292938]">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="received" className="w-full" onValueChange={setActiveTab}>
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
            <TabsTrigger
              value="received"
              className="data-[state=active]:bg-[#6c5ce7] transition-colors duration-200"
            >
              Received
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="data-[state=active]:bg-[#6c5ce7] transition-colors duration-200"
            >
              Sent
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Received Tab */}
        <TabsContent value="received" className="mt-4">
          {/* Categories */}
          <div className="flex space-x-2 px-4 overflow-x-auto pb-2 no-scrollbar">
            <button 
              className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${
                receivedStatus === 'all' 
                  ? 'bg-[#6c5ce7] text-white' 
                  : 'bg-transparent text-gray-300 border border-gray-600'
              }`}
              onClick={() => setReceivedStatus('all')}
            >
              All
            </button>
            <button 
              className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${
                receivedStatus === 'pending' 
                  ? 'bg-[#6c5ce7] text-white' 
                  : 'bg-transparent text-gray-300 border border-gray-600'
              }`}
              onClick={() => setReceivedStatus('pending')}
            >
              <Clock className="w-4 h-4 mr-1" />
              Pending
            </button>
            <button 
              className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${
                receivedStatus === 'accepted' 
                  ? 'bg-[#6c5ce7] text-white' 
                  : 'bg-transparent text-gray-300 border border-gray-600'
              }`}
              onClick={() => setReceivedStatus('accepted')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Accepted
            </button>
            <button 
              className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${
                receivedStatus === 'rejected' 
                  ? 'bg-[#6c5ce7] text-white' 
                  : 'bg-transparent text-gray-300 border border-gray-600'
              }`}
              onClick={() => setReceivedStatus('rejected')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Rejected
            </button>
          </div>
          
          <div className="px-4 mt-2">
            {receivedLoading && (
              <div className="space-y-4">
                <SkeletonSuggestion />
                <SkeletonSuggestion />
              </div>
            )}

            {receivedError && (
              <div className="text-center text-red-400 py-8">
                {receivedError}
                <Button
                  variant="outline"
                  className="ml-4 text-xs"
                  onClick={fetchReceivedMovies}
                >
                  Retry
                </Button>
              </div>
            )}

            {!receivedLoading && !receivedError && receivedMovies.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No suggestions received{receivedStatus !== "all" ? ` with ${receivedStatus} status` : ""} yet.
              </div>
            )}

            <div className="space-y-4">
              {receivedMovies.map((movie) => (
                <motion.div
                  key={movie.movsug_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#292938] rounded-lg overflow-hidden"
                >
                  <div className="flex p-3">
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={`https://suggesto.xyz/App/posters/${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/api/placeholder/80/112"
                        }}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">Suggested to you</span>
                        <span className="text-xs text-gray-500">• {formatDate(movie.added_date)}</span>
                        <div className="ml-auto flex items-center gap-1">
                          {getStatusIcon(movie.status)}
                          <span className={`text-xs ${getStatusClass(movie.status)}`}>
                            {getStatusText(movie.status)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium mb-1">{movie.title}</h3>
                      {movie.note && (
                        <p className="text-xs text-gray-400 bg-[#181826] p-2 rounded-lg mb-2">
                          {movie.note}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="rounded-full text-xs h-8 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                          onClick={() => router.push(`/movie-detail-page?id=${movie.movie_id}`)}
                        >
                          Watch Now
                        </Button>
                        {movie.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-8 px-3 bg-transparent border-green-600 text-green-400 hover:bg-green-600/20 hover:text-white"
                            >
                              Mark Watched
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-8 px-3 bg-transparent border-red-600 text-red-400 hover:bg-red-600/20 hover:text-white"
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-8 w-8 p-0 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white ml-auto"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="mt-4">
          <div className="px-4">
            {loading && (
              <div className="space-y-4">
                <SkeletonSuggestion />
                <SkeletonSuggestion />
              </div>
            )}

            {error && (
              <div className="text-center text-red-400 py-8">
                {error}
                <Button
                  variant="outline"
                  className="ml-4 text-xs"
                  onClick={fetchSuggestedMovies}
                >
                  Retry
                </Button>
              </div>
            )}

            {!loading && !error && suggestedMovies.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                You haven't suggested any movies yet.
              </div>
            )}

            <div className="space-y-4">
              {suggestedMovies.map((suggestion) => (
                <motion.div
                  key={suggestion.movsug_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#292938] rounded-lg overflow-hidden"
                >
                  <div className="flex p-3">
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={`https://suggesto.xyz/App/posters/${suggestion.poster_path}`}
                        alt={suggestion.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/api/placeholder/80/112"
                        }}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">You suggested</span>
                        <span className="text-xs text-gray-500">• {formatDate(suggestion.added_date)}</span>
                      </div>
                      <h3 className="font-medium mb-1">{suggestion.title}</h3>
                      {suggestion.note && (
                        <p className="text-xs text-gray-400 bg-[#181826] p-2 rounded-lg mb-2">
                          {suggestion.note}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-[#181826] ${getStatusClass(suggestion.status)}`}>
                          {getStatusIcon(suggestion.status)}
                          {getStatusText(suggestion.status)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Rating: {suggestion.rating}/10
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="rounded-full text-xs h-8 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                          onClick={() => router.push(`/movie-detail-page?id=${suggestion.movie_id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-8 px-3 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white"
                        >
                          Suggest Again
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-8 w-8 p-0 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white ml-auto"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSuggestDialog(true)}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Suggest Dialog */}
      <SuggestDialog
        isOpen={showSuggestDialog}
        onClose={() => setShowSuggestDialog(false)}
        onSuggest={handleSuggest}
      />

      <BottomNavigation currentPath="/suggest" />
    </div>
  )
}