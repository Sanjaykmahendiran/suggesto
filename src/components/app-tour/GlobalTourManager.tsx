"use client"

import { useTour } from '@/contexts/TourContext'
import ProductTour from '@/components/app-tour/pagetour'
import { usePathname } from 'next/navigation'

export const GlobalTourManager = () => {
  const { activeTour, completeTour } = useTour()
  const pathname = usePathname()

  if (!activeTour) return null

  return (
    <ProductTour
      tourId={activeTour}
      isVisible={true}
      onComplete={() => completeTour(activeTour)}
      route={pathname}
    />
  )
}