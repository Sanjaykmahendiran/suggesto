"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function MoodsSection() {
    const router = useRouter()

    type Mood = {
        mood_id: string | number
        name: string
        image?: string
    }

    const [moods, setMoods] = useState<Mood[]>([])

    useEffect(() => {
        const fetchMoods = async () => {
            try {
                const response = await fetch("https://suggesto.xyz/App/api.php?gofor=homemoodslist")
                const data = await response.json()
                setMoods(data)
            } catch (error) {
                console.error("Failed to fetch moods:", error)
            }
        }
        fetchMoods()
    }, [])

    return (
        <div className="w-full px-4 mb-8">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Moods</h2>
                    <Button
                        variant="ghost"
                        className="p-0 text-sm bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent"
                        onClick={() => router.push("/add-movie")}
                    >
                        See All
                    </Button>
                </div>

                {/* Moods Grid with Animation */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {moods.map((mood, index) => (
                        <motion.div
                            key={mood.mood_id}
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => router.push(`/add-movie?mood_id=${mood.mood_id}`)}
                            className="relative flex-shrink-0 w-24 h-24 rounded-full overflow-hidden cursor-pointer bg-[#2b2b2b] 
                                       flex flex-col items-center justify-center text-center px-2 shadow-md"
                        >
                            {mood.image ? (
                                <img
                                    src={`https://suggesto.xyz/App/${mood.image}`}
                                    alt={mood.name}
                                    className="w-12 h-12 object-cover rounded-full mb-1"
                                />
                            ) : (
                                <span className="text-3xl mb-1">🎭</span>
                            )}
                            <span className="text-[11px] leading-tight line-clamp-2">{mood.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
