"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { type ChangeEvent, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, Plus, ChevronRight, X, ChevronDown } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Movie {
  movie_id: number;
  movie_code: string;
  is_tmdb: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  rating: string;
  language: string;
  is_adult: string;
  status: number;
}

interface Genre {
  genre_id: number;
  genre_code: string;
  tmdb_id: number;
  name: string;
  status: number;
}

interface Language {
  language_id: number;
  code: string;
  name: string;
  status: number;
}

const AddMoviePage = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [likedReason, setLikedReason] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [showAllCollections, setShowAllCollections] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch genres and languages when component mounts
  useEffect(() => {
    const fetchGenresAndLanguages = async () => {
      try {
        // Fetch genres
        const genresResponse = await fetch("https://suggesto.xyz/App/api.php?gofor=genreslist")
        const genresData = await genresResponse.json()
        setGenres(genresData)

        // Fetch languages
        const languagesResponse = await fetch("https://suggesto.xyz/App/api.php?gofor=languageslist")
        const languagesData = await languagesResponse.json()
        setLanguages(languagesData)
      } catch (error) {
        console.error("Error fetching genres and languages:", error)
      }
    }

    fetchGenresAndLanguages()
  }, [])

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.length > 1) {
      setIsLoading(true)
      try {
        const response = await fetch(
          `https://suggesto.xyz/App/api.php?gofor=tsearchmovies&searchtext=${encodeURIComponent(term)}`
        )
        const data = await response.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error searching movies:", error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    } else {
      setSearchResults([])
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
  }

  const visibleGenres = showAllGenres ? genres : genres.slice(0, 6)
  const visibleLanguages = showAllCollections ? languages : languages.slice(0, 6)

  // Get poster URL with base path
  const getPosterUrl = (posterPath: string) => {
    return `https://image.tmdb.org/t/p/w500${posterPath}`
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <div className="min-h-screen text-white mb-16 ">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold">Search</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            className="bg-[#292938] text-white w-full pl-10 pr-10 py-3 rounded-full focus:outline-none"
            placeholder="Actor, title, or genre"
          />
          {searchTerm && (
            <button className="absolute inset-y-0 right-3 flex items-center" onClick={clearSearch}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchTerm.length > 1 && (
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-4">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="text-center py-4">No movies found for "{searchTerm}".</p>
            ) : (
              searchResults.map((result) => (
                <Link href={`/movie-detail-page?movie_id=${result.movie_id}`}>
                  <div className="flex gap-4 py-3 border-b border-gray-800">
                    <div className="flex-shrink-0 w-16 h-24 relative rounded-md overflow-hidden">
                      {result.poster_path ? (
                        <Image
                          src={getPosterUrl(result.poster_path)}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{result.title}</h3>
                      <p className="text-gray-400 text-sm mb-1">{formatDate(result.release_date)}</p>
                      <p className="text-gray-300 text-sm line-clamp-2">{result.overview}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* Genres Section - Only show when not searching */}
        {!searchTerm && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Genres</h2>
              <div className="grid grid-cols-2 gap-3">
                {visibleGenres.map((genre) => (
                  <button
                    key={genre.genre_id}
                    className="bg-[#292938] rounded-lg py-3 px-4 text-left"
                    onClick={() => router.push(`/genre/${genre.genre_id}`)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
              {genres.length > 6 && (
                <button
                  className="w-full mt-3 flex items-center justify-center py-2 text-sm text-gray-400"
                  onClick={() => setShowAllGenres(!showAllGenres)}
                >
                  {showAllGenres ? "See less" : "See more"}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAllGenres ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {/* Featured Collections (Languages) */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Featured collections</h2>
              <div className="space-y-1">
                {visibleLanguages.map((language) => (
                  <Link
                    href={`/collection/${language.code}`}
                    key={language.language_id}
                    className="flex items-center justify-between py-3 border-b border-gray-800"
                  >
                    <span>{language.name}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                ))}
              </div>
              {languages.length > 6 && (
                <button
                  className="w-full mt-3 flex items-center justify-center py-2 text-sm text-gray-400"
                  onClick={() => setShowAllCollections(!showAllCollections)}
                >
                  {showAllCollections ? "See less" : "See more"}
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${showAllCollections ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>
          </>
        )}

        {/* Can't find your movie section */}
        {searchTerm.length > 1 && searchResults.length === 0 && !isLoading && (
          <div className="text-center mt-4 mb-8">
            <p className="mb-2">Can't find your movie?</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#6c5ce7] hover:bg-[#6c5ce7]/80">Request Movie</Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </div>

      {/* Request Movie Button (Fixed at bottom right) */}
      <div className="fixed bottom-20 right-4 z-10">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-[#292938] text-white border-[#3f3f5a] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Request Movie</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-4">
                Enter the movie details manually if you can't find it in the search results.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="movie-title" className="block text-sm font-medium mb-1">
                    Movie Title
                  </label>
                  <Input
                    id="movie-title"
                    placeholder="Enter movie title"
                    className="bg-[#1a1a2e] border-[#3f3f5a]"
                  />
                </div>

                <div>
                  <label htmlFor="release-year" className="block text-sm font-medium mb-1">
                    Release Year
                  </label>
                  <Input
                    id="release-year"
                    placeholder="YYYY"
                    className="bg-[#1a1a2e] border-[#3f3f5a]"
                  />
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium mb-1">
                    Language
                  </label>
                  <Input
                    id="language"
                    placeholder="Language"
                    className="bg-[#1a1a2e] border-[#3f3f5a]"
                  />

                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  className="bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                >
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>


      <BottomNavigation currentPath="/add-movie" />
    </div>
  )
}

export default AddMoviePage