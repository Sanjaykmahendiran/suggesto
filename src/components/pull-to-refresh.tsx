"use client"

import React from "react"

interface Props {
  pullDistance: number
  isRefreshing: boolean
  isDragging: boolean
  pullThreshold: number
}

export default function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  isDragging,
  pullThreshold,
}: Props) {
  const refreshIndicatorOpacity = Math.min(pullDistance / pullThreshold, 1)
  const refreshIconRotation = (pullDistance / pullThreshold) * 180

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10"
      style={{
        transform: `translateY(${-60 + pullDistance}px)`,
        opacity: refreshIndicatorOpacity,
        transition: isDragging ? "none" : "all 0.3s ease-out",
      }}
    >
      <div className="flex items-center gap-2 bg-[#2b2b2b] px-4 py-2 rounded-full">
        {isRefreshing ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-300">Refreshing...</span>
          </>
        ) : (
          <>
            <div
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: `rotate(${refreshIconRotation}deg)` }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary">
                <path
                  d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-sm text-gray-300">
              {pullDistance >= pullThreshold ? "Release to refresh" : "Pull to refresh"}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
