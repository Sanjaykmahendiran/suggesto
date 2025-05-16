"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"

// Genre interface based on the API response
interface Genre {
  genre_id: number
  genre_code: string
  tmdb_id: number
  name: string
  status: number
}

export default function InterestsPage() {
  const router = useRouter()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    // Fetch genres from the API
    const fetchGenres = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://suggesto.xyz/App/api.php?gofor=genreslist")

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data: Genre[] = await response.json()
        setGenres(data)
        
        // Get user ID from cookies
        const userId = Cookies.get('userID')
        
        if (userId) {
          // Check if user already has saved interests
          const userInterestsResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=userintlist&user_id=${userId}`)
          
          if (userInterestsResponse.ok) {
            const userInterestsData = await userInterestsResponse.json()
            
            if (userInterestsData && Array.isArray(userInterestsData) && userInterestsData.length > 0) {
              // User has existing interests, set edit mode
              setIsEditMode(true)
              
              // Extract genre IDs from user interests
              const userGenreIds = userInterestsData.map(interest => interest.genre_id)
              setSelectedGenreIds(userGenreIds)
              
              // Set selected interests names based on genre IDs
              const userGenreNames = userGenreIds.map(id => {
                const genre = data.find(g => g.genre_id === id)
                return genre ? genre.name : ""
              }).filter(name => name !== "")
              
              setSelectedInterests(userGenreNames)
            } else {
              // No existing interests, set defaults
              setDefaultInterests(data)
            }
          } else {
            // Failed to fetch user interests, set defaults
            setDefaultInterests(data)
          }
        } else {
          // No user ID, set defaults
          setDefaultInterests(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load genres")
        console.error("Error fetching genres:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGenres()
  }, [])

  const setDefaultInterests = (data: Genre[]) => {
    // Set default selected genres (optional)
    if (data.length > 0) {
      const defaultGenres = data
        .filter(genre => ["Action", "Sci-Fi"].includes(genre.name))
        .map(genre => genre.name)

      setSelectedInterests(defaultGenres)

      // Also set the corresponding genre IDs
      const defaultGenreIds = data
        .filter(genre => ["Action", "Sci-Fi"].includes(genre.name))
        .map(genre => genre.genre_id)

      setSelectedGenreIds(defaultGenreIds)
    }
  }

  const toggleInterest = (genre: Genre) => {
    if (selectedInterests.includes(genre.name)) {
      setSelectedInterests(selectedInterests.filter(i => i !== genre.name))
      setSelectedGenreIds(selectedGenreIds.filter(id => id !== genre.genre_id))
    } else {
      setSelectedInterests([...selectedInterests, genre.name])
      setSelectedGenreIds([...selectedGenreIds, genre.genre_id])
    }
  }

  const handleContinue = async () => {
    try {
      setIsSubmitting(true)
      const userId = Cookies.get('userID') || ''

      const endpoint = "https://suggesto.xyz/App/api.php"
      const payload = {
        gofor: isEditMode ? "edituserint" : "adduserint",
        user_id: userId,
        genre_id: selectedGenreIds
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log(`Interests ${isEditMode ? 'updated' : 'saved'} successfully:`, data)

      // Navigate to appropriate page after successful submission
      if (isEditMode) {
        router.push("/profile")
      } else {
        router.push("/language")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditMode ? 'update' : 'save'} interests`)
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} interests:`, err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (isEditMode) {
      router.push("/profile")
    } else {
      router.push("/language")
    }
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          className="mr-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium">
          {isEditMode ? "Edit your interests" : "Choose your interest"}
        </h1>
      </div>

      {/* Description */}
      <div className="px-4 pb-6">
        <p className="text-gray-400">
          {isEditMode 
            ? "Update your interests to get better movie recommendations."
            : "Choose your interests and get the best movie recommendations. Don't worry you can always change it later."
          }
        </p>
      </div>

      {/* Interests Grid */}
      <div className="px-4 pb-24">
        {isLoading ? (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-8 w-24 rounded-full bg-[#292938]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 py-4">
            Error loading genres: {error}. Using fallback options.
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <button
                key={genre.genre_id}
                className={`rounded-full px-4 py-2 text-sm ${selectedInterests.includes(genre.name)
                    ? "bg-primary text-white"
                    : "bg-gray-800 text-white"
                  }`}
                onClick={() => toggleInterest(genre)}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-[-8] left-0 right-0 flex p-4 bg-[#181826]">
        {!isEditMode && (
          <div className="w-1/2 pr-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              SKIP
            </Button>
          </div>
        )}
        <div className={isEditMode ? "w-full" : "w-1/2 pl-2"}>
          <Button
            variant="default"
            className="w-full"
            onClick={handleContinue}
            disabled={isLoading || isSubmitting || selectedGenreIds.length === 0}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {isEditMode ? "UPDATING..." : "SAVING..."}
              </span>
            ) : (
              isEditMode ? "UPDATE" : "CONTINUE"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}