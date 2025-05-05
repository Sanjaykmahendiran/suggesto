"use client"

import { useState } from "react"
import { ArrowLeft, Sparkles, TrendingUp, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import Image, { StaticImageData } from "next/image"
import { BottomNavigation } from "@/components/bottom-navigation"

interface Movie {
    id: number
    title: string
    poster: string | StaticImageData
    platform?: string
    year: string
    rating?: string
}

export default function Discover() {
    const [aiSuggestions] = useState<Movie[]>([
        {
            id: 1,
            title: "The Grand Budapest Hotel",
            poster: home1,
            year: "2014",
            rating: "4.8/5",
        },
        {
            id: 2,
            title: "Blade Runner 2049",
            poster: home2,
            year: "2017",
            rating: "4.5/5",
        },
        {
            id: 3,
            title: "Portrait of a Lady on Fire",
            poster: home3,
            year: "2019",
            rating: "4.7/5",
        },
    ])

    const [trending] = useState<Movie[]>([
        {
            id: 1,
            title: "Oppenheimer",
            poster: home3,
            platform: "Netflix",
            year: "2023",
        },
        {
            id: 2,
            title: "Barbie",
            poster: home2,
            platform: "Prime",
            year: "2023",
        },
        {
            id: 3,
            title: "The Killer",
            poster: home1,
            platform: "Netflix",
            year: "2023",
        },
    ])

    const [hiddenGems] = useState<Movie[]>([
        {
            id: 1,
            title: "Coherence",
            poster: home2,
            year: "2013",
            rating: "4.2/5",
        },
        {
            id: 2,
            title: "The Man from Earth",
            poster: home1,
            year: "2007",
            rating: "4.3/5",
        },
    ])

    return (
        <div className="container mx-auto py-6 px-4 text-white">
            <div className="flex items-center mb-6">
                <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold">Discover</h1>
            </div>

            <Tabs defaultValue="ai" className="w-full ">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent">
                    <TabsTrigger value="ai" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
                        AI Suggestions
                    </TabsTrigger>
                    <TabsTrigger value="trending" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
                        Trending
                    </TabsTrigger>
                    <TabsTrigger value="hidden" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
                        Hidden Gems
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ai">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-medium">Personalized for You</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                        {aiSuggestions.map((movie) => (
                            <Card key={movie.id} className="overflow-hidden h-auto bg-[#292938] text-white rounded-lg shadow-lg hover:shadow-xl transition-all p-0">
                                <CardContent className="p-0 flex flex-col">
                                    <div className="relative w-full aspect-[1/1]">
                                        <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover rounded-lg w-full" />
                                    </div>
                                    <div className="p-2 flex-1">
                                        <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-muted-foreground">{movie.year}</p>
                                            <p className="text-xs font-medium text-primary">{movie.rating}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <Button className="w-full md:w-auto">Load More Suggestions</Button>
                    </div>
                </TabsContent>

                <TabsContent value="trending">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-medium">Trending on Streaming Platforms</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                        {trending.map((movie) => (
                            <Card key={movie.id} className="overflow-hidden h-auto bg-[#292938] text-white rounded-lg shadow-lg hover:shadow-xl transition-all p-0">
                                <CardContent className="p-0 flex flex-col">
                                    <div className="relative w-full aspect-[1/1]">
                                        <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover rounded-lg" />
                                        {movie.platform && (
                                            <div className="absolute top-2 right-2 bg-primary text-xs px-2 py-0.5 rounded-sm text-white">
                                                {movie.platform}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 flex-1">
                                        <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{movie.year}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <Button className="w-full md:w-auto">See More Trending</Button>
                    </div>
                </TabsContent>

                <TabsContent value="hidden">
                    <div className="flex items-center gap-2 mb-4">
                        <Gem className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-medium">Hidden Gems Based on Your Taste</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
                        {hiddenGems.map((movie) => (
                            <Card key={movie.id} className="overflow-hidden h-auto bg-[#292938] text-white rounded-lg shadow-lg hover:shadow-xl transition-all p-0">
                                <CardContent className="p-0 flex flex-col">
                                    <div className="relative w-full aspect-[1/1]">
                                        <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover rounded-lg" />
                                    </div>
                                    <div className="p-2 flex-1">
                                        <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-xs text-muted-foreground">{movie.year}</p>
                                            <p className="text-xs font-medium text-primary">{movie.rating}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 text-center">
                        <Button className="w-full md:w-auto">Discover More Gems</Button>
                    </div>
                </TabsContent>
            </Tabs>
            <BottomNavigation currentPath="/discover" />
        </div>
    )
}
