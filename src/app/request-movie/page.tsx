"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Send } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import ReceviedSuggestion from "@/app/suggest-movie/_components/recevied-suggestion"
import SuggestionsSent from "@/app/suggest-movie/_components/suggestion-sent"
import DefaultImage from "@/assets/default-user.webp"
import { AnimatePresence, motion } from "framer-motion"

export default function RequestsPage() {
    const router = useRouter()
    const [subFilter, setSubFilter] = useState("received")
    const { user } = useUser()
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className="text-white min-h-screen mb-22">
            {/* Header */}
            <header className="flex justify-between items-center p-4 pt-8">
                <div className="flex items-center gap-2">
                    <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Movie Requests</h1>
                        <p className="text-sm text-white/60">Request and manage movie suggestions</p>
                    </div>
                </div>
                <Link href="/profile">
                    <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-[#ff7db8] to-[#ee2a7b]">
                        <div className="h-full w-full rounded-full overflow-hidden bg-black">
                            <Image
                                src={user?.imgname || DefaultImage}
                                alt="Profile"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </Link>
            </header>


            {/* Sub-filter for Requests */}
            <div className="px-4 mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setSubFilter("received")}
                        className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 
              ${subFilter === "received"
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-[#ff7db8] after:to-[#ee2a7b]"
                                : "text-gray-400 border-b-2 border-transparent hover:text-white"}`}
                    >
                        Received
                    </button>
                    <button
                        onClick={() => setSubFilter("sent")}
                        className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 
              ${subFilter === "sent"
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-[#ff7db8] after:to-[#ee2a7b]"
                                : "text-gray-400 border-b-2 border-transparent hover:text-white"}`}
                    >
                        Sent
                    </button>
                </div>
                <div className="border-b border-gray-700 -mt-0.5"></div>
            </div>

            {/* Content based on sub-filter */}
            {subFilter === "received" && (
                <div className="z-50">
                    <ReceviedSuggestion />
                </div>
            )}

            {subFilter === "sent" && (
                <SuggestionsSent />
            )}

            {/* Floating Action Button */}
            <motion.button
                data-tour-target="floating-action-menu"
                className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] flex items-center justify-center shadow-lg z-40"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
            >
                <Plus className="w-6 h-6 text-white" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (

                    <motion.button
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: -60 }}
                        exit={{ opacity: 0, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="fixed bottom-24 right-4 w-48 p-3 rounded-lg bg-[#ff7db8]/20 backdrop-blur-sm border border-[#ee2a7b]/30 flex items-center gap-2 shadow-lg z-40"
                        onClick={() => router.push("/request-suggestion")}
                    >
                        <Send size={20} />
                        Request Movie
                    </motion.button>
                )}
            </AnimatePresence>

            <BottomNavigation currentPath={"/suggestions-page"} />
        </div>
    )
}
