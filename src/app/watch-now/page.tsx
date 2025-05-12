"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, Shuffle, Sparkles, Clock, Star, Plus, Play, X } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import WatchNowFilterComponent from "@/components/watchnow-filter"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import home4 from "@/assets/home-4.jpg"
import home5 from "@/assets/home-5.jpg"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"

import "swiper/css"

// Placeholder data - replace with your actual data
const streamingServices = [
  {
    id: "apple",
    name: "Apple TV+",
    logo: "/placeholder.svg?height=60&width=60",
    color: "#000000",
  },
  {
    id: "netflix",
    name: "Netflix",
    logo: "/placeholder.svg?height=60&width=60",
    color: "#E50914",
  },
  {
    id: "prime",
    name: "Prime Video",
    logo: "/placeholder.svg?height=60&width=60",
    color: "#00A8E1",
  },
  {
    id: "hbo",
    name: "HBO Max",
    logo: "/placeholder.svg?height=60&width=60",
    color: "#5822B4",
  },
]

const movieCards = [
  {
    id: 1,
    title: "Foundation",
    imageSrc: home1,
    genre: "Sci-Fi",
    rating: 8.4,
    runtime: "60 min",
    platform: "Apple TV+",
    releaseDate: "JULY 14",
    featured: true,
  },
  {
    id: 2,
    title: "Dune: Part Two",
    imageSrc: home2,
    genre: "Sci-Fi",
    rating: 8.7,
    runtime: "166 min",
    platform: "HBO Max",
  },
  {
    id: 3,
    title: "Oppenheimer",
    imageSrc: home3,
    genre: "Drama/Biography",
    rating: 8.5,
    runtime: "180 min",
    platform: "Netflix",
  },
  {
    id: 4,
    title: "Everything Everywhere All at Once",
    imageSrc: home4,
    genre: "Sci-Fi/Comedy",
    rating: 8.0,
    runtime: "139 min",
    platform: "Prime Video",
  },
  {
    id: 5,
    title: "The Batman",
    imageSrc: home5,
    genre: "Action/Crime",
    rating: 7.8,
    runtime: "176 min",
    platform: "HBO Max",
  },
  {
    id: 6,
    title: "Top Gun: Maverick",
    imageSrc: home1,
    genre: "Action/Drama",
    rating: 8.3,
    runtime: "130 min",
    platform: "Paramount+",
  },
]

export default function WatchNow() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showFilter, setShowFilter] = useState(false)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showPlaylist, setShowPlaylist] = useState(false)

  // Filter movies based on selected streaming service
  const filteredMovies = selectedService
    ? movieCards.filter((movie) => movie.platform === streamingServices.find((s) => s.id === selectedService)?.name)
    : movieCards

  // Smart suggestion based on time
  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay() // 0 is Sunday, 6 is Saturday

    if ((day === 5 || day === 6) && hour >= 20) {
      setSuggestion("Perfect for a Friday night?")
    } else if (hour >= 22) {
      setSuggestion("Looking for something before bed?")
    } else if (hour >= 17 && hour < 20) {
      setSuggestion("Evening movie time?")
    } else {
      setSuggestion(null)
    }
  }, [])

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      // Skip this movie
      shuffleNext()
    } else {
      // Like this movie
      setExpandedCard(currentIndex)
    }
  }

  const shuffleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredMovies.length)
  }

  const feelingLucky = () => {
    const randomIndex = Math.floor(Math.random() * filteredMovies.length)
    setCurrentIndex(randomIndex)
    setExpandedCard(randomIndex)
  }

  const togglePlaylist = () => {
    setShowPlaylist(!showPlaylist)
  }

  const selectStreamingService = (serviceId: string) => {
    setSelectedService(serviceId)
    setShowPlaylist(false)
    setCurrentIndex(0)
  }

  return (
    <div className="bg-[#181826] text-white min-h-screen mb-18">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{showPlaylist ? "Playlist" : "Watch Now"}</h1>
          <p className="text-xs text-gray-400">
            {showPlaylist ? "Select a streaming service" : "Find your next favorite"}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            className={`text-gray-300 ${showPlaylist ? "bg-[#292938] rounded-full p-2" : ""}`}
            onClick={togglePlaylist}
          >
            {showPlaylist ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            )}
          </button>
          {!showPlaylist && (
            <>
              <button className="text-gray-300" onClick={() => setShowFilter(true)}>
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <button className="text-gray-300" onClick={shuffleNext}>
                <Shuffle className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </header>

      {showPlaylist ? (
        <div className="px-4 pb-20">
          {/* Streaming Services Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {streamingServices.map((service) => (
              <button
                key={service.id}
                className={`bg-[#292938] rounded-xl p-3 flex items-center justify-center ${selectedService === service.id ? "ring-2 ring-[#9370ff]" : ""
                  }`}
                onClick={() => selectStreamingService(service.id)}
              >
                <div className="w-12 h-12 relative">
                  <Image src={service.logo || "/placeholder.svg"} alt={service.name} fill className="object-contain" />
                </div>
              </button>
            ))}
          </div>

          {/* Featured Content as Carousel */}
          <div className="relative mb-8">
            <h2 className="text-lg font-semibold mb-3 px-4">Featured</h2>

            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop
              onSlideChange={(swiper) => {
                const newMovieId = filteredMovies.filter((movie) => movie.featured)[swiper.realIndex]?.id
                const newIndex = filteredMovies.findIndex((m) => m.id === newMovieId)
                setExpandedCard(newIndex)
              }}
              className="h-full w-full sm:px-0 px-4"
              slidesPerView={1.2}
              spaceBetween={16}
              centeredSlides={true}
            >
              {filteredMovies
                .filter((movie) => movie.featured)
                .map((movie) => (
                  <SwiperSlide key={movie.id}>
                    <motion.div
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-xl mx-auto cursor-pointer"
                      onClick={() => {
                        const movieIndex = filteredMovies.findIndex((m) => m.id === movie.id)
                        setExpandedCard(movieIndex)
                        setShowPlaylist(false)
                      }}
                    >
                      <Image
                        src={movie.imageSrc || "/placeholder.svg"}
                        alt={movie.title}
                        fill
                        className="object-cover w-full h-full"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#181826]/60 to-[#181826]" />

                      {/* Bottom content */}
                      <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col items-center z-20">
                        <h3 className="text-2xl font-bold text-white mb-1 text-center">{movie.title}</h3>
                        <p className="text-sm text-gray-300 text-center">{movie.releaseDate}</p>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>

          {/* Trending Now */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Trending Now</h2>
            <div className="grid grid-cols-2 gap-3">
              {filteredMovies
                .filter((movie) => !movie.featured)
                .slice(0, 4)
                .map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-[#292938] rounded-xl overflow-hidden"
                    onClick={() => {
                      setExpandedCard(filteredMovies.findIndex((m) => m.id === movie.id))
                      setShowPlaylist(false)
                    }}
                  >
                    <div className="relative h-[180px]">
                      <Image
                        src={movie.imageSrc || "/placeholder.svg"}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                      <div className="flex items-center mt-1">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" fill="rgb(250 204 21)" />
                        <span className="text-xs">{movie.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="top-0 bg-[#181826] z-10 px-4 pt-2 pb-4">
            <div className="flex items-center bg-[#292938] rounded-full px-4 py-4">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by title, genre, platform..."
                className="bg-transparent w-full focus:outline-none text-gray-300"
                onClick={() => router.push("/search")}
              />
            </div>
          </div>

          {/* Smart Suggestion */}
          {suggestion && (
            <div className="px-4 mb-4">
              <div className="bg-[#292938]/50 rounded-lg p-3 flex items-center">
                <Sparkles className="w-4 h-4 text-[#9370ff] mr-2" />
                <p className="text-sm text-gray-200">{suggestion}</p>
              </div>
            </div>
          )}

          {/* Selected Service Indicator */}
          {selectedService && (
            <div className="px-4 mb-4">
              <div className="bg-[#292938]/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-6 h-6 relative mr-2">
                    <Image
                      src={streamingServices.find((s) => s.id === selectedService)?.logo || ""}
                      alt={streamingServices.find((s) => s.id === selectedService)?.name || ""}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-sm text-gray-200">
                    Showing {streamingServices.find((s) => s.id === selectedService)?.name} content
                  </p>
                </div>
                <button className="text-xs text-[#9370ff]" onClick={() => setSelectedService(null)}>
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Movie Cards Stack */}
          <div className="relative h-[450px] px-4 mb-6">
            <AnimatePresence>
              {expandedCard !== null && filteredMovies.length > 0 ? (
                <motion.div
                  key="expanded"
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 bg-[#292938] rounded-xl overflow-hidden"
                >
                  <div className="relative h-[250px]">
                    <Image
                      src={filteredMovies[expandedCard].imageSrc || "/placeholder.svg"}
                      alt={filteredMovies[expandedCard].title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181826] to-transparent"></div>
                    <button
                      className="absolute top-4 right-4 bg-black/50 rounded-full p-2"
                      onClick={() => setExpandedCard(null)}
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h2 className="text-xl font-bold mb-2">{filteredMovies[expandedCard].title}</h2>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" fill="rgb(250 204 21)" />
                        <span className="text-sm">{filteredMovies[expandedCard].rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm">{filteredMovies[expandedCard].runtime}</span>
                      </div>
                      <span className="text-sm bg-[#9370ff]/20 text-[#9370ff] px-2 py-0.5 rounded">
                        {filteredMovies[expandedCard].genre}
                      </span>
                    </div>

                    <p className="text-sm text-gray-300 mb-4">
                      Available on <span className="font-semibold">{filteredMovies[expandedCard].platform}</span>
                    </p>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-[#9370ff] text-white py-3 rounded-lg flex items-center justify-center gap-2">
                        <Play className="w-4 h-4" fill="white" />
                        Watch Now
                      </button>
                      <button className="bg-[#292938] text-white p-3 rounded-lg">
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  {filteredMovies.length > 0 ? (
                    [2, 1, 0].map((offset) => {
                      const index = (currentIndex + offset) % filteredMovies.length
                      return (
                        <motion.div
                          key={filteredMovies[index].id}
                          initial={offset === 0 ? { scale: 0.8, y: 20, opacity: 0 } : {}}
                          animate={{
                            scale: 1 - offset * 0.05,
                            y: offset * 15,
                            opacity: 1 - offset * 0.2,
                            zIndex: 10 - offset,
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="absolute inset-x-4 rounded-xl overflow-hidden bg-[#292938] shadow-lg"
                          style={{ top: "10px", bottom: "10px" }}
                          onClick={() => offset === 0 && setExpandedCard(index)}
                          drag={offset === 0 ? "x" : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.7}
                          onDragEnd={(e, { offset, velocity }) => {
                            if (offset.x < -100) handleSwipe("left")
                            else if (offset.x > 100) handleSwipe("right")
                          }}
                        >
                          {offset === 0 && (
                            <div className="absolute inset-x-0 top-4 z-20 flex justify-center">
                              <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                                Swipe left to skip • Swipe right or tap to view
                              </div>
                            </div>
                          )}
                          <div className="relative h-full">
                            <Image
                              src={filteredMovies[index].imageSrc || "/placeholder.svg"}
                              alt={filteredMovies[index].title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#181826] via-transparent to-transparent"></div>

                            <div className="absolute inset-x-0 bottom-0 p-4">
                              <h2 className="text-xl font-bold mb-2">{filteredMovies[index].title}</h2>
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 mr-1" fill="rgb(250 204 21)" />
                                  <span className="text-sm">{filteredMovies[index].rating}</span>
                                </div>
                                <span className="text-sm bg-[#9370ff]/20 text-[#9370ff] px-2 py-0.5 rounded">
                                  {filteredMovies[index].genre}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#292938] rounded-xl p-6 text-center">
                      <div className="mb-4">
                        <Sparkles className="w-12 h-12 text-[#9370ff] mx-auto" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No movies found</h3>
                      <p className="text-gray-400 mb-4">
                        {selectedService
                          ? `No movies available for ${streamingServices.find((s) => s.id === selectedService)?.name}`
                          : "Try adjusting your filters or check back later"}
                      </p>
                      {selectedService && (
                        <button className="text-[#9370ff] font-medium" onClick={() => setSelectedService(null)}>
                          Show all streaming services
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="px-4 mb-6">
            <button
              onClick={feelingLucky}
              className="w-full bg-gradient-to-r from-[#9370ff] to-[#6c5ce7] text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              I'm Feeling Lucky
            </button>
          </div>
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/watch-now" />

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
              <WatchNowFilterComponent onClick={() => setShowFilter(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
