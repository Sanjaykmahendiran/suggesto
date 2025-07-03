"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Clock, MessageSquare, XCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/button"

interface Suggestion {
    movsug_id: number
    movie_id: number
    title: string
    poster_path: string
    backdrop_path: string
    release_date: string
    rating: string
    genres: string[]
    note: string
    suggested_by_user_id: number
    suggested_by_name: string
    suggested_by_image: string
    status: string
    added_date: string
}

interface SuggestionsSectionProps {
    suggestions: Suggestion[]
    title?: string
}

// Skeleton Component
const SuggestionSkeleton = () => (
  <div className="bg-[#2b2b2b] rounded-lg overflow-hidden animate-pulse p-3 flex">
    {/* Poster Placeholder */}
    <div className="w-20 h-28 bg-[#2b2b2b] rounded-lg flex-shrink-0" />

    {/* Content Placeholder */}
    <div className="ml-4 flex flex-col justify-between flex-1 space-y-2">
      {/* Top row: suggested by + time */}
      <div className="flex justify-between gap-2">
        <div className="h-3 bg-[#2b2b2b] rounded w-32" />
        <div className="h-3 bg-[#2b2b2b] rounded w-16" />
      </div>

      {/* Movie title */}
      <div className="h-4 bg-[#2b2b2b] rounded w-3/4" />

      {/* Genres */}
      <div className="h-3 bg-[#2b2b2b] rounded w-1/2" />

      {/* Status + Rating */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 bg-[#2b2b2b] rounded-full w-20" />
          <div className="h-3 bg-[#2b2b2b] rounded w-16" />
        </div>
        <div className="h-6 bg-[#2b2b2b] rounded w-8" />
      </div>
    </div>
  </div>
)

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
    suggestions,
    title = "Suggestions from Friends",
}) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (suggestions && suggestions.length > 0) {
            setIsLoading(false)
        } else {
            setIsLoading(false)
        }
    }, [suggestions])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays} days ago`
        return date.toLocaleDateString()
    }

    const getStatusClass = (status: string) => {
        if (status === "pending") return "text-yellow-400"
        if (status === "accepted") return "text-green-400"
        return "text-gray-400"
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
        if (status === "pending") return "Pending"
        if (status === "accepted") return "Accepted"
        return "Viewed"
    }

    const renderActionButtons = (suggestion: Suggestion) => {
        return (
            <div className="flex gap-2 items-center justify-end">
                <button
                    className="p-0"
                    onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/suggest/suggest-detail-page?movsug_id=${suggestion.movsug_id}`)
                    }}
                >
                    <ArrowRight className="w-8 h-6 text-primary" />
                </button>
            </div>
        )
    }

    if (!suggestions || suggestions.length === 0) return null

    if (isLoading) {
        return (
            <div className="px-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#b56bbc]" />
                        <h2 className="text-lg font-semibold">{title}</h2>
                    </div>
                    <a href="/suggest" className="text-sm text-[#b56bbc]">
                        See All
                    </a>
                </div>
                <div className="space-y-4">
                    {/* Render 3 skeleton items for initial loading */}
                    {[...Array(1)].map((_, index) => (
                        <SuggestionSkeleton key={index} />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#b56bbc]" />
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <a href="/suggest" className="text-sm text-[#b56bbc]">
                    See All
                </a>
            </div>

            <div className="space-y-4">
                {suggestions.map((suggestion) => {
                    return (
                        <motion.div
                            key={suggestion.movsug_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#2b2b2b] rounded-lg overflow-hidden cursor-pointer"
                            onClick={
                                suggestion.status === "pending"
                                    ? () => router.push(`/suggest/suggest-detail-page?movsug_id=${suggestion.movsug_id}`)
                                    : undefined
                            }
                        >
                            <div className="flex p-3">
                                {/* Movie Poster */}
                                <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={
                                            suggestion.poster_path?.startsWith("http")
                                                ? suggestion.poster_path
                                                : `https://suggesto.xyz/App/${suggestion.poster_path || ""}`
                                        }
                                        alt={suggestion.title || "Poster"}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.src = "/api/placeholder/80/112"
                                        }}
                                    />
                                </div>

                                {/* Movie Info */}
                                <div className="ml-4 flex flex-col justify-between flex-1">
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="text-xs text-gray-400">
                                                Suggested by{" "}
                                                <span className="font-bold pl-1 text-white">{suggestion.suggested_by_name}</span>
                                            </p>
                                            <span className="text-xs text-gray-500">• {formatDate(suggestion.added_date)}</span>
                                        </div>

                                        <h3 className="font-medium text-sm text-white mb-1">
                                            {suggestion.title}
                                        </h3>

                                        <p className="text-xs text-gray-400 mb-2">
                                            {Array.isArray(suggestion.genres) && suggestion.genres.length > 0
                                                ? suggestion.genres.join(", ")
                                                : "No genres available"}
                                        </p>
                                        <div className="flex items-center justify-between gap-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-[#181826] ${getStatusClass(suggestion.status)}`}>
                                                    {getStatusIcon(suggestion.status)}
                                                    {getStatusText(suggestion.status)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Rating: {parseFloat(suggestion.rating || "0").toFixed(1)}/10
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                {renderActionButtons(suggestion)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}