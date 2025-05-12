"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { type ChangeEvent, useState } from "react"
import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { ArrowLeft, MoreVertical, Search } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"

interface Movie {
    id: number
    title: string
    poster: string | StaticImageData
    release_date: string
    overview: string
    liked_reason?: string
}

const AddMoviePage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState<Movie[]>([])
    const [selectedFriends, setSelectedFriends] = useState<Array<{ id: number; name: string }>>([])
    const [likedReason, setLikedReason] = useState("")

    const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value
        setSearchTerm(term)

        if (term.length > 2) {
            try {
                const response = await fetch(`/api/search-movie?query=${term}`)
                const data = await response.json()

                setSearchResults(
                    data.results.map((movie: any) => ({
                        id: movie.id,
                        title: movie.title,
                        poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                        release_date: movie.release_date,
                        overview: movie.overview,
                    })),
                )
            } catch (error) {
                console.error("Search error:", error)
            }
        } else {
            setSearchResults([])
        }
    }

    const handleSuggestToFriend = (movie: Movie) => {
        // This would be replaced with actual friend selection and suggestion logic
        router.push(`/suggest?movieId=${movie.id}&title=${encodeURIComponent(movie.title)}`)
    }

    return (
        <div className=" min-h-screen text-white mb-16">
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold">Add Movie</h1>
                </div>
                <button>
                    <MoreVertical className="w-6 h-6" />
                </button>
            </header>
<div className="p-4">
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="bg-[#292938] text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#5d5fef]"
                    placeholder="Search for a movie..."
                />
            </div>

            {searchTerm.length > 2 && searchResults.length === 0 && <p>No movies found for "{searchTerm}".</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {searchResults.map((movie) => (
                    <Link href={`/add-movie/add-details?id=${movie.id}`} key={movie.id}>
                        <Card className="h-full bg-transparent text-white p-0 border-0">
                            <CardContent className="p-4 flex">
                                <div className="relative w-20 h-28 flex-shrink-0 mr-4">
                                    <Image
                                        src={movie.poster || "/placeholder.svg"}
                                        alt={movie.title}
                                        fill
                                        className="object-cover rounded-md"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold mb-1">{movie.title}</h3>
                                    <p className="text-xs text-muted-foreground mb-2 ">{new Date(movie.release_date).getFullYear()}</p>
                                    <p className="text-xs line-clamp-3 mb-3">{movie.overview}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                // Add to watchlist logic
                                                alert(`Added ${movie.title} to watchlist`)
                                            }}
                                        >
                                            Add to Watchlist
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="text-xs bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handleSuggestToFriend(movie)
                                            }}
                                        >
                                            Suggest to Friend
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-3">Can't find your movie?</h2>
                <Link href="/add-movie/add-details" className="text-blue-500 hover:underline">
                    Add it manually
                </Link>
            </div>

            <div className="mt-6 border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-4">Manual Entry</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Enter the movie details manually if you can't find it in the search results.
                </p>

                <div>
                    <label htmlFor="liked-reason" className="block text-sm font-medium mb-1">
                        Why You Liked It (optional)
                    </label>
                    <textarea
                        id="liked-reason"
                        placeholder="Share why you enjoyed this movie..."
                        className="w-full min-h-[100px] rounded-md border border-input px-3 py-2 text-sm"
                        value={likedReason}
                        onChange={(e) => setLikedReason(e.target.value)}
                    />
                </div>

                <Link
                    href="/add-movie/add-details"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
                >
                    Continue to Add Details
                </Link>
            </div>
            </div>
                        <BottomNavigation currentPath="/add-movie" />
        </div>
    )
}

export default AddMoviePage
