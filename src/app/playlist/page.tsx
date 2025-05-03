import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, Heart, Play, SlidersHorizontal } from "lucide-react"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function Playlist() {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href="/" className="p-2 rounded-full bg-[#1e1e1e]">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold">Play List</h1>
        <div className="p-2">
          <SlidersHorizontal size={20} />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="flex items-center bg-[#1e1e1e] rounded-full px-4 py-2">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent w-full focus:outline-none text-gray-300"
          />
          <SlidersHorizontal size={18} className="text-gray-400" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 px-4 overflow-x-auto pb-2 no-scrollbar">
        <button className="px-6 py-2 rounded-full bg-indigo-600 text-white text-sm">All</button>
        <button className="px-6 py-2 rounded-full bg-[#1e1e1e] text-gray-300 text-sm">Action</button>
        <button className="px-6 py-2 rounded-full bg-[#1e1e1e] text-gray-300 text-sm">Adventure</button>
        <button className="px-6 py-2 rounded-full bg-[#1e1e1e] text-gray-300 text-sm">Mystery</button>
      </div>

      {/* Recently Played */}
      <div className="mt-6 px-4">
        <h2 className="text-lg font-semibold mb-4">Recently Played</h2>

        <div className="relative mb-6">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={home1}
              alt="Onward"
              width={320}
              height={180}
              className="w-full h-[180px] object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute top-2 left-2 bg-indigo-600 text-xs px-2 py-1 rounded">NEW</div>
            <div className="absolute top-2 right-2">
              <Heart size={20} className="text-gray-300" />
            </div>
            <div className="absolute bottom-0 left-0 p-3 w-full">
              <div className="flex items-center mb-1">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mr-2">
                  <Play size={16} className="text-white" fill="white" />
                </div>
                <h3 className="font-bold text-lg">Onward</h3>
              </div>
              <p className="text-xs text-gray-300">Animation, Adventure, Family</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
            "Onward" is an enchanting animated adventure set in a modern suburban fantasy world. The story follows two
            elven brothers, Ian...
          </p>
          <p className="text-xs text-gray-500 mt-1">2 hrs 15 mins • English • 1440mp</p>
        </div>
      </div>

      {/* Finished Watching */}
      <div className="px-4 pb-20">
        <h2 className="text-lg font-semibold mb-4">Finished Watching</h2>

        <div className="relative mb-6">
          <div className="flex">
            <Image
              src={home2}
              alt="Ratatouille"
              width={150}
              height={100}
              className="w-[100px] h-[100px] object-cover rounded-lg"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between">
                <h3 className="font-bold">Ratatouille</h3>
                <Heart size={18} className="text-gray-300" />
              </div>
              <p className="text-xs text-gray-300 mt-1">Animation, Adventure, Family</p>
              <p className="text-xs text-gray-500 mt-3">2 hrs 15 mins • English • 1440mp</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">
            "Luca" is a heartwarming animated film set in a beautiful coastal town on the Italian Riviera. The story
            revolves around a young boy...
          </p>
        </div>

        <div className="relative">
          <div className="flex">
            <Image
              src={home3}
              alt="Luca"
              width={150}
              height={100}
              className="w-[100px] h-[100px] object-cover rounded-lg"
            />
            <div className="ml-3 flex-1">
              <div className="flex justify-between">
                <h3 className="font-bold">Luca</h3>
                <div className="bg-indigo-600 text-xs px-2 py-0.5 rounded">NEW</div>
              </div>
              <p className="text-xs text-gray-300 mt-1">Animation, Adventure, Family</p>
            </div>
          </div>
        </div>
      </div>
                  <BottomNavigation currentPath={"/playlist"} />
    </div>
  )
}
