"use client"

import { useState, useEffect } from "react"
import { Search, X, ArrowLeft, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

type Movie = {
  movie_id: number
  title: string
  poster_path?: string
  release_date?: string
  language?: string
  rating?: number
  genre?: string
  order_no?: number
  is_liked?: boolean
  is_saved?: boolean
  overview?: string
  backdrop_path?: string
  tagline?: string
  popularity?: string
  revenue?: string
}

type Top10Entry = {
  top_id: number
  user_id: number
  movie_id: number
  order_no: number
  created_date: string
  movie: Movie
}

function SortableTopListItem({
  id,
  movie,
  index,
  onRemove,
}: {
  id: string
  movie: Movie
  index: number
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
      layout
    >
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-lg">{movie.title}</h3>
        <p className="text-white/70 text-sm">
          {movie.release_date?.split("-")[0] || "N/A"} • {movie.genre || movie.language?.toUpperCase() || ""}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove(id)
        }}
        className="text-red-400 hover:text-red-300 transition-colors p-2"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </motion.div>
  )
}

export default function AddMoviesPage() {
  const router = useRouter()
  const [allMovies, setAllMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [selectedMovies, setSelectedMovies] = useState<string[]>([])
  const [top10Movies, setTop10Movies] = useState<Top10Entry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const userId = Cookies.get('userID') || '1'

  // Fetch top 10 movies data
  const fetchTop10Movies = async () => {
    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=top10wall_get&user_id=${userId}`)
      const data = await response.json()
      if (data && Array.isArray(data)) {
        // Sort by order_no to maintain proper ranking
        const sortedEntries = data.sort((a, b) => (a.order_no || 0) - (b.order_no || 0))
        setTop10Movies(sortedEntries)
        
        // Set selectedMovies from existing top 10
        const movieIds = sortedEntries.map(entry => entry.movie_id.toString())
        setSelectedMovies(movieIds)

        // Set common like/save status from first movie if exists
        if (sortedEntries.length > 0 && sortedEntries[0].movie) {
          setIsLiked(sortedEntries[0].movie.is_liked || false)
          setIsSaved(sortedEntries[0].movie.is_saved || false)
        }
      }
    } catch (error) {
      console.error('Error fetching top 10 movies:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchAllMovies = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://suggesto.xyz/App/api.php?gofor=movieslist")
      const data = await response.json()
      if (data && Array.isArray(data)) {
        setAllMovies(data)
      }
    } catch (error) {
      console.error("Error fetching movies:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load existing top 10 on component mount
  useEffect(() => {
    fetchTop10Movies()
  }, [userId])

  const handleMovieSelection = (movieId: string) => {
    if (selectedMovies.includes(movieId)) {
      setSelectedMovies(selectedMovies.filter((id) => id !== movieId))
    } else if (selectedMovies.length < 10) {
      setSelectedMovies([...selectedMovies, movieId])
    }
  }

  const handleSearchFocus = () => {
    setShowSearchResults(true)
    if (allMovies.length === 0) {
      fetchAllMovies()
    }
    if (searchQuery.trim() === "") {
      setFilteredMovies(allMovies)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setShowSearchResults(true)

    if (query.trim() === "") {
      setFilteredMovies(allMovies)
    } else {
      const filtered = allMovies.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredMovies(filtered)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowSearchResults(false)
    setFilteredMovies([])
  }

  const addMoviesToTop10 = async () => {
    if (selectedMovies.length === 0) return

    setSaving(true)
    const movieData = selectedMovies.map((movieId, index) => ({
      order_no: index + 1,
      movie_id: Number.parseInt(movieId),
    }))

    try {
      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gofor: "top10wall",
          user_id: userId,
          movies: movieData,
        }),
      })
      const data = await response.json()
      if (data && data.response === "Top 10 Wall updated") {
        // Refresh the top 10 movies after successful save
        await fetchTop10Movies()
        alert('Top 10 list saved successfully!')
      }
    } catch (error) {
      console.error("Error adding movies:", error)
    } finally {
      setSaving(false)
    }
  }

  const sensors = useSensors(useSensor(PointerSensor))

  // Get current movies for display (combine existing top 10 with all movies for proper display)
  const getCurrentMoviesList = () => {
    return selectedMovies.map(id => {
      // First try to find in top10Movies (for existing rankings)
      const existingEntry = top10Movies.find(entry => entry.movie_id.toString() === id)
      if (existingEntry && existingEntry.movie) {
        return existingEntry.movie
      }
      
      // Otherwise find in allMovies
      return allMovies.find(m => m.movie_id.toString() === id)
    }).filter(Boolean) as Movie[]
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex items-center justify-between p-6 pb-4">
          <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold">My Top 10 Movies</h1>
            <p className="text-white/70 text-sm mt-1">Build your ultimate movie list</p>
          </div>
          <div className="w-10" />
        </div>
        
        <div className="px-6 flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-white/70">Loading your top 10 movies...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold">My Top 10 Movies</h1>
          <p className="text-white/70 text-sm mt-1">Build your ultimate movie list</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="px-6 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search movies to add to your list..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-lg"
          />
          {(searchQuery || showSearchResults) && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Movies Search Results - Only show when searching */}
        <AnimatePresence>
          {showSearchResults && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 max-h-80 overflow-y-auto"
            >
              <div className="space-y-3">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="h-6 bg-white/20 rounded w-3/4 animate-pulse mb-2" />
                          <div className="flex gap-2">
                            <div className="h-4 bg-white/15 rounded w-12 animate-pulse" />
                            <div className="h-4 bg-white/15 rounded w-8 animate-pulse" />
                            <div className="h-4 bg-white/15 rounded w-16 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => {
                    const isSelected = selectedMovies.includes(movie.movie_id.toString())
                    const isDisabled = !isSelected && selectedMovies.length >= 10

                    return (
                      <motion.div
                        key={movie.movie_id}
                        layout
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !isDisabled && handleMovieSelection(movie.movie_id.toString())}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? "bg-white/20 border border-white/30" : "hover:bg-white/5"
                          } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg truncate">{movie.title}</h3>
                            <div className="text-white/70 text-sm">
                              <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
                              {movie.language && <span> • {movie.language.toUpperCase()}</span>}
                              {movie.rating && <span> • ★ {movie.rating}</span>}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <X className="w-4 h-4 text-white rotate-45" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No movies found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Your Top 10 List */}
        <AnimatePresence>
          {selectedMovies.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="text-yellow-400">⭐</div>
                <h2 className="text-xl font-bold">Your Top 10 List</h2>
                {top10Movies.length > 0 && (
                  <span className="text-sm text-white/60 ml-auto">
                    {selectedMovies.length === top10Movies.length ? "Current list" : "Modified"}
                  </span>
                )}
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (active.id !== over?.id) {
                    const oldIndex = selectedMovies.indexOf(active.id as string)
                    const newIndex = selectedMovies.indexOf(over?.id as string)
                    const newOrder = arrayMove(selectedMovies, oldIndex, newIndex)
                    setSelectedMovies(newOrder)
                  }
                }}
              >
                <SortableContext items={selectedMovies} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {getCurrentMoviesList().map((movie, index) => {
                      const id = movie.movie_id.toString()
                      return (
                        <SortableTopListItem
                          key={id}
                          id={id}
                          movie={movie}
                          index={index}
                          onRemove={(removeId) => setSelectedMovies((prev) => prev.filter((m) => m !== removeId))}
                        />
                      )
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedMovies([])}
                  className="flex-1 py-3 bg-transparent border border-white/30 text-white hover:bg-white/10 rounded-lg transition-colors"
                  disabled={saving}
                >
                  Clear All
                </button>
                <button
                  onClick={addMoviesToTop10}
                  disabled={selectedMovies.length === 0 || saving}
                  className="flex-2 py-3 bg-primary text-white hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    `Save Top ${selectedMovies.length}`
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            !showSearchResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center"
              >
                <div className="flex items-center gap-2 mb-6 justify-center">
                  <div className="text-yellow-400">⭐</div>
                  <h2 className="text-xl font-bold">Your Top 10 List</h2>
                </div>

                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
                    <div className="w-8 h-8 bg-white/20 rounded"></div>
                  </div>
                  <h3 className="text-lg font-medium text-white/90 mb-2">No movies added yet</h3>
                  <p className="text-white/60">Search and add movies to build your top 10 list</p>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}