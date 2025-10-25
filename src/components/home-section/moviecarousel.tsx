"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import DefaultMoviePoster from "@/assets/default-movie-poster.jpg"
import "swiper/css"

type Banner = {
  banner_id: number
  display_order: number
  movie_details: {
    movie_id: number
    title: string
    poster: string
  }
}

type MovieCarouselProps = {
  banners: Banner[]
  isLoading?: boolean
}

export const MovieCarousel = ({ banners, isLoading = false }: MovieCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const router = useRouter()

  return (
    <div className="relative px-4 py-6" data-tour-target="movie-carousel">
      {isLoading ? (
        <div className="h-[400px] w-full flex items-center justify-center">
          <Skeleton className="h-[400px] w-full rounded-lg bg-[#2b2b2b]" />
        </div>
      ) : (
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000 }}
          loop
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="h-[400px]"
          slidesPerView={1.5}
          centeredSlides={true}
          spaceBetween={10}
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner.banner_id}>
              <motion.div
                initial={{ opacity: 0.8, scale: 0.9 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0.7,
                  scale: activeIndex === index ? 1 : 0.85,
                  zIndex: activeIndex === index ? 10 : 0,
                }}
                transition={{ duration: 0.3 }}
                className={`relative w-full h-full rounded-lg overflow-hidden ${activeIndex === index ? "shadow-xl" : ""}`}
                onClick={() => router.push(`/movie-detail-page?movie_id=${banner.movie_details.movie_id}`)}
              >
                <img
                  src={`https://suggesto.xyz/App/${banner.movie_details.poster}` || DefaultMoviePoster.src}
                  alt={banner.movie_details.title}
                  className="absolute w-full h-full object-cover"
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {!isLoading && (
        <div className="flex justify-center gap-1 mt-4">
          {banners.map((_, dotIndex) => (
            <div
              key={dotIndex}
              className={`rounded-full transition-all duration-300 h-1.5 ${activeIndex === dotIndex
                ? "w-6 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]"
                : "w-1.5 bg-gray-600"
                }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}
