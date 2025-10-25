"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Plus, CheckCircle, Clock, XCircle, ArrowRight, User, Send, Film, Zap, Eye, Check, Star } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { SuggestDialog } from "./_components/suggest-dialog"
import Cookies from "js-cookie"
import NotFound from "@/components/notfound"
import SuggestNotFound from "@/assets/not-found-suggest.png"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import { SuggestedMovie, ReceivedMovie, Movie, Friend } from "./type"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from "react-hot-toast"
import { SkeletonSuggestion } from "@/app/suggest-movie/_components/loading"
import DefaultImage from "@/assets/default-user.webp"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTourIntegration } from "@/hooks/useTourIntegration"

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

export default function SuggestMovie() {
  const router = useRouter()
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
  const [activeStatsPopup, setActiveStatsPopup] = useState<string | null>(null)

  const toggleMenu = () => setIsOpen(!isOpen)

  useTourIntegration('suggest', [loading], !loading)

  const handleBoost = async (suggestionId: string) => {
    try {
      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gofor: "boostmysuggestion",
          movsug_id: suggestionId,
        }),
      })

      const data = await response.json()

      if (data.status === "success") {
        toast.success(data.message)
      } else {
        toast.error(data.message || "Failed to boost suggestion.")
      }
    } catch (error) {
      console.error("Boosting error:", error)
      toast.error("Something went wrong while boosting.")
    }
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveStatsPopup(null)
    }

    if (activeStatsPopup) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [activeStatsPopup])

  // Fetch suggestions when component mounts and when filters change
  useEffect(() => {
    if (subFilter === "received") {
      // Reset pagination state when status changes
      setReceivedMoviesOffset(0)
      setReceivedHasMore(true)
      fetchReceivedMovies(0, false)
    }
  }, [receivedStatus, subFilter])

  // Fetch sent suggestions when sent sub-filter is active
  useEffect(() => {
    if (subFilter === "sent") {
      // Reset pagination state when switching to sent tab
      setSuggestedMoviesOffset(0)
      setSuggestedHasMore(true)
      fetchSuggestedMovies(0, false)
    }
  }, [subFilter])

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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching suggested movies:', err)
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
    } catch (err) {
      console.error('Error fetching received movies:', err)
      setReceivedError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setReceivedLoading(false)
    }
  }

  // Add intersection observers for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !loading && suggestedHasMore && subFilter === "sent") {
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
  }, [loading, suggestedHasMore, suggestedMoviesOffset, subFilter])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !receivedLoading && receivedHasMore && subFilter === "received") {
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
  }, [receivedLoading, receivedHasMore, receivedMoviesOffset, subFilter, receivedStatus])

  // Handle suggestion from dialog
  const handleSuggest = (movies: Movie[], friends: Friend[], note: string) => {
    console.log('Suggesting:', { movies, friends, note })
    setShowSuggestDialog(false)
    // Show success message or notification
    // Optionally refresh the suggestions list
    if (subFilter === "sent") {
      fetchSuggestedMovies()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-3.5 h-3.5 text-green-400" />
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5 text-red-400" />
      case 'pending':
      default:
        return <Clock className="w-3.5 h-3.5 text-yellow-400" />
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

  const handleViewSuggestion = async (movsugId: string) => {
    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=suggestionviewed&movsug_id=${movsugId}`)
      if (!response.ok) {
        throw new Error('Failed to mark suggestion as viewed')
      }
      // Optionally handle the response
      const data = await response.json()
      console.log('Suggestion viewed:', data)
    } catch (error) {
      console.error('Error marking suggestion as viewed:', error)
    }
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
            <h1 className="text-xl font-bold">Movie Suggestions</h1>
            <p className="text-sm text-white/60">Share and receive movie recommendations</p>
          </div>
        </div>
        <Link href="/profile">
          <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-[#ff7db8] to-[#ee2a7b]">
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
      </header>

      {/* Sub-filter for Suggestions */}
      <div className="px-4 mb-6" data-tour-target="sub-filter-tabs">
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
                <SelectItem value="pending" className="text-white">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="accepted" className="text-white">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accepted
                  </div>
                </SelectItem>
                <SelectItem value="rejected" className="text-white">
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
                title="No Suggestions Received"
                description={`No suggestions received with ${receivedStatus} status yet.`}
              />
            )}

            <div className="space-y-4">
              {receivedMovies.map((movie) => (
                <motion.div
                  key={movie.movsug_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#2b2b2b] rounded-lg overflow-hidden cursor-pointer"
                  onClick={movie.status === 'pending' ? () => {
                    handleViewSuggestion(String(movie.movsug_id))
                    router.push(`/suggest/suggest-detail-page?movsug_id=${movie.movsug_id}&movie_id=${movie.movie_id}`)
                  } : undefined}
                >
                  <div className="flex p-3 gap-4 items-center">
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
                      {/* Rating Badge */}
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-[#b56bbc] to-[#ee2a7b] text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1 z-10">
                        <Star className="w-3 h-3 text-white" />
                        {parseFloat(movie.rating).toFixed(1)}
                      </div>
                    </div>

                    {/* Movie Content */}
                    <div className="flex flex-col justify-between flex-1 min-h-[6.5rem]">
                      <div>
                        {/* Header Info */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-xs text-gray-400 flex items-center">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-semibold text-xs pl-1 text-white">{movie.suggested_by_name || "user"}</span>
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
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-xs px- py-1 rounded-full flex items-center gap-1 ${getStatusClass(movie.status)}`}>
                          {getStatusIcon(movie.status)}
                          {getStatusText(movie.status)}
                        </span>
                        <div className="flex items-center gap-2">
                          {renderActionButtons(movie)}
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
              title="No Suggestions Sent"
              description="You haven't suggested any movies yet."
            />
          )}

          <div className="space-y-6 mb-10">
            {suggestedMovies.map((group) => {
              // Group movies by title to show aggregated stats
              const movieGroups = group.movies.reduce((acc: { [x: string]: { movieData: any; suggestions: any[] } }, movie: { title: string | number }) => {
                if (!acc[movie.title]) {
                  acc[movie.title] = {
                    movieData: movie,
                    suggestions: []
                  };
                }
                acc[movie.title].suggestions.push(movie);
                return acc;
              }, {});

              return (
                <motion.div
                  key={group.group_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#2b2b2b] rounded-lg overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="px-3 py-2 bg-[#1a1a1a] border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Suggested on {formatDate(group.suggested_on)}
                      </p>
                      <span className="text-xs text-gray-500">
                        {Object.keys(movieGroups).length} movie{Object.keys(movieGroups).length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Movies in Group */}
                  <div className="divide-y divide-gray-700">
                    {Object.values(movieGroups).map((movieGroup, index) => {
                      const movie = movieGroup.movieData;
                      const suggestions = movieGroup.suggestions;

                      // Calculate aggregated stats
                      const totalAccepted = suggestions.filter((s: { status: string }) => s.status === 'accepted').length;
                      const totalRecipients = suggestions.length;
                      const isBoosted = suggestions.some((s: { is_boosted: number }) => s.is_boosted === 1);
                      // pending status means viewed, so we look for pending (viewed) suggestions that aren't boosted
                      const hasPendingToBoost = suggestions.some((s: { status: string; is_boosted: number }) => s.status === 'pending' && s.is_boosted === 0);

                      return (
                        <div key={`${movie.title}-${index}`} className="p-3">
                          <div className="flex">
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
                            <div className="ml-3 flex flex-col justify-between flex-1">
                              <div>
                                {/* Movie Title */}
                                <h3 className="font-medium text-sm text-white mb-1">{movie.title}</h3>

                                {/* Suggested To */}
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-gray-400 mb-1">Suggested to:</p>
                                  <div className="flex -space-x-2">
                                    {suggestions.map((s: { suggested_to_id: string, suggested_to_name: string, suggested_tophoto: string }) => (
                                      <Avatar key={s.suggested_to_id} className="h-8 w-8 border border-[#ff7db8]">
                                        <AvatarImage
                                          src={s.suggested_tophoto}
                                          alt={s.suggested_to_name}
                                          className="object-cover"
                                        />
                                        <AvatarFallback className="bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b]">
                                          {s.suggested_to_name?.[0] || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                </div>

                                {/* Genres & Rating */}
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="text-xs text-gray-400">
                                    {Array.isArray(movie.genres) && movie.genres.length > 0
                                      ? movie.genres.slice(0, 2).join(", ")
                                      : "No genres"}
                                  </p>
                                  <span className="text-xs text-gray-400">
                                    {parseFloat(movie.rating).toFixed(1)}/10
                                  </span>
                                </div>

                                {/* Stats Row */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-xs text-gray-400">
                                    {/* Views */}
                                    <span className="flex items-center gap-1">
                                      <span className="font-medium">
                                        <Eye className="w-4 h-4 inline" />
                                      </span>
                                      {movie.is_viewed} / {totalRecipients}
                                    </span>

                                    {/* Accepted */}
                                    <span className="flex items-center gap-1">
                                      <span className="font-medium">
                                        <CheckCircle className="w-4 h-4 inline" />
                                      </span>
                                      {totalAccepted}
                                    </span>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2">
                                    {/* Boost/Boosted Button */}
                                    {isBoosted ? (
                                      // Already Boosted
                                      <button
                                        data-tour-target="boost-button"
                                        disabled
                                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] opacity-80 cursor-not-allowed"
                                      >
                                        <Zap className="w-3 h-3" />
                                        Boosted
                                      </button>
                                    ) : (
                                      // Show Boost button for eligible users
                                      hasPendingToBoost && (
                                        <button
                                          onClick={() => {
                                            if (user?.payment_status === 1) {
                                              const pendingSuggestion = suggestions.find((s: { status: string }) => s.status === "pending");
                                              if (pendingSuggestion) {
                                                handleBoost(String(pendingSuggestion.movsug_id));
                                              }
                                            } else {
                                              // Redirect to premium
                                              router.push("/premium");
                                            }
                                          }}
                                          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] hover:shadow-lg transition-all duration-200"
                                        >
                                          <Zap className="w-3 h-3" />
                                          Boost
                                        </button>
                                      )
                                    )}

                                    {/* View Details Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setActiveStatsPopup(activeStatsPopup === `${group.group_id}-${movie.title}` ? null : `${group.group_id}-${movie.title}`)
                                      }}
                                      className="text-xs text-[#ff7db8] hover:text-[#ee2a7b] transition-colors"
                                    >
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Group Note */}
                  {group.movies[0]?.note && (
                    <div className="px-3 py-2 bg-[#1a1a1a] border-t border-gray-700">
                      <p className="text-xs text-gray-400">
                        <span className="font-medium text-white">Note:</span> {group.movies[0].note}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}

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

          {/* Centered Modal Popup for Suggestion Details */}
          {activeStatsPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#2b2b2b] rounded-lg border border-gray-700 w-full max-w-md max-h-[80vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <h4 className="text-lg font-medium text-white">Suggestion Details</h4>
                  <button
                    onClick={() => setActiveStatsPopup(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-4">
                  <div className="space-y-3">
                    {(() => {
                      // Find the active movie data
                      const activeGroup = suggestedMovies.find(group =>
                        Object.keys(group.movies.reduce((acc: { [x: string]: { movieData: any; suggestions: any[] } }, movie: { title: string | number }) => {
                          if (!acc[movie.title]) {
                            acc[movie.title] = { movieData: movie, suggestions: [] };
                          }
                          acc[movie.title].suggestions.push(movie);
                          return acc;
                        }, {})).some(title => `${group.group_id}-${title}` === activeStatsPopup)
                      );

                      if (!activeGroup) return null;

                      const movieGroups = activeGroup.movies.reduce((acc: { [x: string]: { movieData: any; suggestions: any[] } }, movie: { title: string | number }) => {
                        if (!acc[movie.title]) {
                          acc[movie.title] = { movieData: movie, suggestions: [] };
                        }
                        acc[movie.title].suggestions.push(movie);
                        return acc;
                      }, {});

                      const activeTitle = activeStatsPopup.split('-').slice(1).join('-');
                      const activeMovieGroup = movieGroups[activeTitle];

                      if (!activeMovieGroup) return null;

                      return activeMovieGroup.suggestions.map((suggestion: { suggested_to_name: string; is_viewed: any; status: string }, idx: any) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">{suggestion.suggested_to_name}</span>
                            <span className="text-xs text-gray-400">Views: {suggestion.is_viewed || 0}</span>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${getStatusClass(suggestion.status)}`}>
                            {getStatusIcon(suggestion.status)}
                            {getStatusText(suggestion.status)}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <motion.button
        data-tour-target="floating-action-menu"
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] flex items-center justify-center shadow-lg z-40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleMenu}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
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
        )}
      </AnimatePresence>

      {/* Suggest Dialog */}
      <SuggestDialog
        isOpen={showSuggestDialog}
        onClose={() => setShowSuggestDialog(false)}
        onSuggest={handleSuggest}
      />

      <BottomNavigation currentPath={"/suggestions-page"} />
    </div>
  )
}
