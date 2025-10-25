"use client"

import { useState } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronLeft,
  X,
  Heart,
  Users,
  Play,
  BarChart3,
  MapPin,
  Search,
  Share,
  MessageSquare,
  Trophy,
  Coins,
  ArrowLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"

const features = [
  {
    id: 1,
    title: "Watchlist",
    tagline: "Save now, watch later.",
    description:
      "Add any movie to your watchlist instantly — from suggestions, search, or explore. Never lose a good title again.",
    icon: Heart,
    gradient: "from-[#ff968b] to-[#ff2251]",
    iconColor: "text-white",
    borderColor: "border-[#ff968b]/30",
    glowColor: "bg-[#ff968b]/20",
  },
  {
    id: 2,
    title: "Friend Network",
    tagline: "Connect with movie lovers.",
    description:
      "Add friends who share your taste. Suggest, discuss, and discover films together. Your movie circle just got social.",
    icon: Users,
    gradient: "from-[#B3EB50] to-[#1ea896]",
    iconColor: "text-white",
    borderColor: "border-[#B3EB50]/30",
    glowColor: "bg-[#B3EB50]/20",
  },
  {
    id: 3,
    title: "Watchroom",
    tagline: "Pick a movie everyone agrees on.",
    description:
      "Create a watchroom with friends. Suggesto automatically filters movies common in your group's watchlists. Perfect for movie nights.",
    icon: Play,
    gradient: "from-[#15F5FD] to-[#036CDA]",
    iconColor: "text-white",
    borderColor: "border-[#15F5FD]/30",
    glowColor: "bg-[#15F5FD]/20",
  },
  {
    id: 4,
    title: "Suggesto Polls",
    tagline: "Your opinion matters.",
    description:
      "Vote on movie polls, share opinions, and see what others think. Earn coins by participating in fun movie quizzes and polls.",
    icon: BarChart3,
    gradient: "from-[#b56bbc] to-[#7a71c4]",
    iconColor: "text-white",
    borderColor: "border-[#b56bbc]/30",
    glowColor: "bg-[#b56bbc]/20",
  },
  {
    id: 5,
    title: "Local Trends",
    tagline: "What's hot around you?",
    description:
      "Know what people in your city are watching. Discover trending content near you, personalized by language and popularity.",
    icon: MapPin,
    gradient: "from-[#ff7db8] to-[#ee2a7b]",
    iconColor: "text-white",
    borderColor: "border-[#ff7db8]/30",
    glowColor: "bg-[#ff7db8]/20",
  },
  {
    id: 6,
    title: "Mood-Based Search",
    tagline: "Feeling something? Watch something.",
    description:
      "Whether you're feeling happy, nostalgic, or adventurous — select your mood and Suggesto will find you the perfect film.",
    icon: Search,
    gradient: "from-[#b56bbc] to-[#7a71c4]",
    iconColor: "text-white",
    borderColor: "border-[#b56bbc]/30",
    glowColor: "bg-[#b56bbc]/20",
  },
  {
    id: 7,
    title: "Suggest to Friends",
    tagline: "Share what you love.",
    description:
      "Recommend up to 3 movies to multiple friends in a single go (Pro). Keep the movie buzz alive in your circle.",
    icon: Share,
    gradient: "from-[#ff7db8] to-[#ee2a7b]",
    iconColor: "text-white",
    borderColor: "border-[#ff7db8]/30",
    glowColor: "bg-[#ff7db8]/20",
  },
  {
    id: 8,
    title: "Request Suggestions",
    tagline: "Let your friends pick for you.",
    description: "Ask your friends for movie suggestions based on your mood or genre. They suggest, you choose.",
    icon: MessageSquare,
    gradient: "from-[#B3EB50] to-[#1ea896]",
    iconColor: "text-white",
    borderColor: "border-[#B3EB50]/30",
    glowColor: "bg-[#B3EB50]/20",
  },
  {
    id: 9,
    title: "Top 10 Wall",
    tagline: "Your cinema leaderboard.",
    description:
      "Track your top 10 watched, liked, or suggested movies. See trends and personal favorites in one place.",
    icon: Trophy,
    gradient: "from-[#b56bbc] to-[#7a71c4]",
    iconColor: "text-[#b56bbc]",
    borderColor: "border-[#b56bbc]/30",
    glowColor: "bg-[#b56bbc]/20",
  },
  {
    id: 10,
    title: "Earn Coins",
    tagline: "Get rewarded for being a movie buff.",
    description:
      "Earn Suggesto Coins by logging in daily, suggesting movies, completing challenges, and more. Use coins to unlock Pro features.",
    icon: Coins,
    gradient: "from-[#ff968b] to-[#ff2251]",
    iconColor: "text-[#ff968b]",
    borderColor: "border-[#ff968b]/30",
    glowColor: "bg-[#ff968b]/20",
  },
]

export default function AppTour() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction > 0 ? 25 : -25,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.9,
      rotateY: direction < 0 ? 25 : -25,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection: number) => {
    if (currentIndex + newDirection >= 0 && currentIndex + newDirection < features.length) {
      setDirection(newDirection)
      setCurrentIndex(currentIndex + newDirection)
    }
  }

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x)

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1)
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1)
    }
  }

  const currentFeature = features[currentIndex]
  const IconComponent = currentFeature.icon

  return (
    <div className="min-h-screen bg-[#121214] flex flex-col overflow-hidden">
      {/* Header */}
      {/* Header */}
      <header className="flex items-start px-4 pt-8 mb-4 relative">
        <button
          className="p-2 rounded-full bg-[#2b2b2b] mr-4"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-xl font-semibold text-white">Feature Guide</h1>
          <p className="text-sm text-gray-400">Discover what Suggesto can do</p>
        </div>
      </header>


      {/* Main Card Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 bg-[#121214]">
        <div className="relative w-full max-w-sm h-[580px] perspective-1000">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 },
                rotateY: { duration: 0.4 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="absolute inset-0"
            >
              <div
                className={`h-full w-full rounded-3xl bg-[#1f1f21] p-6 ${currentFeature.borderColor} backdrop-blur-sm relative overflow-hidden`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_40%)]"></div>
                </div>

                {/* Animated Icon */}
                <div className="flex justify-center mb-6 relative z-10">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <div
                      className={`absolute inset-0 ${currentFeature.glowColor} rounded-full blur-xl scale-150`}
                    ></div>
                    <div className="relative bg-black/20 backdrop-blur-sm rounded-full p-5 border border-white/10">
                      <IconComponent className={`w-10 h-10 ${currentFeature.iconColor}`} />
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="text-center space-y-5 relative z-10">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`text-2xl font-bold drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r ${currentFeature.gradient}`}
                  >
                    {currentFeature.title}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-base italic font-medium drop-shadow-md bg-clip-text text-transparent bg-gradient-to-r ${currentFeature.gradient}`}
                  >
                    {currentFeature.tagline}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-white/80 leading-relaxed px-2 drop-shadow-sm"
                  >
                    {currentFeature.description}
                  </motion.p>
                </div>

                {/* Navigation Controls */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-10">
                  {/* Previous Button */}
                  <Button
                    onClick={() => paginate(-1)}
                    disabled={currentIndex === 0}
                    className="bg-black/30 hover:bg-black/40 backdrop-blur-sm border border-white/20 text-white rounded-full p-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    size="icon"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Swipe Hint */}
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="text-white/70 text-xs flex items-center gap-1 drop-shadow-sm"
                  >
                    <span>Swipe to explore</span>
                  </motion.div>

                  {/* Next Button */}
                  {currentIndex < features.length - 1 ? (
                    <Button
                      onClick={() => paginate(1)}
                      className="bg-black/30 hover:bg-black/40 backdrop-blur-sm border border-white/20 text-white rounded-full p-2 shadow-lg"
                      size="icon"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => console.log("Close guide")}
                      className="bg-black/30 hover:bg-black/40 backdrop-blur-sm border border-white/20 text-white font-medium px-4 py-2 rounded-full shadow-lg text-sm"
                    >
                      Got it!
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Section */}
      <div className=" px-4 py-4">
        {/* Progress Dots */}
        <div className="flex justify-center items-center space-x-2 mb-3">
          {features.map((feature, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                ? `bg-gradient-to-r ${feature.gradient} w-6 shadow-lg`
                : "bg-gray-600 hover:bg-gray-500 w-2"
                }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Progress Text */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            {currentIndex + 1} of {features.length} features
          </p>
        </div>
      </div>
    </div>
  )
}
