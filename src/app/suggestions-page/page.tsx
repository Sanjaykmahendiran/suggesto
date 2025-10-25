"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import SuggestMoviebg from "@/assets/suggest/suggest-movie-bg.png"
import SuggestMovieIcon from "@/assets/suggest/suggest-movie.png"
import SuggestCastbg from "@/assets/suggest/suggest-cast-bg.png"
import SuggestCastIcon from "@/assets/suggest/suggest-cast.png"
import RequestMoviebg from "@/assets/suggest/request-movie-bg.png"
import RequestMovieIcon from "@/assets/suggest/request-movie.png"
import { BottomNavigation } from "@/components/bottom-navigation"
import Link from "next/link"
import { useUser } from "@/contexts/UserContext"
import DefaultImage from "@/assets/default-user.webp"

export default function SuggestionsPage() {
  const router = useRouter()
  const { user, setUser } = useUser()

  const cardAssets = [
    {
      cs_id: 1,
      bg: SuggestMoviebg,
      icon: SuggestMovieIcon,
      title: "Suggest Movie",
      route: "/suggest-movie",
      description: "Share your favorite movies with the community"
    },
    {
      cs_id: 2,
      bg: RequestMoviebg,
      icon: RequestMovieIcon,
      title: "Request Movie",
      route: "/request-movie",
      description: "Get movie suggestions by mood or genre"
    },
    {
      cs_id: 3,
      bg: SuggestCastbg,
      icon: SuggestCastIcon,
      title: "Suggest Cast",
      route: "/suggest-cast",
      description: "Recommend your favorite actors and actresses"
    }
  ]

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* Header */}
      <header className="flex justify-between items-center p-4 pt-8">
        <div className="flex items-center gap-2">
          <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Suggestions</h1>
            <p className="text-sm text-white/60">Share your favorite movies and cast</p>
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

      {/* Game Cards */}
      <div className="grid grid-cols-2 gap-2 px-3 mt-6">
        {cardAssets.map((item, index) => (
          <div
            key={item.cs_id}
            onClick={() => router.push(item.route)}
            className={`h-[260px] bg-cover bg-center rounded-3xl relative shadow-md border border-white/10 flex flex-col transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 ${index % 2 !== 0 ? "mt-8" : ""
              }`}
            style={{ backgroundImage: `url(${item.bg.src})` }}
          >
            {/* Icon */}
            <div className="flex justify-center mt-10">
              <img
                src={item.icon.src}
                alt="icon"
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Text */}
            <div className="relative z-10 p-2 flex flex-col flex-grow">
              <h2 className="text-lg font-semibold text-center">{item.title}</h2>
              <p className="text-xs text-gray-200 text-center mt-1">
                {item.description}
              </p>
            </div>

            <div className="absolute bottom-2 right-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer shadow">
                <ChevronRight className="w-4 h-4 text-[#ff7db8]" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNavigation currentPath="/suggestions-page" />
    </div>
  )
}
