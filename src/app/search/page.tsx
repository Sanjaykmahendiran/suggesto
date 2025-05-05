"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SearchIcon, Clock, X, ArrowLeft, Heart, SlidersHorizontal } from "lucide-react"
import Image, { StaticImageData } from "next/image"
import { cn } from "@/lib/utils"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import searchNotFound from "@/assets/search-not-found.png"

type Movie = {
    id: string
    title: string
    genres: string[]
    poster: string | StaticImageData
    description: string
    duration: string
    language: string
    quality: string
    isNew?: boolean
}

type SearchState = "initial" | "results" | "not-found"

export default function Search() {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchState, setSearchState] = useState<SearchState>("initial")
    const [lastSearches, setLastSearches] = useState<string[]>(["Toy Story", "Nemo", "The Incredibles", "Ratatouille"])
    const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
    const [activeFilter, setActiveFilter] = useState("All")

    const popularMovies: Movie[] = [
        {
            id: "1",
            title: "The Greatest Showman",
            genres: ["Romance", "Drama"],
            poster: home1,
            description: "",
            duration: "2 hrs 15 mins",
            language: "English",
            quality: "1400mp",
        },
        {
            id: "2",
            title: "Nobody",
            genres: ["Thriller", "Drama"],
            poster: home2,
            description: "",
            duration: "2 hrs 15 mins",
            language: "English",
            quality: "1400mp",
        },
        {
            id: "3",
            title: "Joy",
            genres: ["Family", "Drama"],
            poster: home3,
            description: "",
            duration: "2 hrs 15 mins",
            language: "English",
            quality: "1400mp",
        },
    ]

    const allMovies: Movie[] = [
        {
            id: "4",
            title: "Ratatouille",
            genres: ["Animation", "Adventure", "Family"],
            poster: home1,
            description:
                '"Luca" is a heartwarming animated film set in a beautiful coastal town on the Italian Riviera. The story revolves around a young boy...',
            duration: "2 hrs 15 mins",
            language: "English",
            quality: "1400mp",
        },
        {
            id: "5",
            title: "Onward",
            genres: ["Animation", "Adventure", "Family"],
            poster: home2,
            description:
                '"Onward" is an enchanting animated adventure set in a modern suburban fantasy world. The story follows two elven brothers, Ian...',
            duration: "2 hrs 15 mins",
            language: "English",
            quality: "1400mp",
            isNew: true,
        },
        {
            id: "6",
            title: "Luca",
            genres: ["Animation", "Adventure", "Family"],
            poster: home3,
            description:
                '"Luca" is a heartwarming animated film set in a beautiful coastal town on the Italian Riviera. The story revolves around a young boy...',
            duration: "2 hrs 15 mins",
            language: "English",
            quality: "1400mp",
            isNew: true,
        },
    ]

    const filters = ["All", "Action", "Adventure", "Mystery"]

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchState("initial")
            return
        }

        const lowercaseSearch = searchTerm.toLowerCase()

        // Filter movies based on search term
        const results = allMovies.filter((movie) => movie.title.toLowerCase().includes(lowercaseSearch))

        if (results.length > 0) {
            setFilteredMovies(results)
            setSearchState("results")
        } else {
            setSearchState("not-found")
        }
    }, [searchTerm])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const clearSearch = () => {
        setSearchTerm("")
        setSearchState("initial")
    }

    const handleLastSearchClick = (search: string) => {
        setSearchTerm(search)
    }

    const removeFromLastSearches = (search: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setLastSearches(lastSearches.filter((item) => item !== search))
    }

    const clearAllLastSearches = () => {
        setLastSearches([])
    }

    return (
        <main className="flex min-h-screen flex-col items-center bg-[#181826] text-white">
            <div className="w-full max-w-md mx-auto p-4">
                <div className="flex items-center mb-6">
                    <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-semibold">Search</h1>
                </div>

                <div className="relative mb-6">
                    <div className="flex items-center bg-[#292938] rounded-full px-4 py-4">
                        <SearchIcon size={20} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none flex-1 text-white"
                        />
                        {searchTerm && (
                            <button onClick={clearSearch} className="ml-2">
                                <X size={20} className="text-gray-400" />
                            </button>
                        )}
                        <button className="ml-2 text-gray-400">
                            <SlidersHorizontal size={18} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {searchState === "initial" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium">Last Search</h2>
                            {lastSearches.length > 0 && (
                                <button onClick={clearAllLastSearches} className="text-sm text-red-500">
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="space-y-3 mb-6">
                            {lastSearches.map((search, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleLastSearchClick(search)}
                                    className="flex items-center justify-between border-b p-3 cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        <Clock size={18} className="text-gray-400 mr-3" />
                                        <span>{search}</span>
                                    </div>
                                    <button onClick={(e) => removeFromLastSearches(search, e)} className="text-gray-400">
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <h2 className="text-lg font-medium mb-4">Popular Movie</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {popularMovies.map((movie) => (
                                <div key={movie.id} className="space-y-1">
                                    <div className="relative rounded-lg overflow-hidden">
                                        <Image
                                            src={movie.poster || "/placeholder.svg"}
                                            alt={movie.title}
                                            width={130}
                                            height={200}
                                            className="w-full object-cover aspect-[2/3]"
                                        />
                                    </div>
                                    <h3 className="text-sm font-medium truncate">{movie.title}</h3>
                                    <p className="text-xs text-gray-400">{movie.genres.slice(0, 2).join(", ")}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {searchState === "results" && (
                    <div>
                        <div className="flex space-x-2 mb-6 overflow-x-auto scrollbar-hide">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm whitespace-nowrap",
                                        activeFilter === filter ? "bg-[#5D5FEF] text-white" : "bg-[#1E1E1E] text-gray-300",
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <h2 className="text-lg font-medium mb-4">Movie Found ({filteredMovies.length})</h2>

                        <div className="space-y-4">
                            {filteredMovies.map((movie) => (
                                <div key={movie.id} className="flex bg-[#1E1E1E] rounded-lg overflow-hidden">
                                    <div className="relative w-24 h-32 flex-shrink-0">
                                        <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                                        {movie.isNew && (
                                            <div className="absolute top-2 left-2 bg-blue-500 text-xs font-bold px-2 py-0.5 rounded">NEW</div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-3">
                                        <div className="flex justify-between">
                                            <h3 className="font-bold">{movie.title}</h3>
                                            <button className="text-gray-400">
                                                <Heart size={20} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-1">{movie.genres.join(", ")}</p>
                                        <p className="text-xs text-gray-300 mb-2 line-clamp-2">{movie.description}</p>
                                        <div className="flex text-xs text-gray-400 space-x-2">
                                            <span>{movie.duration}</span>
                                            <span>•</span>
                                            <span>{movie.language}</span>
                                            <span>•</span>
                                            <span>{movie.quality}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {searchState === "not-found" && (
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-full overflow-x-auto pb-2 no-scrollbar">
                            <div className="flex space-x-2 w-max px-4">
                                {filters.map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className={cn(
                                            "px-6 py-2 rounded-full border border-gray-600 text-white text-sm whitespace-nowrap",
                                            activeFilter === filter
                                                ? "bg-[#6c5ce7] text-white"
                                                : "bg-transparent text-gray-300"
                                        )}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* <div className="w-16 h-16 bg-[#1E1E1E] rounded-lg flex items-center justify-center mb-4 mt-16">
                            <div className="w-10 h-10 rounded border border-[#5D5FEF] flex flex-col items-center justify-center">
                                <div className="w-4 h-1 bg-[#5D5FEF] mb-1 rounded-full"></div>
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-[#5D5FEF] rounded-full"></div>
                                    <div className="w-1 h-1 bg-[#5D5FEF] rounded-full"></div>
                                </div>
                            </div>
                        </div> */}
                        <div className=" flex items-center justify-center mb-4 mt-16">
                            <Image
                                src={searchNotFound}
                                alt="Onward"
                                width={320}
                                height={180}
                                className="w-full h-[180px] object-cover rounded-lg"
                            />
                        </div>
                        <h2 className="text-2xl font-medium mb-2 text-center">
                            We are sorry, we can not find the movie :(
                        </h2>
                        <p className="text-sm text-gray-400 text-center">
                            Find your favorite movie by entering the title
                        </p>
                    </div>
                )}

            </div>
        </main>
    )
}
