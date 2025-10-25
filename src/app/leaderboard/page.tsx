"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

export default function WinnersPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("weekly")

  const weeklyLeaders = [
    { name: "Alex Chen", coins: 15420, badge: "🥇", avatar: "AC" },
    { name: "Sarah Kim", coins: 14890, badge: "🥈", avatar: "SK" },
    { name: "Mike Johnson", coins: 13750, badge: "🥉", avatar: "MJ" },
    { name: "Emma Wilson", coins: 12340, badge: "", avatar: "EW" },
    { name: "David Lee", coins: 11890, badge: "", avatar: "DL" },
    { name: "Lisa Brown", coins: 10560, badge: "", avatar: "LB" },
    { name: "Tom Davis", coins: 9870, badge: "", avatar: "TD" },
    { name: "Anna Garcia", coins: 9340, badge: "", avatar: "AG" },
    { name: "John Smith", coins: 8920, badge: "", avatar: "JS" },
    { name: "Maria Lopez", coins: 8450, badge: "", avatar: "ML" },
  ]

  const monthlyLeaders = [
    { name: "Sarah Kim", coins: 45890, badge: "🥇", avatar: "SK" },
    { name: "Alex Chen", coins: 42420, badge: "🥈", avatar: "AC" },
    { name: "Emma Wilson", coins: 38750, badge: "🥉", avatar: "EW" },
    { name: "Mike Johnson", coins: 35340, badge: "", avatar: "MJ" },
    { name: "David Lee", coins: 32890, badge: "", avatar: "DL" },
  ]

  const hallOfFame = [
    { name: "Alex Kumar", coins: 125000, avatar: "AK" },
    { name: "Sarah P.", coins: 98500, avatar: "SP" },
    { name: "Mike J.", coins: 87300, avatar: "MJ" },
  ]

  const currentLeaders = activeTab === "weekly" ? weeklyLeaders : monthlyLeaders

  return (


    <div className="text-white min-h-screen mb-22">
      <header className="flex justify-between items-center p-4 pt-8 mb-2">
        <div className="flex items-center gap-2">
          <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Leaderboard & Hall of Fame</h1>
            <p className="text-sm text-white/60">Top players. Big rewards.</p>
          </div>
        </div>
      </header>

      <div className="p-4 w-full mx-auto">
        {/* Tabs */}
        <div className="flex mb-6 bg-[#2b2b2b] rounded-lg p-1">
          <Button
            variant={activeTab === "weekly" ? "default" : "ghost"}
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 ${activeTab === "weekly"
              ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
          >
            Weekly
          </Button>
          <Button
            variant={activeTab === "monthly" ? "default" : "ghost"}
            onClick={() => setActiveTab("monthly")}
            className={`flex-1 ${activeTab === "monthly"
              ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
          >
            Monthly
          </Button>
        </div>

        {/* Leaderboard */}
        <div className="bg-[#1a1a1c] border-gray-700  rounded-lg mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Top 10 Players</h3>
            <div className="space-y-3">
              {currentLeaders.map((player, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${index < 3 ? "bg-gradient-to-r from-[#b56bbc]/20 to-[#7a71c4]/20" : "bg-[#2b2b2b]"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                    {player.badge && <span className="text-xl">{player.badge}</span>}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`/placeholder-user.jpg`} />
                    <AvatarFallback className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white text-xs">
                      {player.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium">{player.name}</p>
                    <p className="text-purple-400 text-sm">{player.coins.toLocaleString()} coins</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hall of Fame */}
        <div className="">
          <div className="p-">
            <div className="flex items-start gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-white">Hall of Fame</h2>
              </div>
            </div>

            <div className="px-4">
              <div className="flex items-end justify-center">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium mb-1 text-center max-w-20 truncate">{hallOfFame[1].name}</p>
                  <p className="text-xs text-gray-200 mb-2">{hallOfFame[1].coins.toLocaleString()} pts</p>
                  <div className="bg-[#b56bbc]/80 rounded-t-lg w-16 h-26 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <Trophy className="w-6 h-6 text-[#b56bbc] mb-1" />
                  <p className="text-sm font-medium mb-1 text-center max-w-20 truncate">{hallOfFame[0].name}</p>
                  <p className="text-xs text-gray-200 mb-2">{hallOfFame[0].coins.toLocaleString()} pts</p>
                  <div className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-t-lg w-16 h-34 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <p className="text-sm font-medium mb-1 text-center max-w-20 truncate">{hallOfFame[2].name}</p>
                  <p className="text-xs text-gray-200 mb-2">{hallOfFame[2].coins.toLocaleString()} pts</p>
                  <div className="bg-[#b56bbc]/60 rounded-t-lg w-16 h-24 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                </div>
              </div>
            </div>
                        {/* Achievement banner */}
            <div className="mt- bg-gradient-to-r from-yellow-500/10 via-yellow-400/20 to-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 text-center">
              <p className="text-yellow-400 font-semibold text-sm">
                🏆 These legends have achieved the impossible and earned their place in history! 🏆
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}