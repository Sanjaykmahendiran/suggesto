"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Plus, CheckCircle, Clock, XCircle, ArrowRight, User, Send, Film } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SuggestDialog } from "./_components/suggest-dialog"
import Cookies from "js-cookie"
import NotFound from "@/components/notfound"
import SuggestNotFound from "@/assets/not-found-suggest.png"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { SuggestedMovie, ReceivedMovie, Movie, Friend } from "./type"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import ReceviedSuggestion from "./_components/recevied-suggestion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import SuggestionsSent from "./_components/suggestion-sent"
import { SkeletonSuggestion } from "@/app/suggest/_components/loading"
import DefaultImage from "@/assets/default-user.webp"

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
  const [activeTab, setActiveTab] = useState("suggestions")
  const [showSuggestDialog, setShowSuggestDialog] = useState(false)
  const [suggestedMovies, setSuggestedMovies] = useState<SuggestedMovie[]>([])
  const [receivedMovies, setReceivedMovies] = useState<ReceivedMovie[]>([])
  const [receivedStatus, setReceivedStatus] = useState<ReceivedStatus>("pending")
  const [subFilter, setSubFilter] = useState("received")
  const [loading, setLoading] = useState(false)
  const [receivedLoading, setReceivedLoading] = useState(false)
  const [receivedError, setReceivedError] = useState<string | null>(null)
  const { user, setUser } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [suggestedMoviesOffset, setSuggestedMoviesOffset] = useState(0)
  const [receivedMoviesOffset, setReceivedMoviesOffset] = useState(0)
  const [suggestedHasMore, setSuggestedHasMore] = useState(true)
  const [receivedHasMore, setReceivedHasMore] = useState(true)
  const [suggestedTotalCount, setSuggestedTotalCount] = useState(0)
  const [receivedTotalCount, setReceivedTotalCount] = useState(0)
  const suggestedObserverRef = useRef<HTMLDivElement>(null)
  const receivedObserverRef = useRef<HTMLDivElement>(null)

  // New state for tracking data availability
  const [dataAvailability, setDataAvailability] = useState({
    suggestionsReceived: false,
    suggestionsSent: false,
    requestsReceived: false,
    requestsSent: false
  })
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [hasSetInitialTab, setHasSetInitialTab] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  // Function to set initial tab based on data availability
  const setInitialTabWithData = () => {
    if (hasSetInitialTab) return

    // Find the first tab with data
    const tabsWithData = [
      { tab: "suggestions", subFilter: "received", hasData: dataAvailability.suggestionsReceived },
      { tab: "suggestions", subFilter: "sent", hasData: dataAvailability.suggestionsSent },
      { tab: "requests", subFilter: "received", hasData: dataAvailability.requestsReceived },
      { tab: "requests", subFilter: "sent", hasData: dataAvailability.requestsSent }
    ]

    const firstTabWithData = tabsWithData.find(tab => tab.hasData)

    if (firstTabWithData) {
      setActiveTab(firstTabWithData.tab)
      setSubFilter(firstTabWithData.subFilter)
    }

    setHasSetInitialTab(true)
  }

  // Get current tab data availability
  const getCurrentTabDataAvailability = () => {
    if (activeTab === "suggestions") {
      return subFilter === "received" ? dataAvailability.suggestionsReceived : dataAvailability.suggestionsSent
    } else {
      return subFilter === "received" ? dataAvailability.requestsReceived : dataAvailability.requestsSent
    }
  }

  // Fetch suggestions when component mounts and when filters change
  useEffect(() => {
    if (activeTab === "suggestions" && subFilter === "received") {
      // Reset pagination state when status changes
      setReceivedMoviesOffset(0)
      setReceivedHasMore(true)
      fetchReceivedMovies(0, false)
    }
  }, [receivedStatus, activeTab, subFilter])

  // Fetch sent suggestions when sent sub-filter is active
  useEffect(() => {
    if (activeTab === "suggestions" && subFilter === "sent") {
      // Reset pagination state when switching to sent tab
      setSuggestedMoviesOffset(0)
      setSuggestedHasMore(true)
      fetchSuggestedMovies(0, false)
    }
  }, [activeTab, subFilter])

  // Set initial tab when data is available
  useEffect(() => {
    if (initialLoadComplete) {
      setInitialTabWithData()
    }
  }, [dataAvailability, initialLoadComplete])

  // Initial data fetch to determine availability
  useEffect(() => {
    const fetchAllDataAvailability = async () => {
      try {
        const userId = Cookies.get('userID')

        // Check all data sources simultaneously
        const [
          suggestionsReceivedRes,
          suggestionsSentRes,
          // Add your requests API calls here when available
        ] = await Promise.allSettled([
          fetch(`https://suggesto.xyz/App/api.php?gofor=receivedmovies&user_id=${userId}&status=pending`),
          fetch(`https://suggesto.xyz/App/api.php?gofor=suggestedmovies&user_id=${userId}`),
          // Add requests API calls here
        ])

        const newDataAvailability = {
          suggestionsReceived: false,
          suggestionsSent: false,
          requestsReceived: false,
          requestsSent: false
        }

        // Check suggestions received
        if (suggestionsReceivedRes.status === 'fulfilled' && suggestionsReceivedRes.value.ok) {
          const data = await suggestionsReceivedRes.value.json()
          newDataAvailability.suggestionsReceived = Array.isArray(data) && data.length > 0
        }

        // Check suggestions sent
        if (suggestionsSentRes.status === 'fulfilled' && suggestionsSentRes.value.ok) {
          const data = await suggestionsSentRes.value.json()
          newDataAvailability.suggestionsSent = Array.isArray(data) && data.length > 0
        }

        // TODO: Add requests data checking here when APIs are available
        // For now, you can manually set these based on your other components
        // newDataAvailability.requestsReceived = await checkRequestsReceived()
        // newDataAvailability.requestsSent = await checkRequestsSent()

        setDataAvailability(newDataAvailability)
        setInitialLoadComplete(true)
      } catch (error) {
        console.error('Error checking data availability:', error)
        setInitialLoadComplete(true)
      }
    }

    fetchAllDataAvailability()
  }, [])

  const fetchSuggestedMovies = async (currentOffset: number = 0, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setLoading(true)
    }

    try {
      const userId = Cookies.get('userID')
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=suggestedmovies&user_id=${userId}&limit=10&offset=${currentOffset}`)

      if (!response.ok) {
        throw new Error('Failed to fetch suggested movies')
      }

      const data = await response.json()
      const fetchedMovies = data?.data || []

      // Set total count from API response
      if (data?.total_count !== undefined) {
        setSuggestedTotalCount(data.total_count)
      }

      if (isLoadMore) {
        setSuggestedMovies(prev => [...prev, ...fetchedMovies])
      } else {
        setSuggestedMovies(fetchedMovies)
      }

      // Check if there are more movies to load
      if (fetchedMovies.length < 10) {
        setSuggestedHasMore(false)
      }

      if (fetchedMovies.length > 0) {
        setSuggestedMoviesOffset(currentOffset + fetchedMovies.length)
      }

      // Update data availability
      setDataAvailability(prev => ({
        ...prev,
        suggestionsSent: Array.isArray(fetchedMovies) && fetchedMovies.length > 0
      }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching suggested movies:', err)
      setDataAvailability(prev => ({
        ...prev,
        suggestionsSent: false
      }))
    } finally {
      setLoading(false)
    }
  }

  // Replace the existing fetchReceivedMovies function
  const fetchReceivedMovies = async (currentOffset: number = 0, isLoadMore: boolean = false) => {
    if (!isLoadMore) {
      setReceivedLoading(true)
    }
    setReceivedError(null)

    try {
      const userId = Cookies.get('userID')
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=receivedmovies&user_id=${userId}&limit=10&offset=${currentOffset}&status=${receivedStatus}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch ${receivedStatus} received movies`)
      }

      const data = await response.json()
      const fetchedMovies = data?.data || []

      // Set total count from API response
      if (data?.total_count !== undefined) {
        setReceivedTotalCount(data.total_count)
      }

      if (isLoadMore) {
        setReceivedMovies(prev => [...prev, ...fetchedMovies])
      } else {
        setReceivedMovies(fetchedMovies)
        setReceivedMoviesOffset(0) // Reset offset when not loading more
      }

      // Check if there are more movies to load
      if (fetchedMovies.length < 10) {
        setReceivedHasMore(false)
      } else {
        setReceivedHasMore(true)
      }

      if (fetchedMovies.length > 0) {
        setReceivedMoviesOffset(currentOffset + fetchedMovies.length)
      }

      // Update data availability
      setDataAvailability(prev => ({
        ...prev,
        suggestionsReceived: Array.isArray(fetchedMovies) && fetchedMovies.length > 0
      }))
    } catch (err) {
      console.error('Error fetching received movies:', err)
      setReceivedError(err instanceof Error ? err.message : 'An error occurred')
      setDataAvailability(prev => ({
        ...prev,
        suggestionsReceived: false
      }))
    } finally {
      setReceivedLoading(false)
    }
  }

  // Add intersection observers for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !loading && suggestedHasMore && activeTab === "suggestions" && subFilter === "sent") {
          fetchSuggestedMovies(suggestedMoviesOffset, true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (suggestedObserverRef.current) {
      observer.observe(suggestedObserverRef.current)
    }

    return () => observer.disconnect()
  }, [loading, suggestedHasMore, suggestedMoviesOffset, activeTab, subFilter])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !receivedLoading && receivedHasMore && activeTab === "suggestions" && subFilter === "received") {
          fetchReceivedMovies(receivedMoviesOffset, true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (receivedObserverRef.current) {
      observer.observe(receivedObserverRef.current)
    }

    return () => observer.disconnect()
  }, [receivedLoading, receivedHasMore, receivedMoviesOffset, activeTab, subFilter, receivedStatus])


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
        )
      default:
        return <div className="flex gap-2"></div>
    }
  }

  // Custom tab change handler
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Reset subFilter to "received" when switching main tabs
    setSubFilter("received")
  }

  return (
    <div className="text-white min-h-screen mb-22">
      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-8">
        <div className="flex items-center gap-2">
          <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Suggest</h1>
            <p className="text-sm text-white/60">Discover and connect with profiles</p>
          </div>
        </div>
        <Link href="/profile">
          <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-[#ff7db8] to-[#ee2a7b]">
            <div className="h-full w-full rounded-full overflow-hidden bg-black">
              <Image
                src={user?.imgname || DefaultImage }
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Link>
      </header>

      {/* Main Tabs */}
      <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-2 bg-transparent rounded-md overflow-hidden">
            <TabsTrigger
              value="suggestions"
              className="bg-transparent text-white data-[state=active]:text-white data-[state=active]:bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] transition-colors duration-200 relative"
            >
              Suggestions
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="bg-transparent text-white data-[state=active]:text-white data-[state=active]:bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] transition-colors duration-200 relative"
            >
              Requests
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions">
          {/* Sub-filter for Suggestions */}
          <div className="px-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setSubFilter("received")}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 
                  ${subFilter === "received"
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-[#ff7db8] after:to-[#ee2a7b]"
                    : "text-gray-400 border-b-2 border-transparent hover:text-white"}`}
              >
                Received
              </button>
              <button
                onClick={() => setSubFilter("sent")}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 
                  ${subFilter === "sent"
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-[#ff7db8] after:to-[#ee2a7b]"
                    : "text-gray-400 border-b-2 border-transparent hover:text-white"}`}
              >
                Sent
              </button>
            </div>

            <div className="border-b border-gray-700 -mt-0.5"></div>
          </div>

          {/* Received Suggestions Content */}
          {subFilter === "received" && (
            <>
              {/* Filter Dropdown */}
              <div className="flex justify-end px-4 mb-6">
                <Select value={receivedStatus} onValueChange={(value) => setReceivedStatus(value as ReceivedStatus)}>
                  <SelectTrigger className="w-[140px] bg-[#2b2b2b] text-white border-gray-600 focus:border-[#ff7db8]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2b2b2b] text-white rounded-xl">
                    <SelectItem value="pending" className="text-white ">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="accepted" className="text-white ">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accepted
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected" className="text-white ">
                      <div className="flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                      onClick={() => fetchReceivedMovies()}
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {!receivedLoading && !receivedError && receivedMovies.length === 0 && (
                  <NotFound
                    imageSrc={SuggestNotFound}
                    description={`No suggestions received with ${receivedStatus} status yet.`}
                  />
                )}

                <div className="space-y-4">
                  {receivedMovies.map((movie) => (

                    <motion.div
                      key={movie.movsug_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#2b2b2b] rounded-lg overflow-hidden"
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
                              <p className="text-xs text-gray-400 flex items-center">
                                <User className="w-4 h-4" />
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
                            <div className="flex items-center justify-between gap-3 whitespace-nowrap">
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

                  {/* Loading more indicator */}
                  {receivedLoading && receivedMoviesOffset > 0 && (
                    <div className="flex justify-center py-8">
                      <div className="space-y-4 w-full">
                        <SkeletonSuggestion />
                        <SkeletonSuggestion />
                      </div>
                    </div>
                  )}

                  {/* Intersection observer target */}
                  {receivedHasMore && !receivedLoading && (
                    <div ref={receivedObserverRef} className="h-4 w-full" />
                  )}


                </div>
              </div>
            </>
          )}

          {/* Sent Suggestions Content */}
          {subFilter === "sent" && (
            <div className="px-4">
              {loading && (
                <div className="space-y-4">
                  <SkeletonSuggestion />
                  <SkeletonSuggestion />
                </div>
              )}

              {!loading && suggestedMovies.length === 0 && (
                <NotFound
                  imageSrc={SuggestNotFound}
                  description="You haven't suggested any movies yet."
                />
              )}

              <div className="space-y-4">
                {suggestedMovies.map((suggestion) => (
                  <motion.div
                    key={suggestion.movsug_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#2b2b2b] rounded-lg overflow-hidden"
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
                            <p className="text-xs text-gray-400 flex items-center">
                              <User className="w-4 h-4" />
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

                {/* Loading more indicator */}
                {loading && suggestedMoviesOffset > 0 && (
                  <div className="flex justify-center py-8">
                    <div className="space-y-4 w-full">
                      <SkeletonSuggestion />
                      <SkeletonSuggestion />
                    </div>
                  </div>
                )}

                {/* Intersection observer target */}
                {suggestedHasMore && !loading && (
                  <div ref={suggestedObserverRef} className="h-4 w-full" />
                )}

              </div>
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          {/* Sub-filter for Requests */}
          <div className="px-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setSubFilter("received")}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 
                  ${subFilter === "received"
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-[#ff7db8] after:to-[#ee2a7b]"
                    : "text-gray-400 border-b-2 border-transparent hover:text-white"}`}
              >
                Received
              </button>
              <button
                onClick={() => setSubFilter("sent")}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 
                  ${subFilter === "sent"
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-[#ff7db8] after:to-[#ee2a7b]"
                    : "text-gray-400 border-b-2 border-transparent hover:text-white"}`}
              >
                Sent
              </button>
            </div>

            <div className="border-b border-gray-700 -mt-0.5"></div>
          </div>

          {/* Received Requests Content */}
          {subFilter === "received" && (
            <div className="z-50">
              <ReceviedSuggestion /></div>
          )}

          {/* Sent Requests Content */}
          {subFilter === "sent" && (
            <SuggestionsSent />
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] flex items-center justify-center shadow-lg z-40"
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
              className="fixed bottom-24 right-4 w-48 p-3 rounded-lg bg-[#ff7db8]/20 backdrop-blur-sm border border-[#ee2a7b]/30 flex items-center gap-2 shadow-lg z-40"
              onClick={() => {
                setShowSuggestDialog(true)
                setIsOpen(false)
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
              className="fixed bottom-24 right-4 w-48 p-3 rounded-lg bg-[#ff7db8]/20 backdrop-blur-sm border border-[#ee2a7b]/30 flex items-center gap-2 shadow-lg z-40"
              onClick={() => {
                router.push("/request-suggestion")
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
  )
}