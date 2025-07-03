"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"

interface RatingPopupProps {
  show: boolean
  title: string
  userRating: number
  userReview: string
  hoverRating: number
  submittingRating: boolean
  onClose: () => void
  onRatingChange: (value: number) => void
  onReviewChange: (value: string) => void
  onSubmit: (buttonElement: HTMLElement) => void
  setHoverRating: (value: number) => void
}

const RatingPopup: React.FC<RatingPopupProps> = ({
  show,
  title,
  userRating,
  userReview,
  hoverRating,
  submittingRating,
  onClose,
  onRatingChange,
  onReviewChange,
  onSubmit,
  setHoverRating,
}) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#1f1f21] rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Rate & Review</h3>
          <button
            onClick={() => {
              onClose()
              onRatingChange(0)
              onReviewChange("")
              setHoverRating(0)
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Movie Title */}
        <p className="text-gray-300 text-center mb-4">{title}</p>

        {/* Star Slider Rating */}
        <div className="flex flex-col items-center mb-6 px-2">
          <div className="w-full relative">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={userRating}
              onChange={(e) => onRatingChange(Number(e.target.value))}
              className="w-full appearance-none custom-star-thumb"
              style={{
                "--slider-value": `${(userRating / 10) * 100}%`,
              } as React.CSSProperties & Record<string, any>}
            />
          </div>

          <div className="flex justify-between w-full mt-3 text-sm">
            <span className="text-gray-400 italic">Slide to rate →</span>
            <span className="text-white font-semibold">{userRating}/10</span>
          </div>

          <p className="mt-4 text-center text-2xl text-white font-[Pacifico]">
            Your ratings matter!
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            They help others decide what to watch next.
          </p>
        </div>

        {/* Review Textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Review (Optional)
          </label>
          <textarea
            value={userReview}
            onChange={(e) => onReviewChange(e.target.value)}
            placeholder="Share your thoughts about this movie..."
            className="w-full px-3 py-2 bg-[#2b2b2b] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1">
            {userReview.length}/500 characters
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-600 transition-colors"
            disabled={submittingRating}
          >
            Cancel
          </button>
          <button
            onClick={(e) => onSubmit(e.currentTarget)}
            disabled={submittingRating || userRating === 0}
            className={cn(
              "flex-1 px-4 py-2 rounded-md font-semibold transition-colors",
              userRating === 0
                ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white ",
              submittingRating && "opacity-70"
            )}
          >
            {submittingRating ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RatingPopup
