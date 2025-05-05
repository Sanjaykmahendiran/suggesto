"use client"

import Image from "next/image"
import { ArrowLeft, MoreVertical, Search, Plus } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function FriendsPage() {
    return (
        <div className=" min-h-screen text-white mb-16">
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold">Friends List</h1>
                </div>
                <button>
                    <MoreVertical className="w-6 h-6" />
                </button>
            </header>

            <div className="p-4">
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-[#292938] text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-1 focus:ring-[#5d5fef]"
                        placeholder="Search friends..."
                    />
                </div>

                <div className="flex space-x-2 px-4 overflow-x-auto pb-2 no-scrollbar mb-6">
                    <button className="flex items-center justify-center px-6 py-2 rounded-full bg-[#6c5ce7] text-white text-sm whitespace-nowrap">
                        All Friends
                    </button>
                    <button className="flex items-center justify-center px-6 py-2 rounded-full bg-transparent text-gray-300 text-sm border border-gray-600 whitespace-nowrap">
                        Recently Active
                    </button>
                    <button className="flex items-center justify-center px-6 py-2 rounded-full bg-transparent text-gray-300 text-sm border border-gray-600 whitespace-nowrap">
                        Favorites
                    </button>
                </div>

                <div className="space-y-4">
                    {[
                        {
                            name: "Emma Watson",
                            username: "@emmaw",
                            avatar: "/placeholder.svg?height=48&width=48",
                            active: true,
                            mutualMovies: 24,
                        },
                        {
                            name: "James Smith",
                            username: "@jsmith",
                            avatar: "/placeholder.svg?height=48&width=48",
                            active: true,
                            mutualMovies: 18,
                        },
                        {
                            name: "Olivia Parker",
                            username: "@oliviap",
                            avatar: "/placeholder.svg?height=48&width=48",
                            active: false,
                            mutualMovies: 15,
                        },
                        {
                            name: "Michael Brown",
                            username: "@mbrown",
                            avatar: "/placeholder.svg?height=48&width=48",
                            active: false,
                            mutualMovies: 12,
                        },
                        {
                            name: "Sophia Garcia",
                            username: "@sophiag",
                            avatar: "/placeholder.svg?height=48&width=48",
                            active: false,
                            mutualMovies: 9,
                        },
                    ].map((friend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#292938] rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Image
                                        src={friend.avatar || "/placeholder.svg"}
                                        alt={friend.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full object-cover"
                                    />
                                    {friend.active && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e1e1e]"></div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium">{friend.name}</p>
                                    <p className="text-gray-400 text-sm">{friend.username}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">{friend.mutualMovies} mutual</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="fixed bottom-20 right-6 bg-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6" />
                </button>
            </div>
            <BottomNavigation currentPath="/profile" />
        </div>
    )
}
