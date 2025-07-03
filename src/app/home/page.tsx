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
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import ExitDialog from "@/components/exit-dialog"
import CoinAnimation from "@/components/coin-animation"

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
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isContentReady, setIsContentReady] = useState(false)
  const { user, setUser } = useUser()

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [allSectionsData, setAllSectionsData] = useState<React.ReactNode[]>([])
  const [visibleSections, setVisibleSections] = useState<React.ReactNode[]>([])
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [coinsEarned, setCoinsEarned] = useState(0)

  // Exit confirmation states
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const backPressCount = useRef(0)
  const backPressTimer = useRef<NodeJS.Timeout | null>(null)

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

  // Scroll detection for pagination
  const lastScrollTop = useRef(0)
  const scrollThreshold = 200 // Load more when 200px from bottom

  const PULL_THRESHOLD = 80
  const MAX_PULL = 120
  const LONG_PRESS_DURATION = 10
  const LONG_PRESS_MOVEMENT_THRESHOLD = 15
  const BACK_PRESS_TIMEOUT = 2000
  const SECTIONS_PER_PAGE = 3

  // Handle hardware back button
  const handleBackButton = useCallback(() => {
    backPressCount.current += 1

    if (backPressTimer.current) {
      clearTimeout(backPressTimer.current)
    }

    if (backPressCount.current === 1) {
      toast("Press back again to exit", {
        duration: 2000,
        icon: "⬅️",
        style: {
          background: '#333',
          color: '#fff',
        },
      })

      backPressTimer.current = setTimeout(() => {
        backPressCount.current = 0
      }, BACK_PRESS_TIMEOUT)
    } else if (backPressCount.current === 2) {
      backPressCount.current = 0
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current)
        backPressTimer.current = null
      }
      setShowExitConfirmation(true)
    }
  }, [])

  // Handle exit confirmation
  const handleExitConfirmation = useCallback(async (shouldExit: boolean) => {
    setShowExitConfirmation(false)

    if (shouldExit) {
      if (Capacitor.getPlatform() === 'android') {
        try {
          await App.exitApp()
        } catch (error) {
          console.error('Error exiting app:', error)
        }
      } else {
        toast("App cannot be closed programmatically on iOS", {
          duration: 3000,
          icon: "ℹ️",
          style: {
            background: '#333',
            color: '#fff',
          },
        })
      }
    }
  }, [])

  const fetchUserData = useCallback(async () => {
    const user_id = Cookies.get('userID');
    if (!user_id) return;

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${user_id}`)
      const data = await response.json()
      if (data && data.user_id) {
        // Get old coins from cookies
        const oldCoins = parseInt(Cookies.get('old_coins') || '0', 10);
        const newCoins = parseInt(data.coins || '0', 10);

        // Check if coins increased
        if (newCoins > oldCoins) {
          const earnedCoins = newCoins - oldCoins;
          setCoinsEarned(earnedCoins);
          setShowCoinAnimation(true);
        }

        // Update cookies with new coins value
        if (data.coins) {
          Cookies.set('old_coins', data.coins, { expires: 7 });
        }

        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }, [setUser])

  const fetchHomeData = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      const user_id = Cookies.get("userID")

      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gofor: "homepage",
          user_id: user_id,
          page: page,
          limit: SECTIONS_PER_PAGE
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }

      const data = await response.json()
      console.log(`Homepage data page ${page}:`, data)

      if (isRefresh || page === 1) {
        setUserData(data)
        setCurrentPage(1)
        setHasMoreData(true)
      } else {
        // Merge new data with existing data
        setUserData(prevData => {
          if (!prevData) return data

          const mergedData = { ...prevData }
          Object.keys(data).forEach(key => {
            if (Array.isArray(data[key]) && Array.isArray(prevData[key])) {
              mergedData[key] = [...prevData[key], ...data[key]]
            } else if (Array.isArray(data[key])) {
              mergedData[key] = data[key]
            }
          })
          return mergedData
        })
      }

      // Check if there's more data
      const hasData = Object.values(data).some(value =>
        Array.isArray(value) && value.length > 0
      )

      if (!hasData) {
        setHasMoreData(false)
      }

      setIsDataLoaded(true)
    } catch (err) {
      console.error("Error fetching homepage data:", err)
      toast.error(err instanceof Error ? err.message : String(err))
      setIsDataLoaded(true)
    }
  }, [])

  const loadMoreData = useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return

    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    await fetchHomeData(nextPage, false)
    setCurrentPage(nextPage)
    setIsLoadingMore(false)
  }, [currentPage, isLoadingMore, hasMoreData, fetchHomeData])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setCurrentPage(1)
    setHasMoreData(true)
    await Promise.all([fetchUserData(), fetchHomeData(1, true)])
    setIsRefreshing(false)
  }, [fetchUserData, fetchHomeData])

  // Detect scroll position for pagination
  const handleScrollForPagination = useCallback(() => {
    if (!containerRef.current || isLoadingMore || !hasMoreData) return

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current

    // Check if user scrolled down and is near bottom
    if (scrollTop > lastScrollTop.current) {
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      if (distanceFromBottom < scrollThreshold) {
        loadMoreData()
      }
    }

    lastScrollTop.current = scrollTop
  }, [isLoadingMore, hasMoreData, loadMoreData])

  // Build all sections from data
  const buildAllSections = useCallback(() => {
    if (!userData) return [];

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
  }, [userData, user, router]);

  // Update visible sections based on current page
  useEffect(() => {
    const sections = buildAllSections()
    setAllSectionsData(sections)

    // Initially show first half of sections
    const initialSectionsCount = Math.ceil(sections.length / 2)
    setVisibleSections(sections.slice(0, initialSectionsCount))
  }, [buildAllSections])

  // Load more sections when scrolling
  useEffect(() => {
    if (currentPage > 1) {
      const sectionsPerPage = Math.ceil(allSectionsData.length / 2)
      const endIndex = Math.min(sectionsPerPage * currentPage, allSectionsData.length)
      setVisibleSections(allSectionsData.slice(0, endIndex))

      // Update hasMoreData based on visible sections
      setHasMoreData(endIndex < allSectionsData.length)
    }
  }, [currentPage, allSectionsData])

  // Check when all content is ready to display
  useEffect(() => {
    if (isDataLoaded && !isContentReady) {
      const timer = setTimeout(() => {
        setIsContentReady(true)
        setTimeout(() => {
          setIsLoading(false)
        }, 300)
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [isDataLoaded, isContentReady])

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

    const carouselMidpoint = carouselRect.top + (carouselRect.height / 2)
    const pullZoneTop = headerRect.top
    const pullZoneBottom = carouselMidpoint
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
    return atTop && pullZoneVisible
  }, [checkIfAtTop, checkPullZoneVisibility])

  const isTouchInPullZone = useCallback((clientY: number) => {
    if (!headerRef.current || !movieCarouselRef.current) return false

    const headerRect = headerRef.current.getBoundingClientRect()
    const carouselRect = movieCarouselRef.current.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (!containerRect) return false

    const pullZoneTop = headerRect.top
    const carouselMidpoint = carouselRect.top + (carouselRect.height / 2)
    const pullZoneBottom = carouselMidpoint

    const touchInPullZone = clientY >= pullZoneTop && clientY <= pullZoneBottom
    const pullZoneVisible = pullZoneTop >= containerRect.top && pullZoneBottom <= containerRect.bottom

    return touchInPullZone && pullZoneVisible
  }, [])

  // All touch and mouse handlers remain the same as original...
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    resetPullStates()
    const canPullToRefresh = shouldAllowPullToRefresh()
    if (!canPullToRefresh || isRefreshing) return

    const touch = e.touches[0]
    const touchInPullZone = isTouchInPullZone(touch.clientY)

    if (touchInPullZone) {
      isTouchingPullZone.current = true
      startY.current = touch.clientY
      touchStartPosition.current = { x: touch.clientX, y: touch.clientY }
      touchStartTime.current = Date.now()
      hasLongPressed.current = false
      isLongPressActive.current = false

      longPressTimer.current = setTimeout(() => {
        if (isTouchingPullZone.current && !isDragging.current) {
          hasLongPressed.current = true
          isLongPressActive.current = true
          if (navigator.vibrate) {
            navigator.vibrate(50)
          }
        }
      }, LONG_PRESS_DURATION)
    }
  }, [isRefreshing, shouldAllowPullToRefresh, isTouchInPullZone, resetPullStates])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
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

    const deltaX = Math.abs(touch.clientX - touchStartPosition.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartPosition.current.y)
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

    const diff = currentY.current - startY.current

    if (diff > 0) {
      if (!isDragging.current) {
        isDragging.current = true
        hasStartedPull.current = true
      }

      e.preventDefault()
      const distance = Math.min(diff * 0.5, MAX_PULL)
      setPullDistance(distance)
      setIsPulling(distance > 20)
    } else {
      resetPullStates()
    }
  }, [isRefreshing, shouldAllowPullToRefresh, resetPullStates])

  const handleTouchEnd = useCallback(() => {
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

  // Mouse handlers (same logic as touch handlers)...
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    resetPullStates()
    const canPullToRefresh = shouldAllowPullToRefresh()
    if (!canPullToRefresh || isRefreshing) return

    const mouseInPullZone = isTouchInPullZone(e.clientY)
    if (mouseInPullZone) {
      isTouchingPullZone.current = true
      startY.current = e.clientY
      touchStartPosition.current = { x: e.clientX, y: e.clientY }
      touchStartTime.current = Date.now()
      hasLongPressed.current = false
      isLongPressActive.current = false

      longPressTimer.current = setTimeout(() => {
        if (isTouchingPullZone.current && !isDragging.current) {
          hasLongPressed.current = true
          isLongPressActive.current = true
        }
      }, LONG_PRESS_DURATION)
    }
  }, [isRefreshing, shouldAllowPullToRefresh, isTouchInPullZone, resetPullStates])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
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

    if (!hasLongPressed.current || !isLongPressActive.current) return

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
    handleScrollForPagination()

    const canContinuePull = shouldAllowPullToRefresh()
    if (!canContinuePull && (isPulling || isDragging.current)) {
      resetPullStates()
    }
  }, [checkIfAtTop, checkPullZoneVisibility, handleScrollForPagination, shouldAllowPullToRefresh, isPulling, resetPullStates])

  // Setup back button listener
  useEffect(() => {
    let backButtonListener: any = null

    const setupBackButtonListener = async () => {
      if (Capacitor.isNativePlatform()) {
        backButtonListener = await App.addListener('backButton', () => {
          handleBackButton()
        })
      }
    }

    setupBackButtonListener()

    return () => {
      if (backButtonListener) {
        backButtonListener.remove()
      }
      if (backPressTimer.current) {
        clearTimeout(backPressTimer.current)
      }
    }
  }, [handleBackButton])

  useEffect(() => {
    fetchHomeData(1, false)
    fetchUserData()
  }, [fetchHomeData])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // Global mouse event listeners (same as original)...
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

      if (!hasLongPressed.current || !isLongPressActive.current) return

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

  // Show loading skeleton until everything is ready
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <LoadingSkeleton />
      </div>
    )
  }

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
          touchAction: shouldAllowPullToRefresh() && isDragging.current ? 'none' : 'auto',
          opacity: isContentReady ? 1 : 0,
          transition: isDragging.current
            ? 'none'
            : isContentReady
              ? 'transform 0.3s ease-out, opacity 0.3s ease-in-out'
              : 'transform 0.3s ease-out'
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

        <div ref={movieCarouselRef}>
          <MovieCarousel />
        </div>
        {renderAllSections()}
      </div>

      {/* Exit Confirmation Modal */}
      <ExitDialog
        isOpen={showExitConfirmation}
        onCancel={() => handleExitConfirmation(false)}
        onConfirm={() => handleExitConfirmation(true)} />

      <CoinAnimation
        show={showCoinAnimation}
        coinsEarned={coinsEarned}
        message="Coins Earned!"
        onAnimationEnd={() => setShowCoinAnimation(false)}
        duration={3000}
      />


      <BottomNavigation currentPath="/home" />
    </>
  )
}