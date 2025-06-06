"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import Link from "next/link"
import {
  Bell, ChevronRight, ArrowLeft, Settings, Users, Globe,
  Crown, Share2, Edit,
  Eye,
  Bookmark,
  ArrowRight,
  Gem,
  UserPlus,
  VenusAndMars,
  CalendarDays,
  Languages,
  Drama
} from "lucide-react"
import { motion } from "framer-motion"
import FloatingDots from "@/components/flotingdots"
import { Card } from "@/components/ui/card"
import { UserData } from "./type"
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import {  PageTransitionWrapper } from "@/components/PageTransition"

export default function ProfilePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = Cookies.get("userID")
        if (!userId) {
          setError("User ID not found. Please log in again.")
          setLoading(false)
          return
        }

        const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${userId}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()

        // Filter out null watchlist entries
        data.watchlist = data.watchlist?.filter((item: any) => item !== null) ?? []
        data.watchlist_count = data.watchlist.length

        setUserData(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load profile data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleShare = async () => {
    if (Capacitor.isNativePlatform()) {
      // Native share via Capacitor
      await Share.share({
        title: 'Suggesto',
        text: 'Check out Suggesto!',
        url: 'https://suggesto.top',
      });
    } else if (navigator.share) {
      // Web share
      navigator.share({
        title: 'Suggesto',
        text: 'Check out Suggesto!',
        url: 'https://suggesto.top',
      });
    } else {
      alert('Sharing is not supported on this platform.');
    }
  };

  const defaultBadges = ["Cine Seed", "Newcomer", "Suggesto Starter", "Fresh Reeler"];
  const fallbackBadge = defaultBadges[(userData?.user_id ?? 0) % defaultBadges.length] || defaultBadges[0];
  const badgeToDisplay = userData?.badge || fallbackBadge;

  const handleBack = () => router.back()
  const handleNotifications = () => router.push("/notifications")
  const handleSettings = () => router.push("/settings")
  const handleEdit = () => router.push("/profile/edit")
  const handleLanguage = () => router.push("/language")
  const handleGenre = () => router.push("/genres-interests")
  const handleFriends = () => router.push("/friends")


  if (error) {
    return (
      <div className=" min-h-screen text-white flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#6c5ce7] hover:bg-[#5a4bd6] rounded-xl text-white font-semibold transition-all duration-300 shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }



  return (
       
    // <PageTransitionWrapper>
    <div className=" min-h-screen text-white">
      {/* Header */}
      <div className="relative bg-primary border border-[#6c5ce7]/20 rounded-b-4xl pb-4">
        <header className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-2.5" aria-label="Go back">
              <ArrowLeft size={20} className="text-white" />
            </button>
            <h1 className="text-xl font-bold">My Profile</h1>
          </div>
          <div className="flex items-center gap-0">
            <Link
              href="/premium"
              className="border  text-white rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="Upgrade to Pro"
            >
              <Crown className="w-5 h-5" />
            </Link>
            <button
              onClick={handleNotifications}
              className="relative p-2.5"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#6c5ce7] to-[#5a4bd6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {notificationCount}
                </span>
              )}
            </button>
            <button onClick={handleSettings} className="p-2.5" aria-label="Settings">
              <Settings className="h-5 w-5 text-white" />
            </button>

          </div>
          {/* Small Edit Button */}

        </header>
        <div className="absolute right-0 p-2">
          <button
            onClick={handleEdit}
            className="text-sm bg-black/80 text-white font-semibold px-3 py-1 rounded-2xl shadow-sm "
            aria-label="Edit Profile"
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="px-4 pb-8">

          <div className="mt-6">

            <div className="flex flex-col sm:flex-row items-center gap-4  p-4">
              <div className="relative flex flex-col items-center">

                <div className="flex items-center justify-center mb-3">
                  <div className="relative w-40 h-40">
                    {/* Floating Dots */}
                    <FloatingDots />

                    {/* Black background circle */}
                    <div className="absolute inset-0 rounded-full bg-black shadow-xl z-10" />

                    {/* Neon gradient ring */}
                    <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="gradRing" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ff00f7" />
                          <stop offset="50%" stopColor="#a85aff" />
                          <stop offset="100%" stopColor="#00e0ff" />
                        </linearGradient>
                      </defs>
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradRing)"
                        strokeWidth="4"
                        strokeDasharray="282.6"
                        strokeDashoffset="56.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Profile Image */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full overflow-hidden border-4 border-black shadow-lg z-30">
                      {loading ? (
                        <div className="w-full h-full bg-[#6c5ce7]/20 animate-pulse" />
                      ) : (
                        <img
                          src={userData?.imgname || "/api/placeholder/128/128"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Edit Button */}
                    {/* <button
                      className="absolute bottom-0 right-2 translate-x-1/4 translate-y-1/4 bg-[#6c5ce7] hover:bg-[#5c4bd3] p-2 rounded-full shadow z-40 transition-colors duration-200"
                      onClick={handleEdit}
                      title="Edit Profile"
                      aria-label="Edit Profile"
                    >
                      <Edit className="w-5 h-5 text-white" />
                    </button> */}
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="font-bold text-2xl text-white mb-2">{userData?.name}</h2>
                  <div className="inline-flex items-center gap-2  mb-2 text-sm bg-black/20 text-white px-3 py-1 rounded-full">
                    {/* <Phone className="w-4 h-4" /> */}
                    <span>{userData?.mobilenumber}</span>
                  </div>
                </div>
              </div>

              {/* User Info Section */}
              <div className="flex-1 mt-2">
                {loading ? (
                  <div className="flex items-center justify-between gap-6 text-center">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <div className="h-7 w-10 bg-[#6c5ce7]/20 animate-pulse rounded-lg mx-auto" />
                        <div className="h-4 w-10 bg-[#6c5ce7]/20 animate-pulse rounded-md mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-10 text-white/80 text-sm text-center">
                    <div className="flex flex-col items-center gap-3">
                      <VenusAndMars className="w-10 h-10 text-white/80" />
                      <span className="font-semibold  text-sm text-white">{userData?.gender}</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <CalendarDays className="w-10 h-10 text-white/80" />
                      <span className="font-semibold  text-sm text-white">
                        {new Date(userData?.dob ?? "").toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <Globe className="w-10 h-10 text-white/80" />
                      <span className="font-semibold  text-sm text-white">{userData?.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-[-24px] left-1/2 transform -translate-x-1/2 bg-white backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center justify-center gap-3 border border-white/30 shadow-lg">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="text-primary font-bold text-sm">{badgeToDisplay}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3  gap-4 mt-12 mb-10">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 bg-[#6c5ce7]/20 animate-pulse rounded-2xl" />
            ))
          ) : (
            <>
              <div
                onClick={() => router.push("/watch-list")}
                className="bg-gradient-to-br from-[#6c5ce7]/15 to-[#6c5ce7]/5 backdrop-blur-sm border-1 border-[#6c5ce7]/80 rounded-2xl p-4 text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center">
                <Bookmark className="text-[#6c5ce7] mb-2" size={28} />
                <div className="text-sm text-white/80 font-medium mb-1">Watchlisted</div>
                <div className="text-2xl font-bold text-primary"> {(userData?.watchlist_count || 0).toString().padStart(2, '0')}</div>
              </div>

              <div
                onClick={() => router.push("/watched")}
                className="bg-gradient-to-br from-[#6c5ce7]/15 to-[#6c5ce7]/5 backdrop-blur-sm  border-1 border-[#6c5ce7]/80 rounded-2xl p-4 text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center">
                <Eye className="text-[#6c5ce7] mb-2" size={28} />
                <div className="text-sm text-white/80 font-medium mb-1">Watched</div>
                <div className="text-2xl font-bold text-primary">{(userData?.watchedlist_count || 0).toString().padStart(2, '0')}</div>
              </div>

              <div
                onClick={() => router.push("/suggest")}
                className="bg-gradient-to-br from-[#6c5ce7]/15 to-[#6c5ce7]/5 backdrop-blur-sm border-1 border-[#6c5ce7]/80 rounded-2xl p-4 text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center">
                <Users className="text-[#6c5ce7] mb-2" size={28} />
                <div className="text-sm text-white/80 font-medium mb-1">Suggested</div>
                <div className="text-2xl font-bold text-primary">{(userData?.suggestedlist_count || 0).toString().padStart(2, '0')}</div>
              </div>
            </>
          )}
        </div>

        {/* Languages */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Languages className="w-5 h-5 text-[#6c5ce7]" />
              Languages
            </h3>
            <Link href={"/language"} >
              <Edit className="w-5 h-5 text-[#6c5ce7]" /></Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-8 w-20 bg-[#6c5ce7]/20 animate-pulse rounded-full" />
              ))
            ) : userData?.languages && userData.languages.length > 0 ? (
              userData.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#6c5ce7]/20 backdrop-blur-sm border border-[#6c5ce7]/30 rounded-full text-sm font-medium text-white hover:bg-[#6c5ce7]/30 transition-all duration-300"
                >
                  {language}
                </span>
              ))
            ) : (
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#5a4bd6] rounded-full text-sm font-medium text-white flex items-center gap-2 hover:from-[#5a4bd6] hover:to-[#4c42c7] transition-all duration-300 shadow-lg"
                onClick={handleLanguage}
              >
                Choose languages <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Genre Interests */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Drama className="w-5 h-5 text-[#6c5ce7]" />
              Favorite Genres
            </h3>
            <Link href={"/genres-interests"}>
              <Edit className="w-5 h-5 text-[#6c5ce7]" /></Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-8 w-20 bg-[#6c5ce7]/20 animate-pulse rounded-full" />
              ))
            ) : userData?.interests && userData.interests.length > 0 ? (
              <>
                {userData.interests.slice(0, 4).map((genre, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#6c5ce7]/20 backdrop-blur-sm border border-[#6c5ce7]/30 rounded-full text-sm font-medium text-white hover:bg-[#6c5ce7]/30 transition-all duration-300"
                  >
                    {genre}
                  </span>
                ))}
                {userData.interests.length > 4 && (
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#5a4bd6] rounded-full text-sm font-medium text-white flex items-center gap-2 hover:from-[#5a4bd6] hover:to-[#4c42c7] transition-all duration-300 shadow-lg"
                    onClick={handleGenre}
                  >
                    +{userData.interests.length - 4} more <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </>
            ) : (
              <button
                className="px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#5a4bd6] rounded-full text-sm font-medium text-white flex items-center gap-2 hover:from-[#5a4bd6] hover:to-[#4c42c7] transition-all duration-300 shadow-lg"
                onClick={handleGenre}
              >
                Choose genres <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>


        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#6c5ce7]" />
              Friends
            </h3>
            <button
              onClick={handleFriends}
              className="text-sm font-medium text-[#6c5ce7] hover:underline"
            >
              See All
            </button>
          </div>
          {loading ? (
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-[#6c5ce7]/20 rounded-full animate-pulse" />
              ))}
            </div>
          ) : userData?.friends_count && userData.friends_count > 0 ? (
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              {(userData.friends || []).slice(0, 4).map((friend: any, index: number) => (
                <div
                  key={index}
                  onClick={() => router.push(`/friends/friend-profile-detail?profile_id=${friend.user_id}`)}
                  className="text-center min-w-16 cursor-pointer"
                >
                  <img
                    src={friend.image?.replace(/\\/g, "") || "/api/placeholder/64/64"}
                    alt={friend.name || "Friend"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#6c5ce7]/40 shadow"
                  />
                  {friend.name && (
                    <div className="text-xs text-white/80 mt-1 truncate w-16">
                      {friend.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mt-4">
              <div className="text-white/60 text-sm mb-2">
                You haven’t added any friends yet.
              </div>
              <button
                onClick={handleFriends}
                className="bg-[#6c5ce7] text-white text-sm px-4 py-2 mt-2 rounded-3xl hover:bg-[#5948c2] transition">
                Add Friends
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 mb-16">
          {/* Premium Card with Purple Gradient */}
          <Card
            onClick={() => router.push('/premium')}
            className="rounded-3xl bg-gradient-to-br from-[#6c5ce7] to-[#4834d4] text-white border-0 shadow-xl flex flex-col justify-between transition-transform hover:scale-105 duration-200 group">
            <div className="text-center">
              <Gem className="w-10 h-10 mx-auto mb-3 text-white/80" strokeWidth={2.5} />
              <div className="font-bold text-lg">Premium</div>
              <div className="text-sm text-white/80">Exclusive Features</div>
              <div className="mt-2 flex justify-center items-center">
                <ArrowRight className="bg-white text-[#6c5ce7] rounded-full p-1 w-7 h-7 shadow-md transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Card>

          {/* Refer a Friend Card with Lighter Purple Gradient */}
          <Card
            onClick={() => router.push('/invite-friend')}
            className="rounded-3xl bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7] text-white border-0 shadow-xl flex flex-col justify-between transition-transform hover:scale-105 duration-200 group">
            <div className="text-center">
              <UserPlus className="w-10 h-10 mx-auto mb-3 text-white/80" strokeWidth={2.5} />
              <div className="font-bold text-lg">Refer a Friend</div>
              <div className="text-sm text-white/80">Earn Rewards</div>
              <div className="mt-2 flex justify-center items-center">
                <ArrowRight className="bg-white text-[#6c5ce7] rounded-full p-1 w-7 h-7 shadow-md transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Floating Share Button */}
      <motion.button
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleShare}
        aria-label="Share Profile"
      >
        <Share2 className="h-6 w-6 text-white" />
      </motion.button>

    </div>
    // </PageTransitionWrapper>
       
  )
}
