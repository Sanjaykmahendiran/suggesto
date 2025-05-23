"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { BottomNavigation } from "@/components/bottom-navigation"
import { MovieCarousel } from "@/components/home-section/moviecarousel"
import { WatchlistSection } from "@/components/home-section/watchlist-section"
import { TrendingSection } from "@/components/home-section/trending-section"
import { SuggestionsSection } from "@/components/home-section/suggestions-section"
import { ClassicHitsSection } from "@/components/home-section/classic-hits-section"
import { PopularWithFriendsSection } from "@/components/home-section/popular-friends-section"
import { AiRandomizerSection } from "@/components/home-section/ai-randomizer-section"
import Cookies from "js-cookie"

type HomeData = {
  recentSuggestions?: any[];
  longtimeWatchlist?: any[];
  trendingThisWeek?: any[];
  classicHits?: any[];
  popularAmongFriends?: any[];
  aiRandomizer?: any[];
  // Add more fields as needed
};

export default function HomePage() {
  const [userData, setUserData] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  type User = {
    name?: string;
    imgname?: string;
    user_id?: string;
    // Add other user fields as needed
  };
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const user_id = Cookies.get('userID');
    if (!user_id) return;

    fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${user_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user_id) {
          setUser(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true)
        const user_id = Cookies.get("userID")

        const response = await fetch("https://suggesto.xyz/App/api.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gofor: "homepage",
            user_id: user_id
          }),
        })

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`)
        }

        const data = await response.json()
        console.log("Homepage data:", data)
        setUserData(data)
      } catch (err) {
        console.error("Error fetching homepage data:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  return (
    <div className=" text-white min-h-screen mb-22">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-white font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-sm font-semibold">Hello {user?.name || 'User'}</h1>
            <p className="text-xs text-gray-400">Suggest your favourite movie</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={user?.imgname || '/placeholder.svg?height=32&width=32'}
            alt="Profile"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <>
          {/* Movie Carousel - Always show with banners */}
          <MovieCarousel />

          {/* Longtime Watchlist */}
          {(userData?.longtimeWatchlist?.length ?? 0) > 0 && (
            <WatchlistSection
              movies={userData?.longtimeWatchlist ?? []}
              title="Your Watchlist"
            />
          )}

          {/* Recent Suggestions */}
          {(userData?.recentSuggestions?.length ?? 0) > 0 && (
            <SuggestionsSection
              suggestions={userData?.recentSuggestions ?? []}
              title="Recent Suggestions"
            />
          )}

          {/* Trending This Week */}
          {(userData?.trendingThisWeek?.length ?? 0) > 0 && (
            <TrendingSection
              movies={userData?.trendingThisWeek ?? []}
              title="Trending This Week"
            />
          )}

          {/* Classic Hits */}
          {(userData?.classicHits?.length ?? 0) > 0 && (
            <ClassicHitsSection
              movies={userData?.classicHits ?? []}
              title="Classic Hits"
            />
          )}

          {/* Popular Among Friends */}
          {(userData?.popularAmongFriends?.length ?? 0) > 0 && (
            <PopularWithFriendsSection
              movies={userData?.popularAmongFriends ?? []}
              title="Popular Among Friends"
            />
          )}

          {/* AI Randomizer */}
          {(userData?.aiRandomizer?.length ?? 0) > 0 && (
            <AiRandomizerSection
              movies={userData?.aiRandomizer ?? []}
              title="AI Recommendations"
            />
          )}
        </>
      )}

      <BottomNavigation currentPath="/home" />
    </div>
  )
}

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="px-4">
    {/* Movie Carousel Skeleton */}
    <div className="h-[400px] w-full flex items-center justify-center mb-8">
      <Skeleton className="h-[400px] rounded-lg bg-[#292938]" />
    </div>

    {/* Section Skeletons */}
    {[1, 2, 3].map((section) => (
      <div key={section} className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40 bg-[#292938]" />
          <Skeleton className="h-4 w-16 bg-[#292938]" />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="min-w-[120px] h-[180px] rounded-lg bg-[#292938]" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

// Error Display Component
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="px-4 py-8">
    <div className="bg-[#292938] rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Content</h3>
      <p className="text-sm text-gray-300 mb-4">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Retry
      </button>
    </div>
  </div>
)