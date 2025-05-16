"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { type ChangeEvent, useState } from "react"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, Plus, ChevronRight, X, ChevronDown } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import home4 from "@/assets/home-4.jpg"
import home5 from "@/assets/home-5.jpg"

interface Movie {
  id: number
  title: string
  poster: string | StaticImageData
  release_date: string
  overview: string
  liked_reason?: string
}

const genres = [
  "Action and adventure",
  "Anime",
  "Comedy",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
]

const collections = ["Hindi", "English", "Telugu", "Tamil", "Malayalam", "Kannada", "Marathi", "Bengali"]

const AddMoviePage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [selectedFriends, setSelectedFriends] = useState<Array<{ id: number; name: string }>>([])
  const [likedReason, setLikedReason] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [showAllCollections, setShowAllCollections] = useState(false)

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.length > 1) {
      // Mock data instead of API call
      const mockMovies = [
        {
          id: 1,
          title: "Veera",
          poster: home1,
          release_date: "2023-01-01",
          overview: "A great action movie",
        },
        {
          id: 2,
          title: "Veeran",
          poster: home2,
          release_date: "2022-05-15",
          overview: "An epic adventure",
        },
        {
          id: 3,
          title: "Venom",
          poster: home3,
          release_date: "2021-10-01",
          overview: "A superhero film",
        },
        {
          id: 4,
          title: "Venom: Let There Be Carnage",
          poster: home4,
          release_date: "2021-09-14",
          overview: "The sequel to Venom",
        },
        {
          id: 5,
          title: "Veerappan",
          poster: home5,
          release_date: "2016-05-27",
          overview: "A biographical film",
        },
        {
          id: 6,
          title: "Veera Simha Reddy",
          poster: home1,
          release_date: "2023-01-12",
          overview: "An action drama film",
        },
        {
          id: 7,
          title: "Veera Dheera Sooran - Part 2",
          poster: home2,
          release_date: "2022-08-31",
          overview: "The second part of an epic saga",
        },
      ]

      // Filter movies based on search term
      const filteredResults = mockMovies.filter((movie) => movie.title.toLowerCase().includes(term.toLowerCase()))

      setSearchResults(filteredResults)
    } else {
      setSearchResults([])
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
  }

  const visibleGenres = showAllGenres ? genres : genres.slice(0, 6)
  const visibleCollections = showAllCollections ? collections : collections.slice(0, 6)

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
          <div className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-center py-4">No movies found for "{searchTerm}".</p>
            ) : (
              searchResults.map((result) => (
                <Link href={`/add-movie/add-details?id=${result.id}`} key={result.id}>
                  <div className="py-2 border-b border-gray-800">
                    <p className="text-white">{result.title}</p>
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
                    key={genre}
                    className="bg-[#292938] rounded-lg py-3 px-4 text-left"
                    onClick={() => router.push(`/genre/${genre.toLowerCase().replace(/ /g, "-")}`)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              <button
                className="w-full mt-3 flex items-center justify-center py-2 text-sm text-gray-400"
                onClick={() => setShowAllGenres(!showAllGenres)}
              >
                {showAllGenres ? "See less" : "See more"}
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAllGenres ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Featured Collections */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Featured collections</h2>
              <div className="space-y-1">
                {visibleCollections.map((collection) => (
                  <Link
                    href={`/collection/${collection.toLowerCase()}`}
                    key={collection}
                    className="flex items-center justify-between py-3 border-b border-gray-800"
                  >
                    <span>{collection}</span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Link>
                ))}
              </div>
              <button
                className="w-full mt-3 flex items-center justify-center py-2 text-sm text-gray-400"
                onClick={() => setShowAllCollections(!showAllCollections)}
              >
                {showAllCollections ? "See less" : "See more"}
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform ${showAllCollections ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </>
        )}

        {/* Can't find your movie section */}
        {searchTerm.length > 1 && searchResults.length === 0 && (
          <div className="text-center mt-4 mb-8">
            <p className="mb-2">Can't find your movie?</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#6c5ce7] hover:bg-[#6c5ce7]/80">Add it manually</Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </div>

      {/* Manual Entry Request Button (Fixed at bottom right) */}
      <div className="fixed bottom-20 right-4 z-10">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full bg-[#6c5ce7] hover:bg-[#6c5ce7]/80 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#292938] text-white border-[#3f3f5a] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Manual Entry</DialogTitle>
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
                  <Input id="movie-title" placeholder="Enter movie title" className="bg-[#1a1a2e] border-[#3f3f5a]" />
                </div>

                <div>
                  <label htmlFor="release-year" className="block text-sm font-medium mb-1">
                    Release Year
                  </label>
                  <Input id="release-year" placeholder="YYYY" className="bg-[#1a1a2e] border-[#3f3f5a]" />
                </div>

                <div>
                  <label htmlFor="liked-reason" className="block text-sm font-medium mb-1">
                    Why You Liked It (optional)
                  </label>
                  <textarea
                    id="liked-reason"
                    placeholder="Share why you enjoyed this movie..."
                    className="w-full min-h-[100px] rounded-md border border-[#3f3f5a] bg-[#1a1a2e] px-3 py-2 text-sm"
                    value={likedReason}
                    onChange={(e) => setLikedReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  className="bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                  onClick={() => router.push("/add-movie/add-details")}
                >
                  Continue to Add Details
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
