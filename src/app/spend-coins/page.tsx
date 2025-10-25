"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft, ArrowRight, Award, ChevronRight,
    X,
} from "lucide-react"

import BackgroundImage from "@/assets/spend-coins/bg.png"
import cup from "@/assets/cup.png"
import Top10WallImage from "@/assets/top-10.png"
import ticket from "@/assets/spend-coins/ticket.png"

import SpinWheelbg from "@/assets/spend-coins/spin-wheel.png"
import SpinWheelIcon from "@/assets/spend-coins/spin-wheel-icon.png"
import Quizbg from "@/assets/spend-coins/movie-quiz-battle.png"
import QuizIcon from "@/assets/spend-coins/movie-quiz-battle-icon.png"
import MegaDrawbg from "@/assets/spend-coins/monthly-mega-draw.png"
import MegaDrawIcon from "@/assets/spend-coins/mega-draw-icon.png"
import Shopbg from "@/assets/spend-coins/shop.png"
import ShopIcon from "@/assets/spend-coins/shop-icon.png"
import { Card } from "@/components/ui/card"

import { useUser } from "@/contexts/UserContext"

const cardAssets = [
    {
        cs_id: 1,
        bg: SpinWheelbg,
        icon: SpinWheelIcon,
        label: "Daily",
        title: "Spin Wheel",
        route: "/spin",
    },
    {
        cs_id: 2,
        bg: Quizbg,
        icon: QuizIcon,
        label: "Weekly",
        title: "Movie Quiz Battle",
        route: "/quiz",
    },
    {
        cs_id: 3,
        bg: MegaDrawbg,
        icon: MegaDrawIcon,
        label: "Monthly",
        title: "Monthly Mega Draw",
        route: "/lucky-draw",
    },
    {
        cs_id: 4,
        bg: Shopbg,
        icon: ShopIcon,
        label: "Shop",
        title: "Suggesto Shop",
        route: "/suggesto-shop",
    },
]

type GameItem = {
    cs_id: number
    item_name: string
    icon: string
    coins_required: number
    description: string
    item_type: string
    status: number
}

type LeaderboardUser = {
    user_id: number
    name: string
    profile: string
    total_coins: number
}

export default function SpendCoinsPage() {
    const { user } = useUser()
    const router = useRouter()
    const [gameItems, setGameItems] = useState<GameItem[]>([])
    const [hallOfFameVisible, setHallOfFameVisible] = useState(false)
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])

    useEffect(() => {
        fetch("https://suggesto.xyz/App/api.php?gofor=spendablelist")
            .then(res => res.json())
            .then(data => setGameItems(data))

        fetch("https://suggesto.xyz/App/api.php?gofor=halloffame")
            .then(res => res.json())
            .then(res => {
                if (res.status) {
                    setLeaderboard(res.data.slice(0, 3))
                }
            })
    }, [])

    return (
        <>
            <div className="min-h-screen text-white">
                {/* Top Header & Background */}
                <div className="relative h-60">
                    <div className="absolute inset-0 z-0 h-60">
                        <div className="relative w-full h-full">
                            <Image src={BackgroundImage} alt="bg" fill className="object-cover" />
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#121214] opacity-90" />
                        </div>
                    </div>

                    <div className="relative z-20">
                        <header className="flex items-center justify-between pt-8 px-4">
                            <div className="flex gap-3 items-start">
                                <button onClick={() => router.back()} className="p-2 rounded-full bg-[#2b2b2b]">
                                    <ArrowLeft size={20} />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold">My Coins</h1>
                                    <p className="text-sm text-white/60">Use coins to play & win real rewards</p>
                                </div>
                            </div>
                        </header>

                        {/* Top Info Boxes */}
                        <div className="flex gap-2 px-2 mt-4">
                            <div className="w-[60%]">
                                <div className="relative p-4 h-28 rounded-2xl shadow-lg bg-gradient-to-r from-[#b56bbc]/200 to-[#7a71c4]/100 flex justify-between items-center">
                                    <div className="z-10 text-white">
                                        <div className="flex items-center gap-1 mb-2">
                                            <Award className="w-5 h-5" />
                                            <span className="font-semibold text-sm">Reward Points</span>
                                        </div>
                                        <div className="font-extrabold text-xl">{user?.coins} Points</div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-20 h-20 z-0 bounce-slow">
                                        <Image src={cup} alt="cup" className="object-contain w-full h-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-[40%]">
                                <div className="p-[2px] rounded-3xl bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:scale-105 transition-transform duration-200 shadow-xl">
                                    <Card
                                        onClick={() => setHallOfFameVisible(true)}
                                        className="relative rounded-3xl bg-[#2b2b2b] text-white flex flex-col items-center justify-end pt-12 pb-5 px-4 h-28"
                                    >
                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                            <Image src={Top10WallImage} alt="Top 10" width={50} height={50} />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-sm font-semibold">Hall of Fame</h3>
                                            <p className="text-xs text-white/70 mt-1">Great wall of winners!</p>
                                        </div>
                                        <div className="absolute -bottom-3 right-6 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] rounded-full p-1 z-50">
                                            <ArrowRight className="h-4 w-4 text-[#b56bbc]" />
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Cards */}
                <div className="grid grid-cols-2 gap-4 px-3">
                    {gameItems.map((item, index) => {
                        const asset = cardAssets.find(c => c.cs_id === item.cs_id);
                        if (!asset) return null;

                        const isEven = index % 2 === 0;

                        return (
                            <div
                                key={item.cs_id}
                                onClick={() => router.push(asset.route)}
                                className={`h-[260px] bg-cover bg-center rounded-3xl relative shadow-md border border-white/10 text-white flex flex-col transition-all duration-300 overflow-hidden ${isEven ? 'mt-0' : 'mt-8'
                                    }`}
                                style={{ backgroundImage: `url(${asset.bg.src})` }}
                            >
                                {/* Top badge */}
                                <div className="absolute top-2   right-2 bg-black/90 px-3 py-1 text-xs rounded-full border border-white/10">
                                    {asset.label}
                                </div>

                                {/* Centered Icon */}
                                <div className="flex justify-center mt-10">
                                    <img src={asset.icon.src} alt="icon" className="w-24 h-24 object-contain" />
                                </div>

                                {/* Content area */}
                                <div className="relative z-10 p-2 flex flex-col flex-grow">
                                    <h2 className="text-sm font-semibold text-center">{item.item_name}</h2>
                                    <p className="text-xs text-gray-200 text-center mt-1">{item.description}</p>

                                    <div className="flex-grow" />

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] px-1.5 py-2 rounded-full text-xs font-medium shadow-md">
                                            <img src={ticket.src} className="w-3 h-3" />
                                            {item.coins_required} Coins
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer shadow">
                                            <ChevronRight className="w-4 h-4 text-primary" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* Hall of Fame Popup */}
            <AnimatePresence>
                {hallOfFameVisible && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            key="overlay"
                            className="fixed inset-0 bg-black/90 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setHallOfFameVisible(false)}
                        />

                        {/* Popup */}
                        <motion.div
                            key="modal"
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 25 }}
                            className="fixed inset-x-0 bottom-0 z-50"
                            aria-modal="true"
                            role="dialog"
                            aria-labelledby="hall-of-fame-title"
                            onClick={() => setHallOfFameVisible(false)}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-lg mx-auto bg-[#121212] rounded-t-2xl px-6 pt-6 flex flex-col"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-center">
                                    <h2 id="hall-of-fame-title" className="text-xl font-semibold text-white flex items-center gap-2">
                                        <span>🏆</span> Hall of Fame
                                    </h2>
                                    <button
                                        onClick={() => setHallOfFameVisible(false)}
                                        className="text-sm text-white hover:underline"
                                        aria-label="Close Hall of Fame"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Podium */}
                                <div className="flex items-end justify-center gap-8 mt-8">
                                    {/* 2nd Place */}
                                    {leaderboard[1] && (
                                        <div className="flex flex-col items-center">
                                            <div className="flex flex-col items-center">
                                                <Image
                                                    src={leaderboard[1].profile}
                                                    alt="2"
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full border-2 w-12 h-12 object-cover"
                                                />
                                                <p className="text-xs mt-1 text-gray-200">{leaderboard[1].name}</p>
                                                <p className="text-xs mt-1 text-gray-300">{leaderboard[1].total_coins} Coins</p>
                                            </div>
                                            <div className="bg-[#b56bbc]/80 rounded-t-lg w-16 h-24 flex items-center justify-center mt-2">
                                                <span className="text-white text-xl font-bold">2</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1st Place */}
                                    {leaderboard[0] && (
                                        <div className="flex flex-col items-center">
                                            <div className="flex flex-col items-center">
                                                <Image
                                                    src={leaderboard[0].profile}
                                                    alt="1"
                                                    width={64}
                                                    height={64}
                                                    className="rounded-full border-4 border-yellow-400 w-16 h-16 object-cover"
                                                />
                                                <p className="text-sm mt-1 font-bold text-white">{leaderboard[0].name}</p>
                                                <p className="text-sm mt-1 font-semibold text-white">{leaderboard[0].total_coins} Coins</p>
                                            </div>
                                            <div className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-t-lg w-16 h-32 flex items-center justify-center mt-2">
                                                <span className="text-white text-2xl font-bold">1</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3rd Place */}
                                    {leaderboard[2] && (
                                        <div className="flex flex-col items-center">
                                            <div className="flex flex-col items-center">
                                                <Image
                                                    src={leaderboard[2].profile}
                                                    alt="3"
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full border-2 border-amber-600 w-12 h-12 object-cover"
                                                />
                                                <p className="text-xs mt-1 text-gray-200">{leaderboard[2].name}</p>
                                                <p className="text-xs mt-1 text-gray-300">{leaderboard[2].total_coins} Coins</p>
                                            </div>
                                            <div className="bg-[#b56bbc]/60 rounded-t-lg w-16 h-20 flex items-center justify-center mt-2">
                                                <span className="text-white text-lg font-bold">3</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </>
    )
}
