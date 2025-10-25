"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Gift, ShoppingBag, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import tropy from "@/assets/quiz/result.png"
import BackgroundImage from "@/assets/spend-coins/shop-bg.png"
import { motion } from "framer-motion"
import { useState } from "react"

export default function SuggestoShop() {
    const router = useRouter()
    const [isNotified, setIsNotified] = useState(false)

    const handleNotifyClick = () => {
        setIsNotified(true)
        setTimeout(() => setIsNotified(false), 2000)
    }


    return (

        <div className="min-h-screen text-white">

            <motion.div
                className="absolute top-32 left-8"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.6, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                <Gift className="w-6 h-6 text-blue-400" />
            </motion.div>

            <motion.div
                className="absolute top-96 left-6"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.4, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
            >
                <Star className="w-5 h-5 text-primary" />
            </motion.div>

            <motion.div
                className="absolute top-48 right-12"
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
            >
                <Sparkles className="w-7 h-7 text-yellow-400" />
            </motion.div>

            {/* Top Header & Background */}
            <div className="relative min-h-screen">
                <div className="absolute inset-0 z-0 h-60">
                    <div className="relative w-full h-full">
                        <Image src={BackgroundImage} alt="bg" fill className="object-cover" />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#121214] opacity-90" />
                    </div>
                </div>

                <div className="relative z-10">
                    <header className="flex justify-between items-center p-4 pt-8 mb-2">
                        <div className="flex items-center gap-2">
                            <button className=" p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold">Suggesto Shop</h1>
                                <p className="text-sm text-white/60">Spend your coins to unlock exclusive rewards</p>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="flex flex-col items-center px-3">
                        {/* Main icon with sparkle */}
                        <motion.div
                            className="relative mb-8"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 200 }}
                        >
                            <div className="w-32 h-32 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-3xl flex items-center justify-center shadow-2xl">
                                <ShoppingBag className="w-16 h-16 text-white" strokeWidth={1.5} />
                            </div>
                            <motion.div
                                className="absolute -top-2 -right-2"
                                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                            >
                                <Sparkles className="w-8 h-8 text-yellow-400" />
                            </motion.div>
                        </motion.div>

                        {/* Coming Soon text */}
                        <motion.h2
                            className="text-3xl font-bold bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            Coming Soon
                        </motion.h2>

                        {/* Subtitle */}
                        <motion.p
                            className="text-xl font-medium text-gray-200 mb-2 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                        >
                            Amazing rewards are on their way!
                        </motion.p>

                        {/* Description */}
                        <motion.p
                            className="text-gray-400 text-sm text-center leading-relaxed mb-8 px-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9, duration: 0.8 }}
                        >
                            Get ready to exchange your coins for incredible prizes, exclusive merchandise, and real-world rewards.
                        </motion.p>

                        {/* Feature cards */}
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                            <motion.div
                                className="bg-[#2b2b2b] backdrop-blur-sm border border-gray-700/50 rounded-2xl p-3 text-center"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.1, duration: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Gift className="w-8 h-8 text-primary mx-auto mb-3" />
                                <h3 className="font-semibold text-white mb-2">Exclusive Merch</h3>
                                <p className="text-sm text-gray-400">Branded items & collectibles</p>
                            </motion.div>

                            <motion.div
                                className="bg-[#2b2b2b] backdrop-blur-sm border border-gray-700/50 rounded-2xl p-3 text-center"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.3, duration: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <Star className="w-8 h-8 text-primary mx-auto mb-3" />
                                <h3 className="font-semibold text-white mb-2">Digital Rewards</h3>
                                <p className="text-sm text-gray-400">Gift cards & vouchers</p>
                            </motion.div>
                        </div>

                        {/* Notify button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.8 }}
                        >
                            <Button
                                onClick={handleNotifyClick}
                                className="rounded-xl flex intems-center gap-2"
                                disabled={isNotified}
                            >
                                <motion.div
                                    className="flex items-center gap-2"
                                    animate={isNotified ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Sparkles className="w-5 h-5" />
                                    {isNotified ? "Notified!" : "Notify Me When Ready"}
                                </motion.div>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>

    )
}