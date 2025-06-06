"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

import "swiper/css"

type Banner = {
  id: string
  title: string
  subtitle: string
  imageSrc: string
  alt: string
  targetUrl?: string
  movie_id: string
}


export const MovieCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

        const formattedBanners: Banner[] = data.map((banner: any) => ({
          id: banner.banner_id,
          title: banner.title,
          subtitle: banner.subtitle,
          imageSrc: banner.image_url,
          alt: banner.title,
          targetUrl: banner.target_url,
          movie_id: banner.movie_id || "", 
        }))

        setBanners(formattedBanners)
      } catch (err) {
        console.error("Error fetching banners:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanners()
  }, [])

  return (
    <div className="relative px-4 py-6">
      {isLoading ? (
        <div className="h-[400px] w-full flex items-center justify-center">
          <Skeleton className="h-[400px] w-full rounded-lg bg-[#292938]" />
        </div>
      ) : error ? (
        <div className="h-[400px] w-full flex items-center justify-center bg-[#292938] rounded-lg">
          <div className="text-center">
            <p className="text-red-400 mb-2">Failed to load movies</p>
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
          className="h-[400px]"
          slidesPerView={1.5}
          centeredSlides={true}
          spaceBetween={10}
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner.id}>
              <motion.div
                initial={{ opacity: 0.8, scale: 0.9 }}
                animate={{
                  opacity: activeIndex === index ? 1 : 0.7,
                  scale: activeIndex === index ? 1 : 0.85,
                  zIndex: activeIndex === index ? 10 : 0,
                }}
                transition={{ duration: 0.3 }}
                className={`relative w-full h-full rounded-lg overflow-hidden ${activeIndex === index ? "shadow-xl" : ""}`}
                onClick={() => router.push( `/movie-detail-page?movie_id=${banner.movie_id}`)}
              >
                <img 
                  src={banner.imageSrc || "/placeholder.svg?height=500&width=320"} 
                  alt={banner.alt}
                  className="absolute w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Pagination Dots */}
      {!isLoading && !error && (
        <div className="flex justify-center gap-1 mt-4">
          {banners.map((_, dotIndex) => (
            <div
              key={dotIndex}
              className={`rounded-full transition-all duration-300 h-1.5 ${
                activeIndex === dotIndex ? "w-6 bg-primary" : "w-1.5 bg-gray-600"
              }`}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}
