"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Sparkles, Home } from 'lucide-react'
import { tourConfigs } from '@/lib/tourConfig'

type ProductTourProps = {
  tourId: string
  isVisible: boolean
  onComplete: () => void
  route?: string
}

const ProductTour = ({ tourId, isVisible, onComplete, route }: ProductTourProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
    position: 'bottom' as 'top' | 'bottom' | 'left' | 'right',
    arrowPosition: { x: '50%', y: '50%' }
  })
  const overlayRef = useRef<HTMLDivElement>(null)

  // Get tour configuration dynamically
  const tourConfig = tourConfigs[tourId]
  const tourSteps = tourConfig?.steps || []

  // Route-based theme colors
  const routeColors = {
    "/home": { from: "#b56bbc", to: "#7a71c4" },
    "/watch-list": { from: "#ff968b", to: "#ff2251" },
    "/watch-room": { from: "#15F5FD", to: "#036CDA" },
    "/suggest": { from: "#ff7db8", to: "#ee2a7b" },
    "/friends": { from: "#B3EB50", to: "#1ea896" },
    "default": { from: "#b56bbc", to: "#7a71c4" }
  }

  // Get current route colors
  const currentRoute = route || "default"
  const currentColors = routeColors[currentRoute as keyof typeof routeColors] || routeColors.default

  // Generate theme colors from route colors
  const generateThemeFromRoute = (colors: { from: string; to: string }) => {
    return {
      primary: colors.from,
      secondary: colors.to,
      border: colors.from,
      glow: `${colors.from}66` // Adding opacity to primary color
    }
  }

  const currentTheme = generateThemeFromRoute(currentColors)

  // Add validation
  if (!tourConfig || tourSteps.length === 0) {
    console.warn(`Tour configuration not found for: ${tourId}`)
    return null
  }

  const currentStepData = tourSteps[currentStep]
  const isPageIntro = !currentStepData.target || currentStepData.target === 'page-intro'

  const calculatePositions = () => {
    const step = tourSteps[currentStep]
    
    // Skip calculation for page intro steps - they will be positioned fixed at center
    if (isPageIntro) {
      return
    }

    const targetElement = document.querySelector(`[data-tour-target="${step.target}"]`) as HTMLElement

    if (!targetElement) return

    const rect = targetElement.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Calculate highlight position
    const padding = 8
    setHighlightPosition({
      x: rect.left + scrollX - padding,
      y: rect.top + scrollY - padding,
      width: rect.width + (padding * 2),
      height: rect.height + (padding * 2)
    })

    // Calculate tooltip position with better visibility and avoidance logic
    const tooltipWidth = Math.min(320, viewportWidth - 40)
    const tooltipHeight = 180
    const spacing = 24
    const margin = 20
    const topRightBuffer = 60 // Extra buffer to avoid top-right elements

    let tooltipX = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2)
    let tooltipY = rect.top + scrollY
    let position = step.position
    let arrowPosition = { x: '50%', y: '50%' }

    // Target element center for arrow calculations
    const targetCenterX = rect.left + scrollX + (rect.width / 2)
    const targetCenterY = rect.top + scrollY + (rect.height / 2)

    // Check available space in all directions
    const spaceTop = rect.top - margin
    const spaceBottom = viewportHeight - rect.bottom - margin
    const spaceLeft = rect.left - margin
    const spaceRight = viewportWidth - rect.right - margin

    // Determine best position based on available space
    const canFitTop = spaceTop >= tooltipHeight + spacing
    const canFitBottom = spaceBottom >= tooltipHeight + spacing
    const canFitLeft = spaceLeft >= tooltipWidth + spacing
    const canFitRight = spaceRight >= tooltipWidth + spacing

    // Special handling for top-right area elements
    const isInTopRight = rect.right > viewportWidth - 200 && rect.top < 100

    if (isInTopRight) {
      // For top-right elements, prefer left or bottom positioning
      if (canFitLeft) {
        position = 'left'
      } else if (canFitBottom) {
        position = 'bottom'
      } else if (canFitTop) {
        position = 'top'
      } else {
        position = 'right'
      }
    } else {
      // Use preferred position or find best alternative
      if (position === 'top' && !canFitTop) {
        position = canFitBottom ? 'bottom' : canFitRight ? 'right' : 'left'
      } else if (position === 'bottom' && !canFitBottom) {
        position = canFitTop ? 'top' : canFitRight ? 'right' : 'left'
      } else if (position === 'left' && !canFitLeft) {
        position = canFitRight ? 'right' : canFitBottom ? 'bottom' : 'top'
      } else if (position === 'right' && !canFitRight) {
        position = canFitLeft ? 'left' : canFitBottom ? 'bottom' : 'top'
      }
    }

    // Calculate position based on final decision
    switch (position) {
      case 'top':
        tooltipX = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2)
        tooltipY = rect.top + scrollY - tooltipHeight - spacing
        break
      case 'bottom':
        tooltipX = rect.left + scrollX + (rect.width / 2) - (tooltipWidth / 2)
        tooltipY = rect.top + scrollY + rect.height + spacing
        break
      case 'left':
        tooltipX = rect.left + scrollX - tooltipWidth - spacing
        tooltipY = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2)
        break
      case 'right':
        tooltipX = rect.left + scrollX + rect.width + spacing
        tooltipY = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2)
        break
    }

    // Final boundary adjustments with special top-right handling
    if (tooltipX < margin) {
      tooltipX = margin
    } else if (tooltipX + tooltipWidth > viewportWidth - margin) {
      tooltipX = viewportWidth - tooltipWidth - margin
    }

    if (tooltipY < margin) {
      tooltipY = margin
    } else if (tooltipY + tooltipHeight > viewportHeight - margin) {
      tooltipY = viewportHeight - tooltipHeight - margin
    }

    // Extra check for top-right area - ensure tooltip doesn't cover important UI
    if (tooltipY < topRightBuffer && tooltipX + tooltipWidth > viewportWidth - 200) {
      // Move tooltip down or to the left
      if (rect.top + scrollY + rect.height + spacing + tooltipHeight < viewportHeight - margin) {
        tooltipY = rect.top + scrollY + rect.height + spacing
        position = 'bottom'
      } else {
        tooltipX = Math.max(margin, rect.left + scrollX - tooltipWidth - spacing)
        tooltipY = rect.top + scrollY + (rect.height / 2) - (tooltipHeight / 2)
        position = 'left'
      }
    }

    // Calculate arrow position based on final tooltip position
    if (position === 'top' || position === 'bottom') {
      const relativeArrowX = ((targetCenterX - tooltipX) / tooltipWidth) * 100
      arrowPosition.x = `${Math.max(10, Math.min(90, relativeArrowX))}%`
    } else {
      const relativeArrowY = ((targetCenterY - tooltipY) / tooltipHeight) * 100
      arrowPosition.y = `${Math.max(10, Math.min(90, relativeArrowY))}%`
    }

    setTooltipPosition({ x: tooltipX, y: tooltipY, position, arrowPosition })
  }

  useEffect(() => {
    if (isVisible && tourSteps[currentStep]) {
      // Initial calculation
      calculatePositions()

      // Recalculate after a short delay for DOM updates
      const timer = setTimeout(() => {
        calculatePositions()
      }, 100)

      const handleResize = () => {
        calculatePositions()
      }

      const handleScroll = () => {
        calculatePositions()
      }

      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [currentStep, isVisible])

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    onComplete()
  }

  const getHighlightAnimation = (type: string) => {
    switch (type) {
      case 'pulse':
        return {
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
          transition: { duration: 2, repeat: Infinity }
        }
      case 'bounce':
        return {
          y: [0, -5, 0],
          transition: { duration: 1.5, repeat: Infinity }
        }
      case 'shake':
        return {
          x: [0, -2, 2, -2, 0],
          transition: { duration: 0.5, repeat: Infinity, repeatDelay: 1 }
        }
      case 'scale':
        return {
          scale: [1, 1.1, 1],
          transition: { duration: 1, repeat: Infinity }
        }
      case 'sparkle':
        return {
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0],
          transition: { duration: 2, repeat: Infinity }
        }
      case 'slide':
        return {
          y: [0, -3, 0],
          transition: { duration: 1.5, repeat: Infinity }
        }
      case 'glow':
      default:
        return {
          boxShadow: [
            `0 0 0 0 ${currentTheme.glow}`,
            `0 0 0 10px ${currentTheme.glow.replace('0.4', '0.1')}`,
            `0 0 0 0 ${currentTheme.glow}`
          ],
          transition: { duration: 2, repeat: Infinity }
        }
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Backdrop - darker for page intro */}
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundColor: isPageIntro ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' 
          }} 
        />

        {/* Highlight with themed colors - only show if not page intro */}
        {!isPageIntro && (
          <motion.div
            className="absolute rounded-lg border-2 bg-transparent"
            style={{
              width: highlightPosition.width,
              height: highlightPosition.height,
              transform: `translate(${highlightPosition.x}px, ${highlightPosition.y}px)`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderColor: currentTheme.border,
            }}
            animate={getHighlightAnimation(currentStepData.animation || 'glow')}
          />
        )}

        {/* Tooltip - Mobile optimized with themed colors */}
        <motion.div
          key={`tooltip-${currentStep}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: isPageIntro ? 0 : tooltipPosition.x,
            y: isPageIntro ? 0 : tooltipPosition.y
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`absolute rounded-xl shadow-2xl border pointer-events-auto ${
            isPageIntro 
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
              : ''
          }`}
          style={{
            width: Math.min(320, window.innerWidth - 40),
            background: isPageIntro 
              ? `linear-gradient(135deg, ${currentTheme.primary}15 0%, ${currentTheme.secondary}15 100%), linear-gradient(135deg, #2b2b2b 0%, #333342 100%)`
              : 'linear-gradient(135deg, #2b2b2b 0%, #333342 100%)',
            borderColor: `${currentTheme.border}30`,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
        >
          {/* Arrow - No animation with themed colors - hide for page intro */}
          {!isPageIntro && (
            <div
              className="absolute w-3 h-3 border transform rotate-45 z-10"
              style={{
                backgroundColor: '#2b2b2b',
                borderColor: `${currentTheme.border}30`,
                left: tooltipPosition.position === 'top' || tooltipPosition.position === 'bottom'
                  ? tooltipPosition.arrowPosition.x
                  : tooltipPosition.position === 'left' ? '-6px' : 'auto',
                right: tooltipPosition.position === 'right' ? '-6px' : 'auto',
                top: tooltipPosition.position === 'left' || tooltipPosition.position === 'right'
                  ? tooltipPosition.arrowPosition.y
                  : tooltipPosition.position === 'bottom' ? '-6px' : 'auto',
                bottom: tooltipPosition.position === 'top' ? '-6px' : 'auto',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                borderLeftColor: tooltipPosition.position === 'right' ? 'transparent' : undefined,
                borderTopColor: tooltipPosition.position === 'bottom' ? 'transparent' : undefined,
                borderRightColor: tooltipPosition.position === 'left' ? 'transparent' : undefined,
                borderBottomColor: tooltipPosition.position === 'top' ? 'transparent' : undefined,
              }}
            />
          )}

          <div className="p-4 relative z-20">
            {/* Header with special styling for page intro */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isPageIntro && (
                  <div 
                    className="p-2 rounded-full" 
                    style={{ backgroundColor: `${currentTheme.primary}20` }}
                  >
                    <Home 
                      size={16} 
                      style={{ color: currentTheme.primary }} 
                    />
                  </div>
                )}
                <h3 className="text-white font-semibold text-sm">
                  {currentStepData.title}
                </h3>
              </div>
              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {currentStepData.message}
            </p>

            {/* Progress bar with themed colors */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-700 rounded-full h-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-1 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {currentStep + 1} / {tourSteps.length}
              </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${currentStep === 0
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
              >
                <ArrowLeft size={14} />
                Previous
              </button>

              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-white text-sm transition-colors px-2 py-1 rounded hover:bg-gray-700"
              >
                Skip Tour
              </button>

              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-4 py-1.5 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all transform hover:scale-105"
                style={{
                  background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`
                }}
              >
                {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                {currentStep === tourSteps.length - 1 ? (
                  <Sparkles size={14} />
                ) : (
                  <ArrowRight size={14} />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ProductTour