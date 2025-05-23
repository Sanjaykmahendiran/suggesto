"use client"

import {
  Bell, ChevronRight, ArrowLeft,
  Settings, Users, Music, Globe, Crown
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/bottom-navigation"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [notificationCount, setNotificationCount] = useState(3)
  const [genreInterests, setGenreInterests] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const router = useRouter()

  const userStats = {
    stats: {
      watched: 143,
      favorites: 37,
      friends: 28
    }
  }

  useEffect(() => {
    const userId = Cookies.get("userID")

    if (userId) {
      Promise.all([
        fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${userId}`).then(res => res.json()),
        fetch(`https://suggesto.xyz/App/api.php?gofor=userintlist&user_id=${userId}`).then(res => res.json())
      ])
        .then(([userData, interestsData]) => {
          setUserData(userData)
          setGenreInterests(interestsData.map((item: any) => item.genre_name))
        })
        .catch(err => {
          console.error("Failed to fetch data:", err)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const handleShare = () => {
    if (navigator.canShare?.()) {
      navigator.share({
        title: "Suggesto",
        text: "Check out Suggesto – your personalized movie and show recommendations!",
        url: "https://suggesto.top",
      }).catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Sharing is not supported on this device.");
    }
  };


  return (
    <div className="flex flex-col min-h-screen text-white mb-18">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">My Profile</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="text-gray-300 relative"
            onClick={() => router.push("/notifications")}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          <Link href="/settings">
            <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
              <Settings className="h-5 w-5 text-gray-300" />
            </button>
          </Link>
        </div>
      </header>

      {/* Profile Info */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-primary">
            {loading ? (
              <Skeleton className="h-14 w-14 rounded-full" />
            ) : (
              <Image
                src={userData?.imgname || "/fallback-avatar.png"}
                alt="Profile"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div>
            {loading ? (
              <>
                <Skeleton className="h-6 w-40 rounded-md mb-2" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </>
            ) : (
              <>
                <h2 className="font-semibold text-2xl">{userData?.name}</h2>
                <p className="text-sm text-gray-400">{userData?.mobilenumber}</p>
              </>
            )}
          </div>
        </div>

        {/* Genre Interests */}
        <div className="flex flex-wrap gap-2 mt-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-6 w-20 rounded-full bg-[#292938]" />
            ))
          ) : genreInterests.length > 0 ? (
            <>
              {genreInterests.slice(0, 4).map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#292938] rounded-full text-xs text-gray-300"
                >
                  {genre}
                </span>
              ))}
              {genreInterests.length > 4 && (
                <span
                  className="p-1.5 bg-[#292938] rounded-full text-xs text-gray-300 flex items-center justify-center cursor-pointer"
                  onClick={() => router.push("/genres-interests")}
                >
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-300">Choose genres</p>
              <span
                className="px-3 py-1 bg-[#292938] rounded-full text-xs text-gray-300 flex items-center gap-1 cursor-pointer"
                onClick={() => router.push("/genres-interests")}
              >
                <ChevronRight className="h-4 w-4" />
              </span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="w-full flex justify-between mt-6 px-4 py-3 rounded-xl">
          {loading ? (
            <>
              <Skeleton className="h-10 w-12 rounded-md" />
              <Skeleton className="h-10 w-12 rounded-md" />
              <Skeleton className="h-10 w-12 rounded-md" />
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{userStats.stats.watched}</p>
                <p className="text-gray-300 text-xs">Watched</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{userStats.stats.favorites}</p>
                <p className="text-gray-300 text-xs">Favorites</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{userStats.stats.friends}</p>
                <p className="text-gray-300 text-xs">Friends</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overview Content */}
      <main className="flex-1 px-6 py-4">
        <div className="flex flex-col min-h-full justify-between">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <MenuItem icon={<Users className="h-10 w-10 text-white" />} value={28} label="Friends" link="/friends" />
              <MenuItem icon={<Music className="h-10 w-10 text-white" />} value={50} label="Genres" link="/genres-interests" />
              <MenuItem icon={<Globe className="h-10 w-10 text-white" />} value={20} label="Languages" link="/language" />
              <MenuItem icon={<Crown className="h-10 w-10 text-white" />} value="Pro" label="Pro" link="/pro-subscription" />
            </div>

            {/* Share App Button */}
            <Button
              onClick={handleShare}
              className="mt-8 w-full rounded-full p-4 text-xl font-semibold text-white"
            >
              Share App
            </Button>
          </div>

          {/* Left-aligned Footer */}
          <div className="mt-10 text-left">
            <p className="text-xl text-gray-400">Suggesto</p>
            <p className="text-sm text-gray-400">V1.0.0</p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/profile" />
    </div>
  )
}

function MenuItem({
  icon,
  label,
  value,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  link: string;
}) {
  return (
    <Link href={link}>
      <div className="flex items-center gap-4 bg-[#1f1f2b] p-8 rounded-xl hover:bg-[#2a2a3a] transition-colors cursor-pointer">
        <div className="text-white ">{icon}</div>
        <div className="flex flex-col">
          <p className="text-xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
      </div>
    </Link>
  )
}
