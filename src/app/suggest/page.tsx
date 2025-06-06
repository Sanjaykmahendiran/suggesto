"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Plus, CheckCircle, Clock, XCircle, ArrowRight, User, Send, Film } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuggestDialog } from "./_components/suggest-dialog"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"
import NotFound from "@/components/notfound"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { SuggestedMovie, ReceivedMovie, Movie, Friend } from "./type"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import ReceviedSuggestion from "./_components/recevied-suggestion"

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


type ReceivedStatus = "pending" | "accepted" | "rejected"

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
  const [receivedStatus, setReceivedStatus] = useState<ReceivedStatus>("pending")
  const [loading, setLoading] = useState(false)
  const [receivedLoading, setReceivedLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receivedError, setReceivedError] = useState<string | null>(null)
  const { user, setUser } = useUser()
  const [isOpen, setIsOpen] = useState(false);



  const toggleMenu = () => setIsOpen(!isOpen);

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
      const userId = Cookies.get('userID') || '1'
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
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=receivedmovies&user_id=${userId}&status=${receivedStatus}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch ${receivedStatus} received movies`)
      }

      const data: ReceivedMovie[] = await response.json()
      setReceivedMovies(data)
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
        return 'Accepted'
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


  // Renders action buttons for each movie based on its status
  function renderActionButtons(movie: ReceivedMovie) {
    switch (movie.status) {
      case 'pending':
        return (
          <button
            className="p-0"
            onClick={() => router.push(`/suggest/suggest-detail-page?movsug_id=${movie.movsug_id}`)}
          >
            <ArrowRight className="w-8 h-6 text-primary" />
          </button>
        );
      default:
        return <div className="flex gap-2"></div>;
    }
  }


  return (

    // <PageTransitionWrapper>
      <div className="text-white min-h-screen mb-22">
        {/* Header */}
        <header className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Suggest</h1>
          </div>
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
        </header>

        {/* Tabs */}
        <Tabs defaultValue="received" className="w-full" onValueChange={setActiveTab}>
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent">
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
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-[#6c5ce7] transition-colors duration-200"
              >
                Requested you
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Received Tab */}
          <TabsContent value="received" className="mt-4">
            {/* Categories */}
            <div className="flex space-x-2 px-4 overflow-x-auto pb-2 no-scrollbar">
              <button
                className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${receivedStatus === 'pending'
                  ? 'bg-[#6c5ce7] text-white'
                  : 'bg-transparent text-gray-300 border border-gray-600'
                  }`}
                onClick={() => setReceivedStatus('pending')}
              >
                <Clock className="w-4 h-4 mr-1" />
                Pending
              </button>
              <button
                className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${receivedStatus === 'accepted'
                  ? 'bg-[#6c5ce7] text-white'
                  : 'bg-transparent text-gray-300 border border-gray-600'
                  }`}
                onClick={() => setReceivedStatus('accepted')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Accepted
              </button>
              <button
                className={`flex items-center justify-center px-6 py-2 rounded-full text-sm whitespace-nowrap ${receivedStatus === 'rejected'
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
                <NotFound
                  description={`No suggestions received with ${receivedStatus} status yet.`}
                />
              )}

              <div className="space-y-4">
                {receivedMovies.map((movie) => (
                  <motion.div
                    key={movie.movsug_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#292938] rounded-lg overflow-hidden"
                    onClick={movie.status === 'pending' ? () => router.push(`/suggest/suggest-detail-page?movsug_id=${movie.movsug_id}`) : undefined}
                  >
                    <div className="flex p-3">
                      {/* Movie Poster */}
                      <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={`https://suggesto.xyz/App/${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/api/placeholder/80/112"
                          }}
                        />
                      </div>

                      {/* Movie Content */}
                      <div className="ml-4 flex flex-col justify-between flex-1">
                        <div>
                          {/* Header Info */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-xs text-gray-400 flex items-center"><User className="w-4 h-4" />
                              <span className="font-bold pl-1 text-white">{movie.suggested_by_name || "user"}</span>
                            </p>
                            <span className="text-xs text-gray-500">• {formatDate(movie.added_date)}</span>
                          </div>

                          {/* Title */}
                          <h3 className="font-medium text-sm text-white mb-1">{movie.title}</h3>

                          {/* Genres */}
                          <p className="text-xs text-gray-400 mb-2">
                            {Array.isArray(movie.genres) && movie.genres.length > 0
                              ? movie.genres.join(", ")
                              : "No genres available"}
                          </p>

                          {/* Status and Rating */}
                          <div className="flex items-center justify-between gap-3 whitespace-nowrap ">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-[#181826] ${getStatusClass(movie.status)}`}>
                                {getStatusIcon(movie.status)}
                                {getStatusText(movie.status)}
                              </span>
                              <span className="text-xs text-gray-400">
                                Rating: {parseFloat(movie.rating).toFixed(1)}/10
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              {renderActionButtons(movie)}
                            </div>
                          </div>

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
                <NotFound
                  description="You haven't suggested any movies yet."
                />
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
                      {/* Movie Poster */}
                      <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={`https://suggesto.xyz/App/${suggestion.poster_path}`}
                          alt={suggestion.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/api/placeholder/80/112"
                          }}
                        />
                      </div>

                      {/* Movie Content */}
                      <div className="ml-4 flex flex-col justify-between flex-1">
                        <div>
                          {/* Header Info */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-xs text-gray-400 flex items-center"><User className="w-4 h-4" />
                              <span className="font-bold pl-1 text-white">{suggestion.suggested_to_name || "user"}</span>
                            </p>
                            <span className="text-xs text-gray-500">• {formatDate(suggestion.added_date)}</span>
                          </div>

                          {/* Title */}
                          <h3 className="font-medium text-sm text-white mb-1">{suggestion.title}</h3>

                          {/* Genres */}
                          <p className="text-xs text-gray-400 mb-2">
                            {Array.isArray(suggestion.genres) && suggestion.genres.length > 0
                              ? suggestion.genres.join(", ")
                              : "No genres available"}
                          </p>

                          {/* Status and Rating */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-[#181826] ${getStatusClass(suggestion.status)}`}>
                              {getStatusIcon(suggestion.status)}
                              {getStatusText(suggestion.status)}
                            </span>
                            <span className="text-xs text-gray-400">
                              Rating: {parseFloat(suggestion.rating).toFixed(1)}/10
                            </span>

                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <ReceviedSuggestion />
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <motion.button
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg z-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMenu}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.button
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -60 }}
                exit={{ opacity: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="fixed bottom-24 right-4 w-48 p-3 rounded-lg bg-[#6c5ce7]/20 backdrop-blur-sm border border-[#6c5ce7]/30 flex items-center gap-2 shadow-lg z-40"
                onClick={() => {
                  setShowSuggestDialog(true);
                  setIsOpen(false);
                }}
              >
                <Film size={20} />
                Suggest Movie
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -120 }}
                exit={{ opacity: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="fixed bottom-24 right-4 w-48 p-3 rounded-lg bg-[#6c5ce7]/20 backdrop-blur-sm border border-[#6c5ce7]/30 flex items-center gap-2 shadow-lg z-40"
                onClick={() => {
                  router.push("/request-suggestion");
                }}
              >
                <Send size={20} />
                Request Movie
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Suggest Dialog */}
        <SuggestDialog
          isOpen={showSuggestDialog}
          onClose={() => setShowSuggestDialog(false)}
          onSuggest={handleSuggest}
        />

        <BottomNavigation currentPath="/suggest" />
      </div>
    // </PageTransitionWrapper>


  )
}