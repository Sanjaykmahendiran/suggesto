"use client"


import { BottomNavigation } from "@/components/bottom-navigation"
import { ArrowLeft, MoreVertical } from "lucide-react"

export default function WatchStatsPage() {
    return (
        <div className=" min-h-screen text-white mb-16">
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold">Your Watch Stats</h1>
                </div>
                <button>
                    <MoreVertical className="w-6 h-6" />
                </button>
            </header>

            <div className="p-4">
                <div className="bg-[#292938] rounded-xl p-5 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Watch Summary</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#3d3d52] p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Total Watched</p>
                            <p className="text-2xl font-bold text-primary">142</p>
                        </div>
                        <div className="bg-[#3d3d52] p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Hours Watched</p>
                            <p className="text-2xl font-bold text-primary">287</p>
                        </div>
                        <div className="bg-[#3d3d52] p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">This Month</p>
                            <p className="text-2xl font-bold text-primary">12</p>
                        </div>
                        <div className="bg-[#3d3d52] p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Avg. Rating</p>
                            <p className="text-2xl font-bold text-primary">4.2</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#292938] rounded-xl p-5 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Favorite Genres</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span>Animation</span>
                            <div className="w-3/5 bg-[#3d3d52] rounded-full h-2.5">
                                <div className="bg-[#5d5fef] h-2.5 rounded-full" style={{ width: "85%" }}></div>
                            </div>
                            <span className="text-sm text-gray-400">85%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Adventure</span>
                            <div className="w-3/5 bg-[#3d3d52] rounded-full h-2.5">
                                <div className="bg-[#5d5fef] h-2.5 rounded-full" style={{ width: "72%" }}></div>
                            </div>
                            <span className="text-sm text-gray-400">72%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Family</span>
                            <div className="w-3/5 bg-[#3d3d52] rounded-full h-2.5">
                                <div className="bg-[#5d5fef] h-2.5 rounded-full" style={{ width: "65%" }}></div>
                            </div>
                            <span className="text-sm text-gray-400">65%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Comedy</span>
                            <div className="w-3/5 bg-[#3d3d52] rounded-full h-2.5">
                                <div className="bg-[#5d5fef] h-2.5 rounded-full" style={{ width: "48%" }}></div>
                            </div>
                            <span className="text-sm text-gray-400">48%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#292938] rounded-xl p-5">
                    <h2 className="text-lg font-semibold mb-4">Watch Activity</h2>
                    <div className="h-40 flex items-end justify-between gap-1">
                        {[30, 45, 20, 60, 75, 40, 55].map((height, index) => (
                            <div key={index} className="w-full">
                                <div className="bg-[#5d5fef] rounded-t-sm" style={{ height: `${height}%` }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                </div>
            </div>
            <BottomNavigation currentPath="/profile" />
        </div>
    )
}
