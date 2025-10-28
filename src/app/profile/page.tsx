"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Bell, ArrowLeft, Settings, Users, Crown, Share2, Edit, ArrowRight, Gem, UserPlus, Languages, Drama,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image";
import { Card } from "@/components/ui/card"
import { UserData } from "./type"
import { Share } from '@capacitor/share';
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { PageTransitionWrapper } from "@/components/PageTransition"
import toast from "react-hot-toast"
import { BottomNavigation } from "@/components/bottom-navigation"
import genderIcon from "@/assets/male.png";
import dobIcon from "@/assets/birthday.png";
import locationIcon from "@/assets/location1.png";
import Bookmark from "@/assets/bookmark.png";
import Eye from "@/assets/eye.png";
import User from "@/assets/users.png";
import Heart from "@/assets/heart.png";
import BackgroundImage from "@/assets/profile-banner.jpg"
import DefaultImage from "@/assets/default-user.webp"
import RewardSection from "./_components/reward-points-card"
import Top10WallImage from "@/assets/top-10.png";
import { useUser } from "@/contexts/UserContext"
import ShareImage from "@/assets/app-share-banner.jpg"

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser } = useUser()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = typeof window !== 'undefined' ? localStorage.getItem("userID") : null
        if (!userId) {
          toast.error("User ID not found. Please log in again.")
          setLoading(false)
          return
        }

        const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${userId}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        setUser(data)
        // Filter out null watchlist entries
        data.watchlist = data.watchlist?.filter((item: any) => item !== null) ?? []
        data.watchlist_count = data.watchlist.length

        setUserData(data)
      } catch (err) {
        console.error("Error fetching user data:", err)
        toast.error("Failed to load profile data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  async function handleShare() {
    const isAndroid = /android/i.test(navigator.userAgent);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const referralId = userData?.referral_code || "defaultRef";
    const appUrl = isAndroid
      ? `https://play.google.com/store/apps/details?id=com.suggesto.app&ref=${referralId}`
      : `https://apps.apple.com/app/id1234567890?ref=${referralId}`;

    if (Capacitor.isNativePlatform()) {
      // ✅ fetch image using .src
      const response = await fetch(ShareImage.src);
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);

      const fileName = "share-banner.jpg";
      await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });

      const { uri } = await Filesystem.getUri({
        path: fileName,
        directory: Directory.Cache,
      });

      await Share.share({
        title: "Suggesto",
        text: "Check out Suggesto — discover amazing movies!",
        url: appUrl,
        files: [uri], 
      });
    } else if (navigator.share) {
      await navigator.share({
        title: "Suggesto",
        text: "Check out Suggesto — discover amazing movies!",
        url: appUrl,
      });
    } else {
      await navigator.clipboard.writeText(appUrl);
      alert("Link copied to clipboard!");
    }
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // keep only base64 content
      };
      reader.readAsDataURL(blob);
    });
  }



  const defaultBadges = ["Cine Seed", "Newcomer", "Suggesto Starter", "Fresh Reeler"];
  const fallbackBadge = defaultBadges[(userData?.user_id ?? 0) % defaultBadges.length] || defaultBadges[0];
  const badgeToDisplay = userData?.badge || fallbackBadge;

  const handleBack = () => router.back()
  const handleNotifications = () => router.push("/notifications")
  const handleSettings = () => router.push("/settings")
  const handleEdit = () => router.push("/profile/edit")
  const handleFriends = () => router.push("/friends")

  return (
    <div className="min-h-screen text-white">
      {/* Background Image Container - covers from top to Info Box */}
      <div className="relative h-100">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={BackgroundImage}
            alt="Profile Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Container with relative positioning */}
        <div className="relative z-20">
          {/* Header */}
          <header className="flex items-center justify-between pt-8 px-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-3">
                <button onClick={handleBack} className="p-2.5" aria-label="Go back">
                  <ArrowLeft size={20} className="text-white" />
                </button>
                <div>
                  <h1 className="text-xl font-bold">My Profile</h1>
                  <p className="text-sm text-gray-400">Manage your details</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0">
              <Link
                href="/premium"
                className="border bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-full w-10 h-10 flex items-center justify-center"
                aria-label="Upgrade to Pro"
              >
                <Crown className="w-5 h-5" />
              </Link>
              <button
                onClick={handleNotifications}
                className="relative p-2.5"
                aria-label="Notifications"
              >
                <Bell
                  className={`w-5 h-5 text-white ${!loading && (userData?.not_count ?? 0) > 0 ? "shake" : ""}`}
                />
                {!loading && (userData?.not_count ?? 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                    {userData?.not_count}
                  </span>
                )}
              </button>

              <button onClick={handleSettings} className="p-2.5" aria-label="Settings">
                <Settings className="h-5 w-5 text-white" />
              </button>
            </div>
          </header>

          {/* Edit Profile Button */}
          <div className="absolute right-4 mt-4">
            {loading ? (
              <div className="w-24 h-8 bg-[#2b2b2b]/40 backdrop-blur-sm rounded-2xl animate-pulse" />
            ) : (
              <button
                onClick={handleEdit}
                className="text-sm bg-[#2b2b2b]/80 backdrop-blur-sm text-white font-semibold px-3 py-1 rounded-2xl shadow-sm"
                aria-label="Edit Profile"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Header */}
          <div className="flex items-center space-x-4 p-4 px-8 rounded-lg mt-8">
            {/* Profile Image */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
              {loading ? (
                <div className="w-full h-full bg-[#b56bbc]/20 animate-pulse" />
              ) : typeof userData?.imgname === "string" && userData.imgname ? (
                <img
                  src={userData.imgname}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={DefaultImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Name & Info */}
            <div>
              {loading ? (
                <div className="space-y-2">
                  <div className="w-32 h-6 bg-white/20 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-white/20 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <h2 className="text-white font-semibold text-xl drop-shadow-lg">{userData?.name}</h2>
                  <p className="text-gray-300 text-sm drop-shadow-lg">{userData?.mobilenumber}</p>
                </>
              )}
            </div>
          </div>

          {/* Info Box with Gender, DOB, Location */}
          <div className="relative mt-6 mx-4 rounded-3xl border-2 border-primary bg-transparent">
            <div className="rounded-3xl bg-transparent p-6 py-8 mb-2">
              <div className="flex justify-between text-white text-sm font-medium">
                {loading ? (
                  <>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
                      <div className="w-16 h-4 bg-white/20 rounded animate-pulse mt-2" />
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
                      <div className="w-20 h-4 bg-white/20 rounded animate-pulse mt-2" />
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
                      <div className="w-16 h-4 bg-white/20 rounded animate-pulse mt-2" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center flex-1">
                      <Image src={genderIcon} alt="Gender" className="w-12 h-12" />
                      <span className="mt-2">{userData?.gender}</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <Image src={dobIcon} alt="DOB" className="w-12 h-12" />
                      <span className="mt-2">
                        {new Date(userData?.dob ?? "").toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <Image src={locationIcon} alt="Location" className="w-12 h-12" />
                      <span className="mt-2">{userData?.location}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Floating Badge */}
              <div className="absolute left-1/2 -bottom-7 transform -translate-x-1/2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] p-[1px] rounded-full">
                {loading ? (
                  <div className="bg-white px-4 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-xl animate-pulse" />
                      <div className="w-24 h-4 bg-gray-300 rounded animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-xl flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                    <span className="whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] font-bold text-sm">
                      {badgeToDisplay}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-12 flex gap-4 px-4 overflow-x-auto no-scrollbar">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="min-w-[200px] h-20 bg-[#2b2b2b]/40 animate-pulse rounded-[80px]" />
          ))
        ) : (
          <>
            <div
              onClick={() => router.push("/favorite-list")}
              className="bg-[#2b2b2b] rounded-[80px] px-2 py-3 gap-3 text-center shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <div className="p-3 rounded-full bg-white w-12 h-12">
                <Image src={Heart} alt="Heart" width={48} height={48} />
              </div>
              <div className="text-2xl font-semibold text-white">
                {(userData?.favmov_count || 0).toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-white font-medium mr-2">Favorites</div>
            </div>

            <div
              onClick={() => router.push("/watch-list")}
              className="bg-[#2b2b2b] rounded-[80px] px-2 py-3 gap-3 text-center shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <div className="p-3 rounded-full bg-white w-12 h-12">
                <Image src={Bookmark} alt="Bookmark" width={48} height={48} />
              </div>
              <div className="text-2xl font-semibold text-white">
                {(userData?.watchlist_count || 0).toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-white font-medium mr-2">Watchlisted</div>
            </div>

            <div
              onClick={() => router.push("/watched")}
              className="bg-[#2b2b2b] rounded-[80px] px-2 py-3 gap-3 text-center shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <div className="p-3 rounded-full bg-white w-12 h-12">
                <Image src={Eye} alt="Watched" width={48} height={48} />
              </div>
              <div className="text-2xl font-semibold text-white">
                {(userData?.watchedlist_count || 0).toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-white font-medium mr-2">Watched</div>
            </div>

            <div
              onClick={() => router.push("/suggest")}
              className="bg-[#2b2b2b] rounded-[80px] px-2 py-3 gap-3 text-center shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <div className="p-3 rounded-full bg-white w-12 h-12">
                <Image src={User} alt="Suggested" width={60} height={60} />
              </div>
              <div className="text-2xl font-semibold text-white">
                {(userData?.suggestedlist_count || 0).toString().padStart(2, "0")}
              </div>
              <div className="text-sm text-white font-medium mr-2">Suggested</div>
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        {/* Languages */}
        <div className="mb-10 mt-10">
          <div className="flex items-center justify-between mb-2">
            {loading ? (
              <div className="w-32 h-6 bg-[#2b2b2b]/40 animate-pulse rounded" />
            ) : (
              <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                <Languages className="text-xl text-[#b56bbc]" />
                Languages
              </h3>
            )}
            {!loading && (
              <Link href={"/language"}>
                <Edit className="w-5 h-5 text-[#b56bbc]" />
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-8 w-20 bg-[#2b2b2b]/40 animate-pulse rounded-full" />
              ))
            ) : userData?.languages && userData.languages.length > 0 ? (
              userData.languages.map((language: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#2b2b2b] rounded-full text-sm font-medium text-white"
                >
                  {language}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">No Languages</p>
            )}
          </div>
        </div>

        {/* Genre Interests */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            {loading ? (
              <div className="w-40 h-6 bg-[#2b2b2b]/40 animate-pulse rounded" />
            ) : (
              <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                <Drama className="text-xl text-[#b56bbc]" />
                Favorite Genres
              </h3>
            )}
            {!loading && (
              <Link href={"/genres-interests"}>
                <Edit className="w-5 h-5 text-[#b56bbc]" />
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-8 w-20 bg-[#2b2b2b]/40 animate-pulse rounded-full" />
              ))
            ) : userData?.interests && userData.interests.length > 0 ? (
              userData.interests.map((genre, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-[#2b2b2b] rounded-full text-sm font-medium text-white">
                  {genre}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-400">No Genres</p>
            )}
          </div>
        </div>

        {/* Friends */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {loading ? (
              <div className="w-24 h-6 bg-[#2b2b2b]/40 animate-pulse rounded" />
            ) : (
              <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                <Users className="text-xl text-[#b56bbc]" />
                Friends
              </h3>
            )}
            {!loading && (
              <button
                onClick={handleFriends}
                className="text-sm font-medium text-[#b56bbc] hover:underline"
              >
                See All
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-16 h-16 bg-[#2b2b2b]/40 rounded-full animate-pulse" />
              ))}
            </div>
          ) : userData?.friends_count && userData.friends_count > 0 ? (
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
              {(userData.friends || []).slice(0, 10).map((friend: any, index: number) => (
                <div
                  key={index}
                  onClick={() => router.push(`/friends/friend-profile-detail?profile_id=${friend.user_id}`)}
                  className="text-center min-w-16 cursor-pointer"
                >
                  <img
                    src={friend.image?.replace(/\\/g, "") || "/api/placeholder/64/64"}
                    alt={friend.name || "Friend"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#b56bbc]/40 shadow"
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
                You haven't added any friends yet.
              </div>
              <button
                onClick={handleFriends}
                className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white text-sm px-4 py-2 mt-2 rounded-3xl hover:bg-[#5948c2] transition">
                Add Friends
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 mb-2">
          {/* Reward section */}
          {loading ? (
            <div className="w-full h-32 bg-[#2b2b2b]/40 animate-pulse rounded-3xl" />
          ) : (
            <RewardSection
              key="rewardsection"
              coins={userData?.coins ?? ""}
              user={{ payment_status: userData?.payment_status }} />
          )}
        </div>

        <div className="mt-8 mb-2">
          {/* Top 10 Movie Wall */}
          <div className="px-2 mb-10">
            {loading ? (
              <div className="w-full h-32 bg-[#2b2b2b]/40 animate-pulse rounded-3xl" />
            ) : (
              <div className="p-[2px] rounded-3xl bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:scale-105 transition-transform duration-200 shadow-xl">
                <div
                  onClick={() => router.push(`/top-10-wall`)}
                  className="relative rounded-3xl bg-[#121214] text-white flex flex-row justify-between items-center px-6 py-5 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold leading-tight">
                      My Top 10 Wall
                    </h3>
                    <p className="text-xs text-white/70">
                      Discover top 10 movies that I prefer & love the most.
                    </p>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    <Image
                      src={Top10WallImage}
                      alt="Top 10"
                      width={60}
                      height={60}
                      className="object-contain w-16 h-16"
                    />
                  </div>

                  <div className="absolute bottom-0 left-6 translate-y-1/2 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] rounded-full p-2">
                    <ArrowRight className="h-6 w-6 text-[#b56bbc]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8 mb-16">
          {loading ? (
            <>
              <div className="h-32 bg-[#2b2b2b]/40 animate-pulse rounded-3xl" />
              <div className="h-32 bg-[#2b2b2b]/40 animate-pulse rounded-3xl" />
            </>
          ) : (
            <>
              {/* Premium Card with Purple Gradient */}
              <Card
                onClick={() => router.push('/premium')}
                className="rounded-3xl bg-gradient-to-br from-[#7a71c4] to-[#b56bbc] text-white border-0 shadow-xl flex flex-col justify-between transition-transform hover:scale-105 duration-200 group">
                <div className="text-center">
                  <Gem className="w-10 h-10 mx-auto mb-3 text-white/80" strokeWidth={2.5} />
                  <div className="font-bold text-lg">Premium</div>
                  <div className="text-sm text-white/80">Exclusive Features</div>
                  <div className="mt-2 flex justify-center items-center">
                    <ArrowRight className="bg-white text-[#b56bbc] rounded-full p-1 w-7 h-7 shadow-md transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>

              {/* Refer a Friend Card with Lighter Purple Gradient */}
              <Card
                onClick={() => router.push('/invite-friend')}
                className="rounded-3xl bg-white text-white border-0 shadow-xl flex flex-col justify-between transition-transform hover:scale-105 duration-200 group">
                <div className="text-center">
                  <UserPlus className="w-10 h-10 mx-auto mb-3 text-[#b56bbc]" strokeWidth={2.5} />
                  <div className="font-bold text-lg bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                    Refer a Friend
                  </div>
                  <div className="text-sm text-black/80">Earn Rewards</div>
                  <div className="mt-2 flex justify-center items-center">
                    <ArrowRight className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-full p-1 w-7 h-7 shadow-md transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Floating Share Button */}
      {!loading && (
        <motion.button
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          onClick={handleShare}
          aria-label="Share Profile"
        >
          <Share2 className="h-6 w-6 text-white" />
        </motion.button>
      )}

      <BottomNavigation currentPath="/profile" />
    </div>
  )
}