"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InterestsPage() {
    const router = useRouter()
    const [selectedInterests, setSelectedInterests] = useState<string[]>(["Action", "Sci-Fi"])

    const allInterests = [
        "Action",
        "Horror",
        "Adventure",
        "Drama",
        "War",
        "Crime",
        "Romance",
        "History",
        "Sci-Fi",
        "Comedy",
        "Thriller",
        "Animation",
    ]

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter((i) => i !== interest))
        } else {
            setSelectedInterests([...selectedInterests, interest])
        }
    }

    return (
        <div className="min-h-screen text-white">
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                <button
                    className="mr-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-medium">Choose your interest</h1>
            </div>

            {/* Description */}
            <div className="px-4 pb-6">
                <p className="text-gray-400">
                    Choose your interests, how and get the best movie recommendations. Don&apos;t worry you can always change it
                    later.
                </p>
            </div>

            {/* Interests Grid */}
            <div className="flex flex-wrap gap-3 px-4">
                {allInterests.map((interest) => (
                    <button
                        key={interest}
                        className={`rounded-full px-4 py-2 text-sm ${selectedInterests.includes(interest) ? "bg-primary text-white" : "bg-gray-800 text-white"
                            }`}
                        onClick={() => toggleInterest(interest)}
                    >
                        {interest}
                    </button>
                ))}
            </div>

            {/* Bottom Buttons */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-between p-4">
                <Link href="/language">
                    <Button
                        variant="outline"
                        className="w-full"
                    >
                        SKIP</Button>
                </Link>
                <Link href="/language">
                    <Button
                        variant="default"
                        className="w-full"
                    >
                        CONTINUE
                    </Button>
                </Link>
            </div>
        </div>
    )
}
