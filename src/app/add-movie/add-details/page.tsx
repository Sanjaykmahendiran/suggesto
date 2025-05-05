"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import home1 from "@/assets/home-1.jpg"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function MovieDetails() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const movieId = searchParams.get("id")

    // In a real app, you would fetch the movie details using the ID
    const movieDetails = {
        id: movieId || "1",
        title: "Inception",
        poster: home1,
        release_date: "2010-07-16",
        overview:
            "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    }

    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    const [isTheatreOnly, setIsTheatreOnly] = useState(false)
    const [ottLink, setOttLink] = useState("")
    const [notes, setNotes] = useState("")

    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput("")
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would save the movie with all its details
        console.log({
            movieDetails,
            tags,
            isTheatreOnly,
            ottLink: isTheatreOnly ? "" : ottLink,
            notes,
        })

        // Navigate back to home after saving
        router.push("/")
    }

    return (
        <div className="container mx-auto py-6 px-4 mb-16">
            <div className="flex items-center mb-6">
                <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold">Add Movie Details</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="relative w-full h-48 mx-auto md:mx-0">
                    <Image
                        src={movieDetails.poster || "/placeholder.svg"}
                        alt={movieDetails.title}
                        fill
                        className="object-cover rounded-lg"
                    />
                </div>

                <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{movieDetails.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{new Date(movieDetails.release_date).getFullYear()}</p>
                    <p className="text-sm mb-4">{movieDetails.overview}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label className="text-base font-medium">Add Tags</Label>
                    <p className="text-sm text-muted-foreground mb-2">Genre, mood, platform, who recommended it, etc.</p>

                    <div className="flex gap-2 mb-2">
                        <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder="Add a tag"
                            className="flex-1"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleAddTag()
                                }
                            }}
                        />
                        <Button type="button" onClick={handleAddTag}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => handleRemoveTag(tag)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="theatre-only"
                            checked={isTheatreOnly}
                            onCheckedChange={(checked) => {
                                if (checked === true) {
                                    setIsTheatreOnly(true)
                                    setOttLink("")
                                } else {
                                    setIsTheatreOnly(false)
                                }
                            }}
                        />
                        <Label htmlFor="theatre-only">Theatre-only release (not available on streaming)</Label>
                    </div>

                    {!isTheatreOnly && (
                        <div>
                            <Label htmlFor="ott-link" className="text-base font-medium">
                                Streaming Link (OTT)
                            </Label>
                            <Input
                                id="ott-link"
                                placeholder="Enter streaming service link"
                                value={ottLink}
                                onChange={(e) => setOttLink(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div>
                    <Label htmlFor="notes" className="text-base font-medium">
                        Notes
                    </Label>
                    <Textarea
                        id="notes"
                        placeholder="Add any additional notes about the movie"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>

                <Button type="submit" className="w-full">
                    Save Movie
                </Button>
            </form>
            <BottomNavigation currentPath="/add-movie" />
        </div>
    )
}
