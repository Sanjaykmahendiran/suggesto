"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import image from "@/assets/startup-bg.png"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

const carouselTexts = [
  ["Lorem ipsum", "dolor sit amet,", "consectetur"],
  ["Welcome to", "Your Next", "Big Opportunity"],
  ["Innovate.", "Grow.", "Succeed."]
]

export default function Home() {
  const [index, setIndex] = useState(0)
  const router = useRouter()
  const containerRef = useRef(null)
  
  // Track the slider width to make calculations easier
  const [sliderWidth, setSliderWidth] = useState(0)
  
  // Get the width of the container on mount
  useEffect(() => {
    if (containerRef.current) {
      setSliderWidth(containerRef.current.offsetWidth)
    }
    
    // Handle window resize
    const handleResize = () => {
      if (containerRef.current) {
        setSliderWidth(containerRef.current.offsetWidth)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Calculate threshold based on container width
  const slideThreshold = sliderWidth * 0.6
  
  // Motion values for the slider
  const x = useMotionValue(0)
  
  // Add spring physics for smoother return animation
  const springX = useSpring(x, { stiffness: 500, damping: 30 })
  
  // Dynamic background gradient based on slide position
  const progress = useTransform(x, [0, slideThreshold], [0, 1])
  const background = useTransform(
    progress,
    [0, 1],
    ["linear-gradient(90deg, #6c5ce7 0%, #8c7ae6 100%)", 
     "linear-gradient(90deg, #00b894 0%, #00cec9 100%)"]
  )
  
  // Dynamic opacity for chevron icons
  const arrowOpacity = useTransform(progress, [0, 0.8], [1, 0])
  
  // Text for slider changes based on progress
  const sliderText = useTransform(
    progress,
    [0, 0.8, 1],
    ["Slide to Get Started", "Get Started...", "Welcome!"]
  )
  
  // Carousel text rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % carouselTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#181826] text-white">
      <div className="w-full max-w-md flex flex-col items-center relative">
        
        {/* Image with gradient overlay */}
        <div className="w-full flex justify-center items-center mb-10 relative">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#181826] to-transparent z-20 pointer-events-none" />
          <div className="rounded-3xl overflow-hidden relative z-10">
            <Image
              src={image}
              alt="Movie Poster Collage"
              width={500}
              height={600}
              className="object-cover max-h-[80%]"
            />
          </div>
          
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#181826] to-transparent z-20 pointer-events-none" />
        </div>
        
        {/* Carousel Text with smooth transitions */}
        <motion.div 
          className="text-center mb-4 relative z-30 h-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={index}
          transition={{ duration: 0.5 }}
        >
          {carouselTexts[index].map((line, i) => (
            <motion.h1 
              key={i} 
              className="text-4xl font-bold mb-1"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {line}
            </motion.h1>
          ))}
        </motion.div>
        
        {/* Pagination dots */}
        <div className="flex gap-2 items-center justify-center mb-8 relative z-30">
          {carouselTexts.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full bg-white"
              animate={{
                width: index === i ? 24 : 12,
                height: 12,
                opacity: index === i ? 1 : 0.3
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        
        {/* Improved slider */}
        <div 
          ref={containerRef}
          className="flex w-full max-w-md mx-auto relative px-6 z-30 rounded-full overflow-hidden mb-4"
        >
          <div className="relative w-full h-16 bg-white/10 backdrop-blur-sm rounded-full">
            <motion.div
              className="absolute h-16 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
              style={{ 
                width: sliderWidth * 0.8,
                background,
                x: springX
              }}
              drag="x"
              dragConstraints={{ left: 0, right: slideThreshold }}
              dragElastic={0.1}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (info.offset.x > slideThreshold * 0.8) {
                  // Animate to the end before redirecting
                  x.set(slideThreshold)
                  setTimeout(() => {
                    router.push("/auth/create-account")
                  }, 300)
                } else {
                  // Spring back to start
                  x.set(0)
                }
              }}
            >
              <motion.span 
                className="font-medium text-white"
                style={{ opacity: useTransform(progress, [0.9, 1], [1, 0]) }}
              >
                {sliderText}
              </motion.span>
            </motion.div>
            
            {/* Arrow indicators */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-end px-6 text-white/60 pointer-events-none"
              style={{ opacity: arrowOpacity }}
            >
              <div className="flex space-x-1">
                <ChevronRight className="w-6 h-6 text-white animate-pulse" />
                <ChevronRight className="w-6 h-6 text-white animate-pulse" style={{ animationDelay: "0.1s" }} />
                <ChevronRight className="w-6 h-6 text-white animate-pulse" style={{ animationDelay: "0.2s" }} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}