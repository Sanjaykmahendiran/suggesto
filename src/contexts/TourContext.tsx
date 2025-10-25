"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface TourContextType {
  activeTour: string | null
  startTour: (tourId: string) => void
  completeTour: (tourId: string) => void
  stopTour: () => void
  skipTour: (tourId: string) => void
  resetTour: (tourId: string) => void
  isTourCompleted: (tourId: string) => boolean
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const [activeTour, setActiveTour] = useState<string | null>(null)

  const startTour = (tourId: string) => {
    setActiveTour(tourId)
  }

  const completeTour = (tourId: string) => {
    // Use localStorage for persistence in APK
    if (typeof window !== 'undefined') {
      localStorage.setItem(`hasSeenTour_${tourId}`, 'true')
    }
    setActiveTour(null)
  }

  const stopTour = () => {
    setActiveTour(null)
  }

  const skipTour = (tourId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`hasSeenTour_${tourId}`, 'true')
    }
    setActiveTour(null)
  }

  const resetTour = (tourId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`hasSeenTour_${tourId}`)
    }
  }

  const isTourCompleted = (tourId: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`hasSeenTour_${tourId}`) === 'true'
    }
    return false
  }

  return (
    <TourContext.Provider value={{ 
      activeTour, 
      startTour, 
      completeTour, 
      stopTour, 
      skipTour, 
      resetTour, 
      isTourCompleted 
    }}>
      {children}
    </TourContext.Provider>
  )
}

export const useTour = () => {
  const context = useContext(TourContext)
  if (!context) throw new Error('useTour must be used within TourProvider')
  return context
}