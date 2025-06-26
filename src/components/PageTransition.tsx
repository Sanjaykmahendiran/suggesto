"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode, createContext, useContext, useState, useEffect } from "react"

interface PageTransitionContextType {
  direction: 'left' | 'right'
  setDirection: (direction: 'left' | 'right') => void
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  direction: 'right',
  setDirection: () => {}
})

export const usePageTransition = () => useContext(PageTransitionContext)

interface PageTransitionProviderProps {
  children: ReactNode
}

// Define the order of pages for determining direction
const pageOrder = [
  '/home',
  '/watch-list', 
  '/watch-room',
  '/suggest',
  '/top-10-wall'
]

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname()
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [previousPath, setPreviousPath] = useState<string>('')

  useEffect(() => {
    if (previousPath && previousPath !== pathname) {
      const prevIndex = pageOrder.indexOf(previousPath)
      const currentIndex = pageOrder.indexOf(pathname)
      
      if (prevIndex !== -1 && currentIndex !== -1) {
        setDirection(currentIndex > prevIndex ? 'right' : 'left')
      }
    }
    setPreviousPath(pathname)
  }, [pathname, previousPath])

  return (
    <PageTransitionContext.Provider value={{ direction, setDirection }}>
      {children}
    </PageTransitionContext.Provider>
  )
}

interface PageTransitionWrapperProps {
  children: ReactNode
  className?: string
}

export function PageTransitionWrapper({ children, className = "" }: PageTransitionWrapperProps) {
  const pathname = usePathname()
  const { direction } = usePageTransition()

  const variants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '-100%' : '100%',
      opacity: 0
    })
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.3
        }}
        className={`${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}