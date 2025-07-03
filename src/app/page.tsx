"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import image from "@/assets/startup-Screen-1.png"
import logo from "@/assets/suggesto-logo.png"
import nameLogo from "@/assets/suggesto-name-logo.png"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import useFetchUserDetails from "@/hooks/useFetchUserDetails"
import { App } from "@capacitor/app"
import type { PluginListenerHandle } from "@capacitor/core"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"
import { registerServiceWorker } from "@/lib/serviceWorker"

const carouselData = [
  {
    title: "Get Personalized Movie Suggestions",
    lines: [
      "Discover movies picked just for you —",
      "from your friends and Suggesto AI.",
      "Smart, social, and always on point."
    ]
  },
  {
    title: "Build Your Smart Watchlist",
    lines: [
      "Save movies you love or plan to watch.",
      "Track everything, filter by genre, OTT,",
      "and never miss a great film again."
    ]
  },
  {
    title: "Watch Movies With Friends",
    lines: [
      "Create watchrooms with your crew.",
      "Find movies you all like,",
      "and plan the perfect movie night."
    ]
  }
]



const RedirectLoading = () => (
  <div className="px-4">
    {/* Movie Carousel Skeleton */}
    <div className="h-[400px] w-full flex bg-[#2b2b2b] items-center justify-center mb-8">
      <Skeleton className="h-[400px] rounded-lg bg-[#2b2b2b]" />
    </div>

    {/* Section Skeletons */}
    {[1, 2, 3].map((section) => (
      <div key={section} className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-40 bg-[#2b2b2b]" />
          <Skeleton className="h-4 w-16 bg-[#2b2b2b]" />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="min-w-[120px] h-[180px] rounded-lg bg-[#2b2b2b]" />
          ))}
        </div>
      </div>
    ))}
  </div>
);



export default function RootPage() {
  const { user, loading, isPageValid, isRedirecting } = useFetchUserDetails()
  const [index, setIndex] = useState(0)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [sliderWidth, setSliderWidth] = useState(320) // Set a default width
  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {
    registerServiceWorker()
  }, [])

  // Fetch cookie only on client
  useEffect(() => {
    setUserId(Cookies.get("userID"))
  }, [])

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(null, args), wait)
    }
  }

  const updateSliderWidth = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth
      setSliderWidth(width > 0 ? width : 320) // Fallback to 320px if width is 0
    }
  }, [])

  const debouncedResize = useCallback(debounce(updateSliderWidth, 150), [updateSliderWidth])

  useEffect(() => {
    let backHandler: PluginListenerHandle
    const setupBackButton = async () => {
      backHandler = await App.addListener("backButton", () => {
        if (window.history.length > 1) {
          router.back()
        } else {
          App.exitApp()
        }
      })
    }
    setupBackButton()
    return () => {
      if (backHandler) backHandler.remove()
    }
  }, [router])

  useEffect(() => {
    // Add a small delay to ensure the container is rendered
    const timer = setTimeout(updateSliderWidth, 100)
    window.addEventListener("resize", debouncedResize)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", debouncedResize)
    }
  }, [debouncedResize, updateSliderWidth])

  // Fixed slider calculations
  const sliderButtonWidth = Math.max(140, sliderWidth * 0.5)
  const maxDragDistance = sliderWidth - sliderButtonWidth - 8

  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 500, damping: 30 })
  const progress = useTransform(x, [0, maxDragDistance], [0, 1])
  const background = useTransform(progress, [0, 1], [
    "linear-gradient(to right, #b56bbc, #7a71c4)", // start
    "linear-gradient(to right, #b56bbc, #7a71c4)", // end
  ])

  const arrowOpacity = useTransform(progress, [0, 0.8], [1, 0])

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % carouselData.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSlideComplete = useCallback(() => {
    router.push("/auth/create-account")
  }, [router])

  if (!userId && !loading) {
    return (
      <div className="fixed inset-0 flex flex-col text-white bg-[#121214] overflow-hidden">
        <div className="w-full max-w-md mx-auto flex flex-col h-full relative">
          <div className="absolute top-0 left-0 right-0 h-25 bg-gradient-to-b from-[#121214] to-transparent z-20 pointer-events-none" />

          <div className="h-[60vh] relative border-none">
            <style jsx>{`
                @keyframes bounceSlow {
                  0%, 100% {
                    transform: translateY(0);
                  }
                  50% {
                    transform: translateY(-20px);
                  }
                }

                .bounce-slow {
                  animation: bounceSlow 2s infinite;
                }
              `}</style>
            <Image
              src={image}
              alt="Welcome to Suggesto - Movie recommendation app"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121214] to-transparent" />

            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-30 bounce-slow">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Image
                  src={logo}
                  alt="Suggesto Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </motion.div>
            </div>

          </div>

          <div className="flex-1 flex flex-col items-center px-4 relative z-30">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={index}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                {carouselData[index].title}
              </h2>
              <div className="space-y-0">
                {carouselData[index].lines.map((line, i) => (
                  <p key={i} className="text-sm text-white/70">
                    {line}
                  </p>
                ))}
              </div>
            </motion.div>

            <div className="absolute bottom-8 left-0 right-0 px-6">
              <div className="flex gap-2 items-center justify-center mb-5">
                {carouselData.map((_, i) => (
                  <motion.button
                    key={i}
                    className="rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    animate={{
                      width: index === i ? 20 : 10,
                      height: 10,
                      opacity: index === i ? 1 : 0.3
                    }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <div
                ref={containerRef}
                className="flex w-full max-w-sm mx-auto relative rounded-full overflow-hidden"
              >
                <div className="relative w-full h-14 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <motion.div
                    className="absolute h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 px-6 shadow-lg"
                    style={{
                      width: sliderButtonWidth,
                      background,
                      x: springX
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: maxDragDistance }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x > maxDragDistance * 0.7) {
                        x.set(maxDragDistance)
                        setTimeout(handleSlideComplete, 300)
                      } else {
                        x.set(0)
                      }
                    }}
                    role="button"
                    aria-label="Slide to continue to account creation"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        x.set(maxDragDistance)
                        setTimeout(handleSlideComplete, 300)
                      }
                    }}
                  >
                    <span className="text-white font-semibold text-lg select-none whitespace-nowrap">
                      Let's Go
                    </span>
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 flex items-center justify-end px-4 text-white/60 pointer-events-none"
                    style={{ opacity: arrowOpacity }}
                  >
                    {[0, 100, 200].map((delay, i) => (
                      <ChevronRight
                        key={i}
                        className="w-5 h-5 animate-pulse"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RedirectLoading />
  )
}