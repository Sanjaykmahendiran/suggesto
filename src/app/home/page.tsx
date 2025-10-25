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
import React from "react"
import GenresSection from "@/components/home-section/genres-section"
import toast from "react-hot-toast"
import LoadingSkeleton from "./_components/loadingskeleton"
import MoodsSection from "@/components/home-section/moods-section"
import PollCard from "@/components/home-section/poll-section"
import Top10Wall from "@/components/home-section/top10wall-section"
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import ExitDialog from "@/components/exit-app-dialog"
import CoinAnimation from "@/components/coin-animation"
import { useTourIntegration } from "@/hooks/useTourIntegration"
import RewardSection from "../profile/_components/reward-points-card"

// Define data structure
type HomeData = {
  activebanners?: any[];
  recentSuggestions?: any[];
  homemoods?: any[];
  homegenres?: any[];
  longtimeWatchlist?: any[];
  trendingThisWeek?: any[];
  topRated?: any[];
  popularAmongFriends?: any[];
  PeopleNearWatching?: any[];
  aiRandomizer?: any[];
  mysteryweekendpick?: any[];
  classicHits?: any[];
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
  const { user, setUser } = useUser()

  // Core states
  const [section1Data, setSection1Data] = useState<HomeData | null>(null)
  const [section2Data, setSection2Data] = useState<HomeData | null>(null)
  const [section3Data, setSection3Data] = useState<HomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [section2Loading, setSection2Loading] = useState(false)
  const [section3Loading, setSection3Loading] = useState(false)
  const [section2Loaded, setSection2Loaded] = useState(false)
  const [section3Loaded, setSection3Loaded] = useState(false)
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

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const movieCarouselRef = useRef<HTMLDivElement>(null)
  const section1EndRef = useRef<HTMLDivElement>(null)
  const section2EndRef = useRef<HTMLDivElement>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  // Pull to refresh refs
  const startY = useRef(0)
  const isDragging = useRef(false)
  const isAtTop = useRef(true)
  const lastTouchY = useRef(0)

  const scrollVelocity = useRef(0)
  const lastScrollTime = useRef(0)
  const touchStartTime = useRef(0)
  // Constants
  const PULL_THRESHOLD = 80
  const MAX_PULL = 120
  const BACK_PRESS_TIMEOUT = 2000

  useTourIntegration('home', [section1Data], !!section1Data && !isLoading)

  // Fetch individual section data
  const fetchSectionData = useCallback(async (section: number) => {
    try {
      const user_id = Cookies.get("userID");
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=homepage&user_id=${user_id}&section=${section}`);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status} for section ${section}`);
      }

      const data = await response.json();
      console.log(`Section ${section} data loaded:`, data);
      return data;
    } catch (err) {
      console.error(`Error fetching section ${section} data:`, err);
      return null;
    }
  }, []);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    const user_id = Cookies.get('userID');
    if (!user_id) return;

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${user_id}`);
      const data = await response.json();

      if (data && data.user_id) {
        const oldCoins = parseInt(Cookies.get('old_coins') || '0', 10);
        const newCoins = parseInt(data.coins || '0', 10);
        const today = new Date().toISOString().split('T')[0];
        const lastShownDate = Cookies.get('coin_animation_date');

        if (newCoins > oldCoins && lastShownDate !== today) {
          const earnedCoins = newCoins - oldCoins;
          setCoinsEarned(earnedCoins);
          setShowCoinAnimation(true);
          Cookies.set('coin_animation_date', today);
        }

        Cookies.set('old_coins', newCoins.toString());
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [setUser]);

  // Handle back button
  const handleBackButton = useCallback(() => {
    backPressCount.current += 1

    if (backPressTimer.current) {
      clearTimeout(backPressTimer.current)
    }

    if (backPressCount.current === 1) {
      toast("Press back again to exit", {
        duration: 2000,
        icon: "⬅️",
        style: { background: '#333', color: '#fff' },
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
          style: { background: '#333', color: '#fff' },
        })
      }
    }
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setSection2Loaded(false)
    setSection3Loaded(false)
    setSection2Loading(false)
    setSection3Loading(false)
    setSection2Data(null)
    setSection3Data(null)

    try {
      await Promise.all([
        fetchUserData(),
        fetchSectionData(1).then(data => setSection1Data(data))
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    }

    setIsRefreshing(false)
  }, [fetchUserData, fetchSectionData])

  // Check if at top for pull to refresh
  const checkIfAtTop = useCallback(() => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop
      // More strict top detection - only consider truly at top
      isAtTop.current = scrollTop === 0
      return isAtTop.current
    }
    return false
  }, [])

  // Pull to refresh handlers - Fixed implementation
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    startY.current = touch.clientY
    lastTouchY.current = touch.clientY
    touchStartTime.current = Date.now()

    // Only initialize pull-to-refresh if truly at top
    if (checkIfAtTop() && !isRefreshing) {
      isDragging.current = false
      setPullDistance(0)
      setIsPulling(false)
    }
  }, [isRefreshing, checkIfAtTop])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    const currentY = touch.clientY
    const deltaY = currentY - startY.current
    const deltaTime = Date.now() - touchStartTime.current

    // Calculate scroll velocity for better gesture detection
    const velocity = Math.abs(currentY - lastTouchY.current) / Math.max(deltaTime - lastScrollTime.current, 1)
    scrollVelocity.current = velocity
    lastScrollTime.current = Date.now()

    // Only handle pull-to-refresh under very specific conditions
    const shouldHandlePull = (
      isAtTop.current &&
      !isRefreshing &&
      deltaY > 15 && // Minimum pull distance to start
      currentY > lastTouchY.current && // Moving downward
      velocity < 2 && // Not a fast scroll gesture
      containerRef.current &&
      containerRef.current.scrollTop === 0 // Absolutely at top
    )

    if (shouldHandlePull) {
      isDragging.current = true

      // Prevent default only when we're sure it's a pull gesture
      e.preventDefault()

      // Calculate pull distance with resistance curve
      const resistance = Math.max(0.3, 1 - (deltaY / 200))
      const distance = Math.min(deltaY * resistance, MAX_PULL)

      setPullDistance(distance)
      setIsPulling(distance > 25)
    } else {
      // If not pulling, ensure we're not interfering with scroll
      if (isDragging.current && (deltaY <= 0 || !isAtTop.current)) {
        // Reset pull state if conditions no longer met
        isDragging.current = false
        setPullDistance(0)
        setIsPulling(false)
      }
    }

    lastTouchY.current = currentY
  }, [isRefreshing])

  const handleTouchEnd = useCallback(() => {
    const touchDuration = Date.now() - touchStartTime.current

    // Only trigger refresh if we had a genuine pull gesture
    if (
      isDragging.current &&
      pullDistance >= PULL_THRESHOLD &&
      !isRefreshing &&
      isAtTop.current &&
      touchDuration > 100 // Minimum touch duration to avoid accidental triggers
    ) {
      handleRefresh()
    }

    // Quick reset for smooth transition
    const resetDelay = isDragging.current ? 150 : 50

    setTimeout(() => {
      setPullDistance(0)
      setIsPulling(false)
      isDragging.current = false
      scrollVelocity.current = 0
    }, resetDelay)
  }, [pullDistance, isRefreshing, handleRefresh])

  // Load section 2 when section 1 end is reached
  const loadSection2 = useCallback(async () => {
    console.log('🔄 loadSection2 called - Current states:', {
      section2Loading,
      section2Loaded,
      section1DataExists: !!section1Data
    });

    if (section2Loading || section2Loaded) {
      console.log('⏭️ Skipping section 2 load - already loading or loaded');
      return;
    }

    console.log('🚀 Starting section 2 load...');
    setSection2Loading(true);

    try {
      const data = await fetchSectionData(2);
      console.log('✅ Section 2 data received:', data);
      setSection2Data(data);
      setSection2Loaded(true);
    } catch (error) {
      console.error('❌ Error loading section 2:', error);
    } finally {
      setSection2Loading(false);
      console.log('🏁 Section 2 loading complete');
    }
  }, [section2Loading, section2Loaded, fetchSectionData]);

  // Load section 3 when section 2 end is reached
  const loadSection3 = useCallback(async () => {
    console.log('🔄 loadSection3 called - Current states:', {
      section3Loading,
      section3Loaded,
      section2DataExists: !!section2Data
    });

    if (section3Loading || section3Loaded) {
      console.log('⏭️ Skipping section 3 load - already loading or loaded');
      return;
    }

    console.log('🚀 Starting section 3 load...');
    setSection3Loading(true);

    try {
      const data = await fetchSectionData(3);
      console.log('✅ Section 3 data received:', data);
      setSection3Data(data);
      setSection3Loaded(true);
    } catch (error) {
      console.error('❌ Error loading section 3:', error);
    } finally {
      setSection3Loading(false);
      console.log('🏁 Section 3 loading complete');
    }
  }, [section3Loading, section3Loaded, fetchSectionData]);

  // Handle scroll for pull to refresh detection AND manual section loading fallback
  const handleScroll = useCallback(() => {
    checkIfAtTop()

    // Reset pull state if user scrolled away from top
    if (containerRef.current && containerRef.current.scrollTop > 0 && isDragging.current) {
      isDragging.current = false
      setPullDistance(0)
      setIsPulling(false)
    }

    // Existing manual section loading fallback code remains the same...
    if (containerRef.current && section1EndRef.current && !section2Loaded && !section2Loading && section1Data) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const section1EndRect = section1EndRef.current.getBoundingClientRect()
      const isVisible = section1EndRect.top < containerRect.bottom + 300

      if (isVisible) {
        console.log('📍 Manual scroll detection: Section 1 end is visible, loading section 2')
        loadSection2()
      }
    }

    if (containerRef.current && section2EndRef.current && section2Loaded && !section3Loaded && !section3Loading) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const section2EndRect = section2EndRef.current.getBoundingClientRect()
      const isVisible = section2EndRect.top < containerRect.bottom + 300

      if (isVisible) {
        console.log('📍 Manual scroll detection: Section 2 end is visible, loading section 3')
        loadSection3()
      }
    }
  }, [checkIfAtTop, section1Data, section2Loaded, section2Loading, section3Loaded, section3Loading, loadSection2, loadSection3])

  // Setup Intersection Observer for sequential loading
  useEffect(() => {
    // Clean up existing observer
    if (observer.current) {
      observer.current.disconnect();
    }

    // Setup observer with a delay to ensure DOM is ready
    const setupObserver = () => {
      if (!section1Data || !section1EndRef.current) {
        console.log('Observer setup skipped - missing data or ref:', {
          hasSection1Data: !!section1Data,
          hasSection1EndRef: !!section1EndRef.current
        });
        return;
      }

      console.log('🔧 Setting up intersection observer...');

      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const sectionName = entry.target.getAttribute('data-section');
            console.log('👁️ Intersection callback:', {
              section: sectionName,
              isIntersecting: entry.isIntersecting,
              intersectionRatio: entry.intersectionRatio.toFixed(2),
              targetTop: entry.boundingClientRect.top.toFixed(0),
              rootBottom: entry.rootBounds?.bottom.toFixed(0)
            });

            if (entry.isIntersecting && entry.intersectionRatio > 0) {
              // Load section 2 when section 1 end is visible
              if (entry.target === section1EndRef.current && !section2Loaded && !section2Loading) {
                console.log('✅ Intersection Observer: Triggering section 2 load');
                loadSection2();
              }

              // Load section 3 when section 2 end is visible (only if section 2 is loaded)
              if (entry.target === section2EndRef.current && section2Loaded && !section3Loaded && !section3Loading) {
                console.log('✅ Intersection Observer: Triggering section 3 load');
                loadSection3();
              }
            }
          });
        },
        {
          root: null, // Use viewport instead of container
          rootMargin: '300px 0px', // Load when within 300px of viewport
          threshold: [0, 0.1, 0.5, 1] // Multiple thresholds for better detection
        }
      );

      // Always observe section 1 end when available
      if (section1EndRef.current) {
        console.log('👀 Observing section 1 end marker');
        observer.current.observe(section1EndRef.current);
      }

      // Observe section 2 end if it exists and section 2 is loaded
      if (section2EndRef.current && section2Loaded) {
        console.log('👀 Observing section 2 end marker');
        observer.current.observe(section2EndRef.current);
      }
    };

    // Small delay to ensure DOM is rendered
    const timeoutId = setTimeout(setupObserver, 200);

    return () => {
      clearTimeout(timeoutId);
      console.log('🧹 Cleaning up intersection observer');
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [section1Data, section2Loaded, section2Loading, section3Loading, section3Loaded, loadSection2, loadSection3]);

  // Add section 2 end observer when section 2 loads
  useEffect(() => {
    if (section2Loaded && section2EndRef.current && observer.current) {
      console.log('👀 Adding section 2 end marker to observer');
      observer.current.observe(section2EndRef.current);
    }
  }, [section2Loaded]);

  // Debug refs and container
  useEffect(() => {
    console.log('🔍 Debug info:', {
      containerRef: !!containerRef.current,
      section1EndRef: !!section1EndRef.current,
      section2EndRef: !!section2EndRef.current,
      containerScrollHeight: containerRef.current?.scrollHeight,
      containerClientHeight: containerRef.current?.clientHeight,
      section1Data: !!section1Data,
      section2Loaded,
      section2Loading
    });
  }, [section1Data, section2Loaded, section2Loading]);

  // Initial data fetch - only load section 1
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      console.log('🚀 Loading initial data (Section 1 only)...');

      await Promise.all([
        fetchUserData(),
        fetchSectionData(1).then(data => {
          console.log('✅ Section 1 loaded:', data);
          setSection1Data(data);
        })
      ]);

      setIsLoading(false);
      console.log('🏁 Initial loading complete');
    };

    loadInitialData();
  }, [fetchUserData, fetchSectionData]);

  // Setup back button listener
  useEffect(() => {
    let backButtonListener: any = null

    const setupBackButtonListener = async () => {
      if (Capacitor.isNativePlatform()) {
        backButtonListener = await App.addListener('backButton', handleBackButton)
      }
    }

    setupBackButtonListener()

    return () => {
      if (backButtonListener) backButtonListener.remove()
      if (backPressTimer.current) clearTimeout(backPressTimer.current)
    }
  }, [handleBackButton])

  // Setup touch event listeners for pull to refresh - Fixed
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Optimized event listener options
    const touchStartOptions = {
      passive: true,
      capture: false
    }
    const touchMoveOptions = {
      passive: false, // Need to preventDefault for pull-to-refresh
      capture: false
    }
    const touchEndOptions = {
      passive: true,
      capture: false
    }
    const scrollOptions = {
      passive: true,
      capture: false
    }

    container.addEventListener('touchstart', handleTouchStart, touchStartOptions)
    container.addEventListener('touchmove', handleTouchMove, touchMoveOptions)
    container.addEventListener('touchend', handleTouchEnd, touchEndOptions)
    container.addEventListener('scroll', handleScroll, scrollOptions)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleScroll])

  // Render functions
  const renderSection1Content = () => {
    if (!section1Data) return null

    const sections: React.ReactElement[] = []

    // Notifications Card
    sections.push(
      <NotificationsCard
        notificationCount={user?.not_count ?? 0}
        key="notifications"
      />
    )

    // Moods Section
    if (section1Data.homemoods && section1Data.homemoods.length > 0) {
      sections.push(<MoodsSection moods={section1Data.homemoods} key="moods" />)
    }

    // Recent Suggestions
    if (section1Data.recentSuggestions && section1Data.recentSuggestions.length > 0) {
      sections.push(
        <SuggestionsSection
          key="recentSuggestions"
          suggestions={section1Data.recentSuggestions}
          title="Recent Suggestions"
        />
      )
    }

    // Genres Section
    if (section1Data.homegenres && section1Data.homegenres.length > 0) {
      sections.push(<GenresSection genres={section1Data.homegenres} key="genres" />)
    }

    return sections
  }

  const renderSection2Content = () => {
    if (!section2Data) return null

    const sections: React.ReactElement[] = []
    let rewardSectionAdded = false

    // Process section 2 data
    Object.keys(section2Data).forEach((key) => {
      const sectionData = section2Data[key]
      if (!Array.isArray(sectionData) || sectionData.length === 0) return

      if (key === 'popularAmongFriends') {
        // Premium image
        sections.push(
          <div
            key="premium"
            onClick={() => router.push('/premium')}
            className="w-full h-[200px] relative mb-8 cursor-pointer">
            <Image
              src={premiumImage}
              alt="Premium Content"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-full object-contain"
            />
          </div>
        )

        sections.push(
          <PopularWithFriendsSection
            key={key}
            movies={sectionData}
            title="Popular Among Friends"
          />
        )
      } else if (key === 'longtimeWatchlist') {
        // Add the longtimeWatchlist section
        const title = camelCaseToTitle(key)
        const sectionType = getSectionType(key)

        sections.push(
          <DynamicMovieSection
            key={key}
            movies={sectionData}
            title={title}
            sectionType={sectionType}
            sectionKey={key}
          />
        )

        // Add RewardSection immediately after longtimeWatchlist
        if (!rewardSectionAdded) {
          sections.push(
            <div className="mb-8" key="reward-section">
              <RewardSection
                key="rewardsection"
                coins={user?.coins ?? ""}
                user={{ payment_status: user?.payment_status }}
              />
            </div>
          )
          rewardSectionAdded = true
        }
      } else {
        const title = camelCaseToTitle(key)
        const sectionType = getSectionType(key)

        sections.push(
          <DynamicMovieSection
            key={key}
            movies={sectionData}
            title={title}
            sectionType={sectionType}
            sectionKey={key}
          />
        )
      }
    })

    return sections
  }

  const renderSection3Content = () => {
    if (!section3Data) return null

    const sections: React.ReactElement[] = []
    let mysteryWeekendData: any[] = []

    Object.keys(section3Data).forEach((key) => {
      const sectionData = section3Data[key]
      if (!Array.isArray(sectionData) || sectionData.length === 0) return

      if (key === 'mysteryweekendpick') {
        mysteryWeekendData = sectionData
        return
      }

      if (key === 'aiRandomizer') {
        sections.push(<ShareSuggestionCard key="share" />)
        sections.push(
          <AiRandomizerSection
            key={key}
            movies={sectionData}
            title="AI Recommendations"
            sectionKey={key}
          />
        )
      } else {
        const title = camelCaseToTitle(key)
        const sectionType = getSectionType(key)

        sections.push(
          <DynamicMovieSection
            key={key}
            movies={sectionData}
            title={title}
            sectionType={sectionType}
            sectionKey={key}
          />
        )
      }
    })

    // Add Poll Card
    sections.push(<PollCard key="poll" />)

    // Add Top10Wall
    sections.push(<Top10Wall key="top10wall" />)

    // Add Mystery Weekend Picks if available
    if (mysteryWeekendData?.length > 0) {
      sections.push(
        <MysteryWeekendPicks
          key="mysteryweekendpick"
          movies={mysteryWeekendData}
          title="Mystery Weekend Picks"
        />
      )
    }

    return sections
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <>
      <div
        ref={containerRef}
        className="text-white min-h-screen mb-22 overflow-y-auto"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        <div data-tour-target="pull-refresh-zone">
          <PullToRefreshIndicator
            pullDistance={pullDistance}
            isRefreshing={isRefreshing}
            isDragging={isDragging.current}
            pullThreshold={PULL_THRESHOLD}
          />
        </div>

        <div ref={headerRef}>
          <Header />
        </div>

        <div ref={movieCarouselRef}>
          <MovieCarousel banners={section1Data?.activebanners || []} />
        </div>

        {/* Section 1 Content */}
        {renderSection1Content()}

        {/* Section 1 End Marker */}
        <div
          ref={section1EndRef}
          data-section="section1-end"
          className="h-0 opacity-0 pointer-events-none"
          style={{
            minHeight: '1px',
            width: '100%',
            position: 'relative',
            margin: '20px 0'
          }}
        />

        {/* Section 2 Loading Indicator */}
        {section2Loading && (
          <div className="text-center p-8">
          </div>
        )}

        {/* Section 2 Content */}
        {section2Loaded && section2Data && (
          <div>
            {renderSection2Content()}

            {/* Section 2 End Marker */}
            <div
              ref={section2EndRef}
              data-section="section2-end"
              className="h-0 opacity-0 pointer-events-none"
              style={{
                minHeight: '1px',
                width: '100%',
                position: 'relative',
                margin: '20px 0'
              }}
            />
          </div>
        )}

        {/* Section 3 Loading Indicator */}
        {section3Loading && (
          <div className="text-center p-8">
          </div>
        )}

        {/* Section 3 Content */}
        {section3Loaded && section3Data && (
          <div>
            {renderSection3Content()}
          </div>
        )}
      </div>

      {/* Modals */}
      <ExitDialog
        isOpen={showExitConfirmation}
        onCancel={() => handleExitConfirmation(false)}
        onConfirm={() => handleExitConfirmation(true)}
      />

      <CoinAnimation
        show={showCoinAnimation}
        coinsEarned={coinsEarned}
        message="Coins Earned for daily login!"
        onAnimationEnd={() => setShowCoinAnimation(false)}
        duration={3000}
      />

      <BottomNavigation currentPath="/home" />
    </>
  )
}
