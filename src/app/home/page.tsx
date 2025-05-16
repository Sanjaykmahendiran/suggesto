"use client"

import Image from "next/image"
import { Bell, Users, Sparkles, Share2, Grid } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FilterComponent from "@/components/filter-component"
import { motion, AnimatePresence } from "framer-motion"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import home4 from "@/assets/home-4.jpg"
import home5 from "@/assets/home-5.jpg"
import AvatarImg from "@/assets/avatar.jpg"
import { StaticImageData } from "next/image"

import "swiper/css"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// Define TypeScript interfaces
interface BannerType {
  id: number;
  title: string;
  subtitle?: string;
  imageSrc: string | StaticImageData;
  alt: string;
  targetUrl?: string;
}

interface RecentlyWatchedType {
  id: number;
  title: string;
  imageSrc: string | StaticImageData;
  progress: number;
  episode?: string;
}

interface FriendActivityType {
  id: number;
  title: string;
  imageSrc: string | StaticImageData;
  friend: string;
  friendAvatar: string | StaticImageData;
  action: string;
}

interface MovieType {
  id: number;
  title: string;
  imageSrc: string | StaticImageData;
  rating: number;
}

interface SuggestionType {
  id: number;
  title: string;
  imageSrc: string | StaticImageData;
  friend: string;
  friendAvatar: string | StaticImageData;
  note: string;
  date: string;
}

interface CategoryType {
  id: number;
  name: string;
  icon: string;
  count: number;
}

// Fallback banner data in case API fails
const fallbackBanners: BannerType[] = [
  {
    id: 1,
    title: "Captain America: The Winter Soldier",
    imageSrc: home1,
    alt: "Captain America movie",
  },
  {
    id: 2,
    title: "Avengers infinity War",
    imageSrc: home4,
    alt: "Avengers movie",
  },
  {
    id: 3,
    title: "Joker",
    imageSrc: home5,
    alt: "joker movie",
  },
]

const recentlyWatched: RecentlyWatchedType[] = [
  {
    id: 1,
    title: "Joker",
    imageSrc: home1,
    progress: 75,
  },
  {
    id: 2,
    title: "Stay the Night",
    imageSrc: home2,
    progress: 30,
    episode: "EP 2",
  },
]

const featuredPicks: MovieType[] = [
  {
    id: 1,
    title: "Split",
    imageSrc: home1,
    rating: 7.3,
  },
  {
    id: 2,
    title: "A River Runs Through It",
    imageSrc: home2,
    rating: 7.8,
  },
  {
    id: 3,
    title: "The Shallows",
    imageSrc: home3,
    rating: 6.3,
  },
  {
    id: 4,
    title: "Inception",
    imageSrc: home1,
    rating: 8.8,
  },
]

const receivedSuggestions: SuggestionType[] = [
  {
    id: 1,
    title: "The Dark Knight",
    imageSrc: home1,
    friend: "Jessica",
    friendAvatar: AvatarImg,
    note: "This is the best Batman movie ever made! You'll love it.",
    date: "Yesterday",
  },
  {
    id: 2,
    title: "Interstellar",
    imageSrc: home2,
    friend: "David",
    friendAvatar: AvatarImg,
    note: "Mind-bending sci-fi with amazing visuals.",
    date: "3 days ago",
  },
]

const categories: CategoryType[] = [
  { id: 1, name: "Comedy", icon: "😂", count: 245 },
  { id: 2, name: "Action", icon: "💥", count: 189 },
  { id: 3, name: "Thriller", icon: "😱", count: 156 },
  { id: 4, name: "Drama", icon: "🎭", count: 203 },
  { id: 5, name: "Sci-Fi", icon: "🚀", count: 132 },
]

export default function Home() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [showFilter, setShowFilter] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [banners, setBanners] = useState<BannerType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const SkeletonContinueWatching = () => (
    <div className="relative min-w-[160px] h-[180px] rounded-lg overflow-hidden">
      <Skeleton className="h-full w-full bg-[#292938]" />
      <div className="absolute bottom-8 left-2 right-2">
        <Skeleton className="h-4 w-24 bg-[#292938]/80 mb-1" />
      </div>
      <div className="absolute bottom-2 left-2 right-2">
        <Skeleton className="h-1 w-full bg-[#292938]/60 rounded-full" />
      </div>
    </div>
  )

  const SkeletonSuggestion = () => (
    <div className="bg-[#292938] rounded-lg w-full">
      <div className="flex p-3">
        <Skeleton className="w-20 h-28 rounded-lg bg-[#181826]" />
        <div className="ml-3 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="w-5 h-5 rounded-full bg-[#181826]" />
            <Skeleton className="h-3 w-24 bg-[#181826]" />
          </div>
          <Skeleton className="h-4 w-32 mb-2 bg-[#181826]" />
          <Skeleton className="h-16 w-full bg-[#181826] rounded-lg mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-full bg-[#181826]" />
            <Skeleton className="h-8 w-24 rounded-full bg-[#181826]" />
            <Skeleton className="h-8 w-8 rounded-full bg-[#181826] ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )

  const SkeletonMovie = () => (
    <div className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden">
      <Skeleton className="h-full w-full bg-[#292938]" />
      <div className="absolute bottom-2 left-2 right-2">
        <Skeleton className="h-4 w-24 bg-[#292938]/80 mb-1" />
      </div>
    </div>
  )

  const SkeletonCategory = () => (
    <div className="bg-[#292938] rounded-xl p-4 flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full bg-[#181826]" />
      <div>
        <Skeleton className="h-4 w-20 mb-1 bg-[#181826]" />
        <Skeleton className="h-3 w-16 bg-[#181826]" />
      </div>
    </div>
  )

  const SkeletonPeopleNearby = () => (
    <div className="bg-[#292938] rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            <Skeleton className="w-8 h-8 rounded-full bg-[#181826]" />
            <Skeleton className="w-8 h-8 rounded-full bg-[#181826]" />
            <Skeleton className="w-8 h-8 rounded-full bg-[#181826]" />
          </div>
          <div className="ml-2">
            <Skeleton className="h-4 w-24 mb-1 bg-[#181826]" />
            <Skeleton className="h-3 w-32 bg-[#181826]" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-full bg-[#181826]" />
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        <SkeletonMovie />
        <SkeletonMovie />
        <SkeletonMovie />
      </div>
    </div>
  )

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://suggesto.xyz/App/api.php?gofor=activebannerslist")

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`)
        }

        const data = await response.json()

        // Transform API data to match our banner format
        const formattedBanners: BannerType[] = data.map((banner: any) => ({
          id: banner.banner_id,
          title: banner.title,
          subtitle: banner.subtitle,
          imageSrc: banner.image_url,
          alt: banner.title,
          targetUrl: banner.target_url
        }))

        setBanners(formattedBanners)
      } catch (err) {
        console.error("Error fetching banners:", err)
        setError(err instanceof Error ? err.message : String(err))
        // Use fallback banners if API fails
        setBanners(fallbackBanners)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanners()
  }, [])

  const requestLocationPermission = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success callback
          // In a real app, you would send these coordinates to your backend
          console.log("Location access granted:", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })

          // Here you would fetch nearby trending movies based on location
          // For now we'll just show a success message
          alert("Location updated! Showing trending titles near you.")
        },
        (error) => {
          // Error callback
          console.error("Error getting location:", error)
          if (error.code === error.PERMISSION_DENIED) {
            alert("Please enable location services to see what people near you are watching.")
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  return (
    <div className="bg-[#181826] text-white min-h-screen mb-22">
      {/* Featured Movie */}
      <div className="relative mb-8 border-0">
        {/* Fixed header (outside Swiper) */}
        <div className="absolute top-3 left-3 right-3 z-20 flex justify-end items-center px-4">
          <div className="flex gap-4">
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
          </div>
        </div>

        {isLoading ? (
          <div className="h-[60vh] w-full flex items-center justify-center">
            <div className="w-full max-w-5xl px-4">
              <Skeleton className="h-[50vh] rounded-lg mb-4 bg-[#292938]" />
              <div className="flex justify-between items-center gap-4">
                <Skeleton className="h-6 w-1/2 bg-[#292938]" />
                <div className="flex gap-2">
                  <Skeleton className="h-2 w-6 rounded-full bg-[#292938]" />
                  <Skeleton className="h-2 w-2 rounded-full bg-[#292938]" />
                  <Skeleton className="h-2 w-2 rounded-full bg-[#292938]" />
                </div>
              </div>
            </div>
          </div>
        ) : error && banners.length === 0 ? (

          <div className="h-[60vh] w-full flex items-center justify-center bg-[#292938]">
            <div className="text-center">
              <p className="text-red-400 mb-2">Failed to load banners</p>
              <Button
                onClick={() => window.location.reload()}
                className="text-xs rounded-full h-8 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 5000 }}
            loop
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="h-[70vh] w-full border-0"
          >
            {banners.map((banner, index) => (
              <SwiperSlide key={banner.id}>
                <motion.div
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: activeIndex === index ? 1 : 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full rounded-lg shadow-xl mx-auto"
                  onClick={() => router.push(banner.targetUrl || `/movie-detail-page/${banner.id}`)}
                >
                  <Image
                    src={banner.imageSrc || "/placeholder.svg"}
                    alt={banner.alt}
                    fill
                    className="object-cover w-full h-full"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#181826]/40 via-[#181826]/60 to-[#181826]" />

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col z-20">
                    <div className="flex justify-between items-end w-full">
                      {/* Left section */}
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{banner.title}</h2>
                        {banner.subtitle && (
                          <p className="text-gray-300 text-sm mb-2">{banner.subtitle}</p>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-primary text-white text-xs px-1 rounded">HD</span>
                          <span className="text-gray-300 text-xs">120:00</span>
                          <span className="text-gray-300 text-xs">13+</span>
                        </div>
                      </div>

                      {/* Right section */}
                      <div className="flex gap-1">
                        {banners.map((_, dotIndex) => (
                          <div
                            key={dotIndex}
                            className={`rounded-full transition-all duration-300 h-2 ${activeIndex === dotIndex ? "w-6 bg-primary" : "w-2 bg-gray-600"}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Continue Watching */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Continue Watching</h2>
          <a href="#" className="text-sm text-primary">
            See All
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {isLoading ? (
            <>
              <SkeletonContinueWatching />
              <SkeletonContinueWatching />
            </>
          ) : (
            recentlyWatched.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.id * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative min-w-[160px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                onClick={() => router.push(`/watch/${item.id}`)}
              >
                <Image src={item.imageSrc || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                {item.episode && (
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs">
                    {item.episode}
                  </div>
                )}

                <div className="absolute bottom-8 left-2">
                  <h3 className="text-sm font-medium text-white">{item.title}</h3>
                </div>

                <div className="absolute bottom-2 left-2 right-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div className="bg-primary h-1 rounded-full" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Featured Suggesto Picks */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Featured Suggesto Picks</h2>
          </div>
          <a href="#" className="text-sm text-primary">
            See All
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {isLoading ? (
            <>
              <SkeletonMovie />
              <SkeletonMovie />
              <SkeletonMovie />
              <SkeletonMovie />
            </>
          ) : (
            featuredPicks.map((movie) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: movie.id * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                onClick={() => router.push(`/movie/${movie.id}`)}
              >
                <Image src={movie.imageSrc || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                  {movie.rating}
                </div>
                <div className="absolute bottom-2 left-2">
                  <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                </div>
              </motion.div>
            )))}
        </div>
      </div>

      {/* Your Watchlist */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Your Watchlist</h2>
          </div>
          <a href="#" className="text-sm text-primary">
            See All
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {isLoading ? (
            <>
              <SkeletonMovie />
              <SkeletonMovie />
              <SkeletonMovie />
              <SkeletonMovie />
            </>
          ) : (
            featuredPicks.map((movie) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: movie.id * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                onClick={() => router.push(`/movie/${movie.id}`)}
              >
                <Image src={movie.imageSrc || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
                  {movie.rating}
                </div>
                <div className="absolute bottom-2 left-2">
                  <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                </div>
              </motion.div>
            )))}
        </div>
      </div>

      {/* Suggestions from Friends */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Suggestions from Friends</h2>
          </div>
          <a href="#" className="text-sm text-primary hover:underline">
            See All
          </a>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {isLoading ? (
            <>
              <SkeletonSuggestion />
              <SkeletonSuggestion />
            </>
          ) : (
            receivedSuggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#292938] rounded-lg  w-full"
              >
                <div className="flex p-3">
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={suggestion.imageSrc || "/placeholder.svg"}
                      alt={suggestion.title || "Suggestion"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
                      <Avatar className="w-5 h-5">
                        <AvatarImage
                          src={
                            typeof suggestion.friendAvatar === "string"
                              ? suggestion.friendAvatar
                              : suggestion.friendAvatar?.src || "/placeholder.svg"
                          }
                          alt={suggestion.friend || "Friend"}
                        />
                        <AvatarFallback>{suggestion.friend?.[0] || "F"}</AvatarFallback>
                      </Avatar>
                      <span>{suggestion.friend} suggested</span>
                      <span className="text-gray-500">• {suggestion.date}</span>
                    </div>
                    <h3 className="font-medium mb-1 text-sm">{suggestion.title}</h3>
                    <p className="text-xs text-gray-400 bg-[#181826] p-2 rounded-lg mb-2">{suggestion.note}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="rounded-full text-xs h-8 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                        onClick={() => router.push("/movie-detail-page")}
                      >
                        Watch Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs h-8 px-3 border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white"
                      >
                        Add to List
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs h-8 w-8 p-0 border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white ml-auto"
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )))}
        </div>
      </div>

      {/* People Near You Watching */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#9370ff]" />
            <h2 className="text-lg font-semibold">People Near You Watching</h2>
          </div>
          <a href="#" className="text-sm text-[#9370ff]">
            See All
          </a>
        </div>

        {isLoading ? (
          <SkeletonPeopleNearby />
        ) : (
          <div className="bg-[#292938] rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="relative">
                  {/* Stacked avatars showing multiple nearby users */}
                  <div className="flex -space-x-2">
                    <Avatar className="border-2 border-[#181826] w-8 h-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-[#181826] w-8 h-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>U2</AvatarFallback>
                    </Avatar>
                    <Avatar className="border-2 border-[#181826] w-8 h-8">
                      <AvatarImage src="/placeholder.svg" alt="User" />
                      <AvatarFallback>U3</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium">12 people nearby</p>
                  <p className="text-xs text-gray-400">Within 5 miles of you</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs rounded-full h-8 border-gray-600 hover:bg-[#6c5ce7]/20"
                onClick={() => requestLocationPermission()}
              >
                Refresh
              </Button>
            </div>
                    
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {featuredPicks.slice(0, 3).map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: movie.id * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative min-w-[120px] h-[180px] rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  <Image src={movie.imageSrc || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute top-2 right-2 bg-[#6c5ce7] text-white text-xs px-1.5 py-0.5 rounded">
                    Trending
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
            
          </div>
            )}
      </div>

      {/* Categories */}
      <div className="px-4 ">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#9370ff]" />
            <h2 className="text-lg font-semibold">Categories</h2>
          </div>
          <a href="#" className="text-sm text-[#9370ff]">
            See All
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3">
                  {isLoading ? (
          <SkeletonCategory />
        ) : (
          categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-[#292938] rounded-xl p-4 flex items-center gap-3 cursor-pointer"
              onClick={() => router.push(`/category/${category.name.toLowerCase()}`)}
            >
              <div className="w-10 h-10 bg-[#6c5ce7]/20 rounded-full flex items-center justify-center text-xl">
                {category.icon}
              </div>
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-xs text-gray-400">{category.count} movies</p>
              </div>
            </motion.div>
          )))}
        </div>
      </div>

      <BottomNavigation currentPath={"/home"} />

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-xs bg-white/30 transition-all duration-300"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 w-full shadow-xl"
            >
              <FilterComponent onClick={() => setShowFilter(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}