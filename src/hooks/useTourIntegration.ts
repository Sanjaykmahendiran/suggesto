"use client"

import React, { useEffect } from 'react'
import { useTour } from '@/contexts/TourContext'

export const useTourIntegration = (
  tourId: string, 
  dependencies: React.DependencyList = [],
  condition: boolean = true
) => {
  const { startTour } = useTour()

  useEffect(() => {
    if (!condition || typeof window === 'undefined') return
    
    const hasSeenTour = localStorage.getItem(`hasSeenTour_${tourId}`)
    if (!hasSeenTour) {
      // Delay to ensure DOM is ready - important for APK
      const timer = setTimeout(() => {
        startTour(tourId)
      }, 800) // Increased delay for mobile
      
      return () => clearTimeout(timer)
    }
  }, [tourId, startTour, condition, ...dependencies])
}