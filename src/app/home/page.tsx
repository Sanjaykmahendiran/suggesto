"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
import GenresSection from "@/components/home-section/genres-section"
import toast from "react-hot-toast"
import LoadingSkeleton from "./_components/loadingskeleton"
import MoodsSection from "@/components/home-section/moods-section"
import PollCard from "@/components/home-section/poll-section"
import Top10Wall from "@/components/home-section/top10wall-section"

type HomeData = {
  recentSuggestions?: any[];
  longtimeWatchlist?: any[];
  trendingThisWeek?: any[];
  popularAmongFriends?: any[];
  aiRandomizer?: any[];
  mysteryweekendpick?: any[];
  [key: string]: any;
};

const camelCaseToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const getSectionType = (key: string): string => {
  if (key.toLowerCase().includes('watchlist')) return 'watchlist';
  if (key.toLowerCase().includes('trending')) return 'trending';
  if (key.toLowerCase().includes('popular')) return 'popular';
  if (key.toLowerCase().includes('ai') || key.toLowerCase().includes('recommend')) return 'ai';
  if (key.toLowerCase().includes('mystery')) return 'mystery';
  return 'default';
};

export default function HomePage() {
  const router = useRouter()
  const [userData, setUserData] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, setUser } = useUser()

  // Pull-to-refresh states
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const movieCarouselRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isDragging = useRef(false)
  const isAtTop = useRef(true)
  const hasStartedPull = useRef(false)
  const isInPullZone = useRef(true)

  // Long press specific refs
  const touchStartTime = useRef(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const hasLongPressed = useRef(false)
  const isLongPressActive = useRef(false)
  const touchStartPosition = useRef({ x: 0, y: 0 })
  const isTouchingPullZone = useRef(false)

  const PULL_THRESHOLD = 80
  const MAX_PULL = 120
  const LONG_PRESS_DURATION = 10 // 100ms for long press
  const LONG_PRESS_MOVEMENT_THRESHOLD = 15 // Allow small movement during long press

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
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await Promise.all([fetchUserData(), fetchHomeData()])
    setIsRefreshing(false)
  }, [fetchUserData, fetchHomeData])

  const checkIfAtTop = useCallback(() => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop
      isAtTop.current = scrollTop <= 0
      return isAtTop.current
    }
    return false
  }, [])

  const checkPullZoneVisibility = useCallback(() => {
    if (!headerRef.current || !movieCarouselRef.current || !containerRef.current) return false

    const headerRect = headerRef.current.getBoundingClientRect()
    const carouselRect = movieCarouselRef.current.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()

    // Calculate the midpoint of the MovieCarousel
    const carouselMidpoint = carouselRect.top + (carouselRect.height / 2)

    // Pull zone is from top of header to midpoint of carousel
    const pullZoneTop = headerRect.top
    const pullZoneBottom = carouselMidpoint

    // Check if pull zone is visible
    const pullZoneVisible = pullZoneTop >= containerRect.top && pullZoneBottom <= containerRect.bottom

    isInPullZone.current = pullZoneVisible
    return pullZoneVisible
  }, [])

  const resetPullStates = useCallback(() => {
    setPullDistance(0)
    setIsPulling(false)
    isDragging.current = false
    hasStartedPull.current = false
    hasLongPressed.current = false
    isLongPressActive.current = false
    isTouchingPullZone.current = false
    touchStartTime.current = 0

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const shouldAllowPullToRefresh = useCallback(() => {
    const atTop = checkIfAtTop()
    const pullZoneVisible = checkPullZoneVisibility()

    // Allow if at top AND pull zone is visible
    return atTop && pullZoneVisible
  }, [checkIfAtTop, checkPullZoneVisibility])

  // Check if touch is within pull zone (header + half of carousel)
  const isTouchInPullZone = useCallback((clientY: number) => {
    if (!headerRef.current || !movieCarouselRef.current) return false

    const headerRect = headerRef.current.getBoundingClientRect()
    const carouselRect = movieCarouselRef.current.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (!containerRect) return false

    // Calculate pull zone bounds
    const pullZoneTop = headerRect.top
    const carouselMidpoint = carouselRect.top + (carouselRect.height / 2)
    const pullZoneBottom = carouselMidpoint

    // Check if touch is within pull zone AND zone is visible
    const touchInPullZone = clientY >= pullZoneTop && clientY <= pullZoneBottom
    const pullZoneVisible = pullZoneTop >= containerRect.top && pullZoneBottom <= containerRect.bottom

    return touchInPullZone && pullZoneVisible
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Reset states first
    resetPullStates()

    const canPullToRefresh = shouldAllowPullToRefresh()

    if (!canPullToRefresh || isRefreshing) {
      return
    }

    const touch = e.touches[0]
    const touchInPullZone = isTouchInPullZone(touch.clientY)

    // ONLY proceed if touch is specifically in pull zone area
    if (touchInPullZone) {
      isTouchingPullZone.current = true
      startY.current = touch.clientY
      touchStartPosition.current = { x: touch.clientX, y: touch.clientY }
      touchStartTime.current = Date.now()
      hasLongPressed.current = false
      isLongPressActive.current = false

      // Start long press timer
      longPressTimer.current = setTimeout(() => {
        if (isTouchingPullZone.current && !isDragging.current) {
          hasLongPressed.current = true
          isLongPressActive.current = true
          // Optional: Add haptic feedback or visual indication
          if (navigator.vibrate) {
            navigator.vibrate(50)
          }
        }
      }, LONG_PRESS_DURATION)
    }
  }, [isRefreshing, shouldAllowPullToRefresh, isTouchInPullZone, resetPullStates])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // If not touching pull zone, immediately reset and return
    if (!isTouchingPullZone.current) {
      resetPullStates()
      return
    }

    const canStillPullToRefresh = shouldAllowPullToRefresh()
    if (!canStillPullToRefresh || isRefreshing) {
      resetPullStates()
      return
    }

    const touch = e.touches[0]
    currentY.current = touch.clientY

    // Check if moved too much during long press detection
    const deltaX = Math.abs(touch.clientX - touchStartPosition.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartPosition.current.y)
    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // If moved too much before long press completes, cancel long press
    if (!hasLongPressed.current && totalMovement > LONG_PRESS_MOVEMENT_THRESHOLD) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      resetPullStates()
      return
    }

    // Only proceed with pull-to-refresh if long press was completed
    if (!hasLongPressed.current || !isLongPressActive.current) {
      return
    }

    const diff = currentY.current - startY.current

    if (diff > 0) {
      // Pulling down after long press
      if (!isDragging.current) {
        isDragging.current = true
        hasStartedPull.current = true
      }

      e.preventDefault()
      const distance = Math.min(diff * 0.5, MAX_PULL)
      setPullDistance(distance)
      setIsPulling(distance > 20)
    } else {
      // Pulling up - reset states
      resetPullStates()
    }
  }, [isRefreshing, shouldAllowPullToRefresh, resetPullStates])

  const handleTouchEnd = useCallback(() => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    if (!isDragging.current || !hasStartedPull.current || !hasLongPressed.current || !isTouchingPullZone.current) {
      resetPullStates()
      return
    }

    const canTriggerRefresh = shouldAllowPullToRefresh()
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing && canTriggerRefresh && hasStartedPull.current) {
      handleRefresh()
    }

    setTimeout(() => {
      resetPullStates()
    }, 100)
  }, [pullDistance, isRefreshing, handleRefresh, resetPullStates, shouldAllowPullToRefresh])

  // Mouse event handlers for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    resetPullStates()

    const canPullToRefresh = shouldAllowPullToRefresh()

    if (!canPullToRefresh || isRefreshing) {
      return
    }

    const mouseInPullZone = isTouchInPullZone(e.clientY)

    if (mouseInPullZone) {
      isTouchingPullZone.current = true
      startY.current = e.clientY
      touchStartPosition.current = { x: e.clientX, y: e.clientY }
      touchStartTime.current = Date.now()
      hasLongPressed.current = false
      isLongPressActive.current = false

      // Start long press timer for mouse
      longPressTimer.current = setTimeout(() => {
        if (isTouchingPullZone.current && !isDragging.current) {
          hasLongPressed.current = true
          isLongPressActive.current = true
        }
      }, LONG_PRESS_DURATION)
    }
  }, [isRefreshing, shouldAllowPullToRefresh, isTouchInPullZone, resetPullStates])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isTouchingPullZone.current || isRefreshing) {
      return
    }

    const canStillPullToRefresh = shouldAllowPullToRefresh()
    if (!canStillPullToRefresh) {
      resetPullStates()
      return
    }

    // Check movement during long press detection
    const deltaX = Math.abs(e.clientX - touchStartPosition.current.x)
    const deltaY = Math.abs(e.clientY - touchStartPosition.current.y)
    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (!hasLongPressed.current && totalMovement > LONG_PRESS_MOVEMENT_THRESHOLD) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      resetPullStates()
      return
    }

    if (!hasLongPressed.current || !isLongPressActive.current) {
      return
    }

    // Only allow dragging if we started in pull zone
    if (!isDragging.current && hasLongPressed.current) {
      isDragging.current = true
      hasStartedPull.current = true
    }

    currentY.current = e.clientY
    const diff = currentY.current - startY.current

    if (diff > 0) {
      e.preventDefault()
      const distance = Math.min(diff * 0.5, MAX_PULL)
      setPullDistance(distance)
      setIsPulling(distance > 20)
    } else {
      resetPullStates()
    }
  }, [isRefreshing, shouldAllowPullToRefresh, resetPullStates])

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    if (!isDragging.current || !hasStartedPull.current || !hasLongPressed.current || !isTouchingPullZone.current) {
      resetPullStates()
      return
    }

    const canTriggerRefresh = shouldAllowPullToRefresh()
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing && canTriggerRefresh && hasStartedPull.current) {
      handleRefresh()
    }

    setTimeout(() => {
      resetPullStates()
    }, 100)
  }, [pullDistance, isRefreshing, handleRefresh, resetPullStates, shouldAllowPullToRefresh])

  const handleScroll = useCallback(() => {
    checkIfAtTop()
    checkPullZoneVisibility()

    // If not at top or pull zone not visible, cancel any ongoing pull
    const canContinuePull = shouldAllowPullToRefresh()
    if (!canContinuePull && (isPulling || isDragging.current)) {
      resetPullStates()
    }
  }, [checkIfAtTop, checkPullZoneVisibility, shouldAllowPullToRefresh, isPulling, resetPullStates])

  useEffect(() => {
    fetchHomeData()
    fetchUserData()
  }, [fetchHomeData])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isTouchingPullZone.current || isRefreshing) return

      const canStillPullToRefresh = shouldAllowPullToRefresh()
      if (!canStillPullToRefresh) {
        resetPullStates()
        return
      }

      const deltaX = Math.abs(e.clientX - touchStartPosition.current.x)
      const deltaY = Math.abs(e.clientY - touchStartPosition.current.y)
      const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (!hasLongPressed.current && totalMovement > LONG_PRESS_MOVEMENT_THRESHOLD) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
        resetPullStates()
        return
      }

      if (!hasLongPressed.current || !isLongPressActive.current) {
        return
      }

      if (!isDragging.current && hasLongPressed.current) {
        isDragging.current = true
        hasStartedPull.current = true
      }

      currentY.current = e.clientY
      const diff = currentY.current - startY.current

      if (diff > 0) {
        const distance = Math.min(diff * 0.5, MAX_PULL)
        setPullDistance(distance)
        setIsPulling(distance > 20)
      } else {
        resetPullStates()
      }
    }

    const handleGlobalMouseUp = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }

      if (!isDragging.current || !hasStartedPull.current || !hasLongPressed.current || !isTouchingPullZone.current) {
        resetPullStates()
        return
      }

      const canTriggerRefresh = shouldAllowPullToRefresh()
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing && canTriggerRefresh && hasStartedPull.current) {
        handleRefresh()
      }

      setTimeout(() => {
        resetPullStates()
      }, 100)
    }

    if (isTouchingPullZone.current) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [pullDistance, isRefreshing, handleRefresh, resetPullStates, shouldAllowPullToRefresh])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const renderAllSections = () => {
    if (!userData) return null;

    const allSections: React.ReactNode[] = [];
    let mysteryWeekendData: any[] | undefined;

    Object.keys(userData).forEach((key) => {
      const sectionData = userData[key];

      if (!Array.isArray(sectionData) || sectionData.length === 0) {
        return;
      }

      if (key === 'mysteryweekendpick') {
        mysteryWeekendData = sectionData;
        return;
      }

      if (key === 'recentSuggestions') {
        allSections.push(
          <SuggestionsSection
            key={key}
            suggestions={sectionData}
            title="Recent Suggestions"
          />
        );
      } else if (key === 'popularAmongFriends') {
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
        allSections.push(<ShareSuggestionCard key="share" />);

        allSections.push(
          <AiRandomizerSection
            key={key}
            movies={sectionData}
            title="AI Recommendations"
            sectionKey={key} />
        );
      } else {
        const title = camelCaseToTitle(key);
        const sectionType = getSectionType(key);

        allSections.push(
          <DynamicMovieSection
            key={key}
            movies={sectionData}
            title={title}
            sectionType={sectionType}
            sectionKey={key}
          />
        );
      }
    });

    const finalSections: React.ReactNode[] = [];

    finalSections.push(
      <NotificationsCard
        notificationCount={user?.not_count ?? 0}
        key="notifications"
      />
    );

    finalSections.push(<MoodsSection key="moods" />);

    if (allSections.length > 0) {
      finalSections.push(allSections[0]);
    }

    finalSections.push(<GenresSection key="genres" />);

    if (allSections.length > 1) {
      finalSections.push(allSections[1]);
    }

    finalSections.push(<PollCard key="poll" />);

    if (allSections.length > 2) {
      for (let i = 2; i < allSections.length - 1; i++) {
        finalSections.push(allSections[i]);
      }

      finalSections.push(<Top10Wall key="top10wall" />);
      finalSections.push(allSections[allSections.length - 1]);
    } else {
      finalSections.push(<Top10Wall key="top10wall" />);
    }

    if (mysteryWeekendData && mysteryWeekendData.length > 0) {
      const centerIndex = Math.floor(finalSections.length / 2);
      finalSections.splice(centerIndex, 0,
        <MysteryWeekendPicks
          key="mysteryweekendpick"
          movies={mysteryWeekendData}
          title="Mystery Weekend Picks"
        />
      );
    }

    return finalSections;
  };

  return (
    <>
      <div
        ref={containerRef}
        className="text-white min-h-screen mb-22 overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease-out',
          touchAction: shouldAllowPullToRefresh() && isDragging.current ? 'none' : 'auto'
        }}
      >
        <PullToRefreshIndicator
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          isDragging={isDragging.current}
          pullThreshold={PULL_THRESHOLD}
        />

        <div ref={headerRef}>
          <Header />
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div ref={movieCarouselRef}>
              <MovieCarousel />
            </div>
            {renderAllSections()}
          </>
        )}
      </div>
      <BottomNavigation currentPath="/home" />
    </>
  )
}