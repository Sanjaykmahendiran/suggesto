"use client"

import { useState } from "react"
import { ArrowLeft, ThumbsUp, ThumbsDown, Heart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image, { StaticImageData } from "next/image"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"

interface Recommendation {
    id: number
    title: string
    poster: string | StaticImageData
    friend: {
        name: string
        avatar: string
    }
    comment: string
}

export default function FriendRecommendations() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([
        {
            id: 1,
            title: "Everything Everywhere All at Once",
            poster: home3,
            friend: {
                name: "Alex",
                avatar: "/placeholder.svg?height=40&width=40",
            },
            comment: "This movie blew my mind! The multiverse concept is executed perfectly.",
        },
        {
            id: 2,
            title: "Parasite",
            poster: home1,
            friend: {
                name: "Jamie",
                avatar: "/placeholder.svg?height=40&width=40",
            },
            comment: "A masterpiece that explores class divide. You have to see this!",
        },
    ])

    const [myMovies, setMyMovies] = useState([
        {
            id: 1,
            title: "Inception",
            poster: home2,
            year: "2010",
        },
        {
            id: 2,
            title: "The Dark Knight",
            poster: home3,
            year: "2008",
        },
        {
            id: 3,
            title: "Interstellar",
            poster: home1,
            year: "2014",
        },
    ])

    const handleAccept = (id: number) => {
        setRecommendations(recommendations.filter((rec) => rec.id !== id))
        // In a real app, you would add this to the user's watchlist
    }

    const handleSkip = (id: number) => {
        setRecommendations(recommendations.filter((rec) => rec.id !== id))
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex items-center mb-6">
                <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold">Friend Recommendations</h1>
            </div>

            <Tabs defaultValue="for-you" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
                    <TabsTrigger value="for-you" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
                        For You
                    </TabsTrigger>
                    <TabsTrigger value="recommend" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
                        Recommend to Friends
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="for-you">
                    {recommendations.length > 0 ? (
                        <div className="space-y-6">
                            {recommendations.map((rec) => (
                                <Card key={rec.id} className="overflow-hidden p-0 bg-[#292938] text-white">
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="relative w-full h-48 md:h-auto">
                                                <Image
                                                    src={rec.poster || "/placeholder.svg"}
                                                    alt={rec.title}
                                                    fill
                                                    className="object-cover" />
                                            </div>
                                            <div className="p-4 md:p-6 flex-1">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Avatar className="h-8 w-8 text-primary">
                                                        <AvatarImage src={rec.friend.avatar || "/placeholder.svg"} alt={rec.friend.name} />
                                                        <AvatarFallback>{rec.friend.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{rec.friend.name} recommended:</span>
                                                </div>

                                                <h2 className="text-xl font-bold mb-2">{rec.title}</h2>
                                                <p className="text-sm mb-6">"{rec.comment}"</p>

                                                <div className="flex gap-3">
                                                    <Button onClick={() => handleAccept(rec.id)} className="flex-1">
                                                        <ThumbsUp className="h-4 w-4 mr-2" />
                                                        Add to Watchlist
                                                    </Button>
                                                    <Button variant="outline" onClick={() => handleSkip(rec.id)} className="flex-1 text-red-900">
                                                        <ThumbsDown className="h-4 w-4 mr-2" />
                                                        Skip
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-medium mb-2">No Recommendations Yet</h3>
                            <p className="text-muted-foreground mb-6">
                                You don't have any recommendations from friends at the moment.
                            </p>
                            <Button>Invite Friends</Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="recommend">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myMovies.map((movie) => (
                            <Card key={movie.id} className="overflow-hidden h-full bg-[#292938] text-white p-0">
                                <CardContent className="p-0 h-full flex flex-col">
                                    <div className="relative w-full h-48">
                                        <Image src={movie.poster || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 bg-background/80 rounded-full h-8 w-8"
                                        >
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold mb-1">{movie.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">{movie.year}</p>
                                        <Button className="mt-auto">Recommend to Friends</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
