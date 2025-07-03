"use client"

import { Coins, Sparkles, Zap, Star, Gift, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import NotFound from "@/components/notfound"
import NotFoundimage from "@/assets/not-found.png"

interface SpendableItem {
    cs_id: number
    item_name: string
    coins_required: number
    description: string
    status: number
    item_type: string
    created_date: string
}

// Skeleton loading component
const SpendableItemSkeleton = () => (
    <div className="bg-[#1f1f21] rounded-2xl p-5 border border-gray-800/50 shadow-lg animate-pulse">
        <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
                <div className="h-6 bg-[#2b2b2b] rounded-md w-2/3 mb-2"></div>
                <div className="h-5 bg-[#2b2b2b] rounded-full w-20"></div>
            </div>
        </div>
        <div className="h-4 bg-[#2b2b2b] rounded-md w-full mb-2"></div>
        <div className="h-4 bg-[#2b2b2b] rounded-md w-3/4 mb-4"></div>
        <div className="flex items-center justify-between">
            <div className="h-8 bg-[#2b2b2b] rounded-full w-16"></div>
            <div className="h-8 bg-[#2b2b2b] rounded-full w-20"></div>
        </div>
    </div>
)

export default function SpendablesList() {
    const router = useRouter()
    const [spendables, setSpendables] = useState<SpendableItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSpendables = async () => {
            try {
                setLoading(true)
                const response = await fetch('https://suggesto.xyz/App/api.php?gofor=spendableslist')

                if (!response.ok) {
                    throw new Error('Failed to fetch spendables')
                }

                const data = await response.json()
                setSpendables(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchSpendables()
    }, [])

    const handleRedeem = (item: SpendableItem) => {
        console.log(`Redeeming ${item.item_name} for ${item.coins_required} coins`)
    }

    return (
        <div className=" mx-auto min-h-screen">
            <header className="flex items-start px-4 pt-8 relative mb-4">
                <button
                    className="p-2 rounded-full bg-[#2b2b2b]"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="pl-4">
                    <h1 className="text-xl font-medium">Spendables</h1>
                    <p className="text-gray-400 text-sm mt-1">Use your coins to unlock rewards</p>
                </div>
            </header>

            {/* Spendables List */}
            <div className="px-4 py-6 space-y-4">
                {loading ? (
                    // Show skeleton loading
                    Array.from({ length: 5 }).map((_, index) => (
                        <SpendableItemSkeleton key={index} />
                    ))
                ) : error ? (
                    // Show error state
                    <div className="bg-[#1f1f21] rounded-2xl p-5 border border-red-800/50 shadow-lg">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Spendables</h3>
                            <p className="text-gray-300 text-sm mb-4">{error}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-2 rounded-full transition-all duration-200"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : spendables.length === 0 ? (
                    // Show empty state
                    <NotFound
                        imageSrc={NotFoundimage}
                        title="No Spendables Available"
                        description="Check back later for new rewards to unlock!"
                    />

                ) : (
                    // Show actual spendables
                    spendables.map((item) => (
                        <div key={item.cs_id} className="bg-[#1f1f21] rounded-xl p-4 border border-gray-800/50 shadow-md">
                            {/* Header with title and badge */}
                            <div className="flex items-start justify-between mb-2">
                                {/* Left: Item Name */}
                                <h3 className="text-base font-semibold text-white mb-1 leading-tight">
                                    {item.item_name}
                                </h3>

                                {/* Right: Badge */}
                                <Badge
                                    variant="outline"
                                    className="text-xs font-medium bg-gradient-to-r from-[#b56bbc]/50 to-[#7a71c4]/80 text-white border-0 shadow-sm px-3 py-1 whitespace-nowrap"
                                >
                                    {item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}
                                </Badge>
                            </div>


                            {/* Description */}
                            {/* <p className="text-gray-300 text-sm  leading-snug mb-3">
                                {item.description}
                            </p> */}

                            {/* <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                                        <Coins className="w-4 h-4 text-amber-400" />
                                        <span className="text-amber-400 font-semibold text-xs">
                                            {item.coins_required}
                                        </span>
                                    </div>
                                </div> */}

                            {/* Bottom section with coins and redeem button */}
                            <div className="flex justify-between mt-3 gap-4">
                                <p className="text-gray-300 text-sm leading-snug">
                                    {item.description}
                                </p>

                                <Button
                                    onClick={() => handleRedeem(item)}
                                    className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white font-semibold px-4 py-1.5 text-sm rounded-full shadow-sm hover:shadow-amber-500/25 whitespace-nowrap flex items-center gap-2 h-fit"
                                >
                                    <Coins className="w-4 h-4 text-amber-400" />
                                    {item.coins_required} Redeem
                                </Button>
                            </div>

                        </div>

                    ))
                )}
            </div>

            {/* Bottom padding for safe area */}
            <div className="h-6"></div>
        </div>
    )
}