"use client"

import type React from "react"

import { useState } from "react"
import { Search, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image, { StaticImageData } from "next/image"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import { BottomNavigation } from "@/components/bottom-navigation"

interface Movie {
    id: number
    title: string
    poster: string | StaticImageData
    release_date: string
    overview: string
}

export default function AddMovie() {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Movie[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        setIsLoading(true)
        // This would be replaced with actual TMDb API call
        setTimeout(() => {
            setSearchResults([
                {
                    id: 1,
                    title: "Inception",
                    poster: home1,
                    release_date: "2010-07-16",
                    overview:
                        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                },
                {
                    id: 2,
                    title: "The Dark Knight",
                    poster: home2,
                    release_date: "2008-07-18",
                    overview:
                        "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                },
                {
                    id: 3,
                    title: "Interstellar",
                    poster: home3,
                    release_date: "2014-11-05",
                    overview:
                        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                },
            ])
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="container mx-auto py-6 px-4 mb-16">
            <div className="flex items-center mb-6">
                <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold">Add Movie</h1>
            </div>

            <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
                    <TabsTrigger value="search" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
                        Search TMDb
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
                        Manual Entry
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="search">
                    <form onSubmit={handleSearch} className="mb-6">
                        <div className="relative">
                            <Input
                                type="search"
                                placeholder="Search for a movie..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-6"
                            />
                            <div className="absolute inset-y-0 left-3 flex items-center">
                                <Search className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Searching..." : "Search"}
                            </Button>
                        </div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                        <div>
                                            <h3 className="font-bold mb-1">{movie.title}</h3>
                                            <p className="text-xs text-muted-foreground mb-2 ">{new Date(movie.release_date).getFullYear()}</p>
                                            <p className="text-xs line-clamp-3">{movie.overview}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="manual">
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-1">
                                Movie Title
                            </label>
                            <Input id="title" placeholder="Enter movie title" />
                        </div>

                        <div>
                            <label htmlFor="year" className="block text-sm font-medium mb-1">
                                Release Year
                            </label>
                            <Input id="year" placeholder="Enter release year" type="number" />
                        </div>

                        <div>
                            <label htmlFor="director" className="block text-sm font-medium mb-1">
                                Director
                            </label>
                            <Input id="director" placeholder="Enter director name" />
                        </div>

                        <div>
                            <label htmlFor="overview" className="block text-sm font-medium mb-1">
                                Overview
                            </label>
                            <textarea
                                id="overview"
                                placeholder="Enter movie overview"
                                className="w-full min-h-[100px] rounded-md border border-input  px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="poster" className="block text-sm font-medium mb-1">
                                Poster Image URL
                            </label>
                            <Input id="poster" placeholder="Enter poster image URL" />
                        </div>
                        <Link href={`/add-movie/add-details?id=${1}`}>
                        <Button type="submit" className="w-full">
                            Continue to Add Details
                        </Button></Link>
                    </form>
                </TabsContent>
            </Tabs>
            <BottomNavigation currentPath="/add-movie" />
        </div>
    )
}
