"use client"

import { useState, useEffect } from 'react'

interface CoinAnimationProps {
  show: boolean
  coinsEarned?: number
  message?: string
  onAnimationEnd?: () => void
  duration?: number
}

const CoinAnimation: React.FC<CoinAnimationProps> = ({
  show,
  coinsEarned = 5,
  message = "Coins Earned!",
  onAnimationEnd,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onAnimationEnd?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onAnimationEnd])

  const coinAnimationStyles = `
    @keyframes coinFly {
      0% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
      50% {
        transform: translateY(-50px) scale(1.2);
        opacity: 0.8;
      }
      100% {
        transform: translateY(-100px) scale(0.8);
        opacity: 0;
      }
    }
    
    @keyframes walletBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes walletSlideDown {
      0% { transform: translateY(-100px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes walletSlideUp {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-100px); opacity: 0; }
    }
    
    .coin-animation {
      animation: coinFly 1s ease-out forwards;
    }
    
    .wallet-bounce {
      animation: walletBounce 0.5s ease-in-out;
    }
    
    .wallet-slide-down {
      animation: walletSlideDown 0.3s ease-out;
    }
    
    .wallet-slide-up {
      animation: walletSlideUp 0.3s ease-in forwards;
    }
  `

  if (!isVisible) return null

  return (
    <>
      <style>{coinAnimationStyles}</style>
      
      {/* Wallet at top */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 wallet-slide-down">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-lg shadow-lg wallet-bounce">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              💰
            </div>
            <span className="text-black font-bold">
              +{coinsEarned} {message}
            </span>
          </div>
        </div>
      </div>

      {/* Flying coins */}
      {[...Array(coinsEarned)].map((_, index) => (
        <div
          key={index}
          className="fixed z-40 pointer-events-none"
          style={{
            left: `calc(50% - 10px + ${(index - Math.floor(coinsEarned / 2)) * 20}px)`,
            bottom: '80px',
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className="coin-animation">
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-xs">
              💰
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default CoinAnimation