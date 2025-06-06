"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { BottomNavigation } from "@/components/bottom-navigation"
import { MovieCarousel } from "@/components/home-section/moviecarousel"
import { SuggestionsSection } from "@/components/home-section/suggestions-section"
import { PopularWithFriendsSection } from "@/components/home-section/popular-friends-section"
import { AiRandomizerSection } from "@/components/home-section/ai-randomizer-section"
import { DynamicMovieSection } from "@/components/home-section/dynamic-movie-section"
import { MysteryWeekendPicks } from "@/components/home-section/mystery-picks"
import Cookies from "js-cookie"
import Header from "@/components/header"
import PullToRefreshIndicator from "@/components/pull-to-refresh"
import { useUser } from "@/contexts/UserContext"
import ShareSuggestionCard from "@/components/home-section/share-suggestion-card"
import NotificationsCard from "@/components/home-section/notifications-card"
import Image from 'next/image';
import premiumImage from "@/assets/Premium-content.png"
import { useRouter } from "next/navigation"
import { PageTransitionWrapper } from "@/components/PageTransition"
import React from "react"

type HomeData = {
  recentSuggestions?: any[];
  longtimeWatchlist?: any[];
  trendingThisWeek?: any[];
  // classicHits?: any[];
  popularAmongFriends?: any[];
  aiRandomizer?: any[];
  mysteryweekendpick?: any[];
  [key: string]: any;
};

// Function to convert camelCase to Title Case
const camelCaseToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Function to determine section type from key name
const getSectionType = (key: string): string => {
  if (key.toLowerCase().includes('watchlist')) return 'watchlist';
  if (key.toLowerCase().includes('trending')) return 'trending';
  // if (key.toLowerCase().includes('classic')) return 'classic';
  if (key.toLowerCase().includes('popular')) return 'popular';
  if (key.toLowerCase().includes('ai') || key.toLowerCase().includes('recommend')) return 'ai';
  if (key.toLowerCase().includes('mystery')) return 'mystery';
  return 'default';
};

// Function to shuffle array
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function HomePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, setUser } = useUser()

  // Pull-to-refresh states
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isDragging = useRef(false)

  const PULL_THRESHOLD = 80 // Distance needed to trigger refresh
  const MAX_PULL = 120 // Maximum pull distance

  const fetchUserData = useCallback(async () => {
    const user_id = Cookies.get('userID');
    if (!user_id) return;

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${user_id}`)
      const data = await response.json()
      if (data && data.user_id) {
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }, [])

  const fetchHomeData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
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
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([fetchUserData(), fetchHomeData()])
    setIsRefreshing(false)
  }, [fetchUserData, fetchHomeData])

  // Touch event handlers for pull-to-refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      isDragging.current = true
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || containerRef.current?.scrollTop !== 0) return

    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current

    if (diff > 0) {
      e.preventDefault()
      const distance = Math.min(diff * 0.5, MAX_PULL)
      setPullDistance(distance)
      setIsPulling(distance > 20)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return

    isDragging.current = false

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      handleRefresh()
    }

    // Reset pull state
    setPullDistance(0)
    setIsPulling(false)
  }, [pullDistance, isRefreshing, handleRefresh])

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.clientY
      isDragging.current = true
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || containerRef.current?.scrollTop !== 0) return

    currentY.current = e.clientY
    const diff = currentY.current - startY.current

    if (diff > 0) {
      e.preventDefault()
      const distance = Math.min(diff * 0.5, MAX_PULL)
      setPullDistance(distance)
      setIsPulling(distance > 20)
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return

    isDragging.current = false

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      handleRefresh()
    }

    setPullDistance(0)
    setIsPulling(false)
  }, [pullDistance, isRefreshing, handleRefresh])

  useEffect(() => {
    fetchHomeData()
    fetchUserData()
  }, [fetchHomeData])

  // Add mouse event listeners for desktop
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      currentY.current = e.clientY
      const diff = currentY.current - startY.current

      if (diff > 0 && containerRef.current?.scrollTop === 0) {
        const distance = Math.min(diff * 0.5, MAX_PULL)
        setPullDistance(distance)
        setIsPulling(distance > 20)
      }
    }

    const handleGlobalMouseUp = () => {
      if (!isDragging.current) return

      isDragging.current = false

      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        handleRefresh()
      }

      setPullDistance(0)
      setIsPulling(false)
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [pullDistance, isRefreshing, handleRefresh])

  // Function to render all sections with special sections in specific positions
  const renderAllSections = () => {
    if (!userData) return null;

    const allSections: React.ReactNode[] = [];
    let mysteryWeekendData: any[] | undefined;

    // First pass: collect all sections except mysteryweekendpick
    Object.keys(userData).forEach((key) => {
      const sectionData = userData[key];

      // Skip if not an array or empty
      if (!Array.isArray(sectionData) || sectionData.length === 0) {
        return;
      }

      // Store mystery weekend data for later positioning but don't add it to sections yet
      if (key === 'mysteryweekendpick') {
        mysteryWeekendData = sectionData;
        return;
      }

      // Handle standard sections with their specific components
      if (key === 'recentSuggestions') {
        allSections.push(
          <SuggestionsSection
            key={key}
            suggestions={sectionData}
            title="Recent Suggestions"
          />
        );
      } else if (key === 'popularAmongFriends') {
        // Add premium section before PopularWithFriendsSection
        allSections.push(
          <div
            key="premium"
            onClick={() => router.push('/premium')}
            className="w-full h-[200px] relative mb-8">
            <Image
              src={premiumImage}
              alt="Bell"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-full object-contain"
            />
          </div>
        );

        allSections.push(
          <PopularWithFriendsSection
            key={key}
            movies={sectionData}
            title="Popular Among Friends"
          />
        );
      } else if (key === 'aiRandomizer') {
        // Add ShareSuggestionCard before AiRandomizerSection
        allSections.push(<ShareSuggestionCard key="share" />);

        allSections.push(
          <AiRandomizerSection
            key={key}
            movies={sectionData}
            title="AI Recommendations"
          />
        );
      } else {
        // All other sections are rendered as dynamic movie sections
        const title = camelCaseToTitle(key);
        const sectionType = getSectionType(key);

        allSections.push(
          <DynamicMovieSection
            key={key}
            movies={sectionData}
            title={title}
            sectionType={sectionType}
          />
        );
      }
    });

    // Insert NotificationsCard after the first section
    if (allSections.length > 0) {
      allSections.splice(1, 0, <NotificationsCard key="notifications" />);
    }

    // Insert MysteryWeekendPicks in the center of all sections
    if (mysteryWeekendData && mysteryWeekendData.length > 0) {
      const centerIndex = Math.floor(allSections.length / 2);
      allSections.splice(centerIndex, 0,
        <MysteryWeekendPicks
          key="mysteryweekendpick"
          movies={mysteryWeekendData}
          title="Mystery Weekend Picks"
        />
      );
    }

    return allSections;
  };

  return (
    // <PageTransitionWrapper>
    <>
      {/* // <PageTransitionWrapper> */}
      <div
        ref={containerRef}
        className="text-white min-h-screen mb-22"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Header */}
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          isDragging={isDragging.current}
          pullThreshold={PULL_THRESHOLD} />

        <Header />

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorDisplay error={error} onRetry={handleRefresh} />
        ) : (
          <>
            {/* Movie Carousel - Always show with banners */}
            <MovieCarousel />

            {/* All Sections - Dynamically rendered with positioned special sections */}
            {renderAllSections()}
          </>
        )}

      </div><BottomNavigation currentPath="/home" />
      </>
    // </PageTransitionWrapper>
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
const ErrorDisplay = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="px-4 py-8">
    <div className="bg-[#292938] rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Content</h3>
      <p className="text-sm text-gray-300 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Retry
      </button>
    </div>
  </div>
)