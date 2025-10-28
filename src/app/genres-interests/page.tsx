"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import toast from "react-hot-toast"

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
  const [selectionError, setSelectionError] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://suggesto.xyz/App/api.php?gofor=genreslist")

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data: Genre[] = await response.json()
        setGenres(data)

        const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") : null

        if (userId) {
          const userInterestsResponse = await fetch(
            `https://suggesto.xyz/App/api.php?gofor=userintlist&user_id=${userId}`
          )

          if (userInterestsResponse.ok) {
            const userInterestsData = await userInterestsResponse.json()

            if (
              userInterestsData &&
              Array.isArray(userInterestsData) &&
              userInterestsData.length > 0
            ) {
              setIsEditMode(true)
              const userGenreIds = userInterestsData.map(
                (interest) => interest.genre_id
              )
              setSelectedGenreIds(userGenreIds)

              const userGenreNames = userGenreIds
                .map((id) => {
                  const genre = data.find((g) => g.genre_id === id)
                  return genre ? genre.name : ""
                })
                .filter((name) => name !== "")

              setSelectedInterests(userGenreNames)
            } else {
              setDefaultInterests(data)
            }
          } else {
            setDefaultInterests(data)
          }
        } else {
          setDefaultInterests(data)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load genres")
        console.error("Error fetching genres:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGenres()
  }, [])

  // Clear selection error after 2 seconds
  useEffect(() => {
    if (selectionError) {
      const timer = setTimeout(() => setSelectionError(""), 2000)
      return () => clearTimeout(timer)
    }
  }, [selectionError])

  const setDefaultInterests = (data: Genre[]) => {
    if (data.length > 0) {
      const defaultGenres = data
        .filter((genre) => ["Action", "Sci-Fi"].includes(genre.name))
        .map((genre) => genre.name)

      setSelectedInterests(defaultGenres)

      const defaultGenreIds = data
        .filter((genre) => ["Action", "Sci-Fi"].includes(genre.name))
        .map((genre) => genre.genre_id)

      setSelectedGenreIds(defaultGenreIds)
    }
  }

  const toggleInterest = (genre: Genre) => {
    const isSelected = selectedInterests.includes(genre.name)

    if (!isSelected && selectedInterests.length >= 5) {
      setSelectionError("Select up to 5 genres.")
      return
    }

    if (isSelected) {
      setSelectedInterests((prev) => prev.filter((i) => i !== genre.name))
      setSelectedGenreIds((prev) => prev.filter((id) => id !== genre.genre_id))
    } else {
      setSelectedInterests((prev) => [...prev, genre.name])
      setSelectedGenreIds((prev) => [...prev, genre.genre_id])
    }
  }

  const handleContinue = async () => {
    try {
      setIsSubmitting(true)
      const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") || "" : ""

      const endpoint = "https://suggesto.xyz/App/api.php"
      const payload = {
        gofor: isEditMode ? "edituserint" : "adduserint",
        user_id: userId,
        genre_id: selectedGenreIds,
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log(
        `Interests ${isEditMode ? "updated" : "saved"} successfully:`,
        data
      )

      if (isEditMode) {
        router.push("/profile")
      } else {
        router.push("/language")
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditMode ? "update" : "save"} interests`
      )
      console.error(
        `Error ${isEditMode ? "updating" : "saving"} interests:`,
        err
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-8">
        <button
          className="mr-2 p-2 rounded-full bg-[#2b2b2b] transition-colors"
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
            ? "Update your interests for better movie recommendations."
            : "Select your interests to get the best movie recommendations anytime."}
        </p>

        <div className="flex justify-between items-center mt-2">
          {selectionError ? (
            <p className="text-red-500 text-sm">{selectionError}</p>
          ) : (
            <span />
          )}
          <p className="text-gray-400 text-sm">
            Selected{" "}
            <span className="px-4 py-1 rounded-3xl border-0 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white">
              {selectedInterests.length}/5
            </span>
          </p>
        </div>
      </div>



      {/* Interests Grid */}
      <div className="px-4 pb-32">
        {isLoading ? (
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-8 w-24 rounded-full bg-[#2b2b2b]"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-5">
              {genres.map((genre) => (
                <button
                  key={genre.genre_id}
                  className={`rounded-full px-4 py-2 text-sm ${selectedInterests.includes(genre.name)
                    ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white"
                    : "bg-[#2b2b2b] text-white"
                    }`}
                  onClick={() => toggleInterest(genre)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="fixed px-2 bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-20 flex items-center justify-center">
        <Button
          variant="default"
          className="w-full"
          onClick={handleContinue}
          disabled={
            isLoading || isSubmitting || selectedGenreIds.length === 0
          }
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {isEditMode ? "UPDATING..." : "SAVING..."}
            </span>
          ) : isEditMode ? (
            "UPDATE"
          ) : (
            "CONTINUE"
          )}
        </Button>
      </div>
    </div>
  )
}
