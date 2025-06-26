import { Star, ArrowRight } from "lucide-react"

export default function GoPremiumBanner() {
  return (
    <div className="flex justify-center p-4">
      <div className="relative max-w-xs w-full">
        <div className="bg-gradient-to-r from-[#b56bbc] to-purple-500 rounded-xl px-4 py-3 flex items-center gap-3 text-white shadow-md relative overflow-hidden">
          {/* Star icon with badge styling */}
          <div className="bg-white/20 rounded-full p-1.5">
            <Star className="w-4 h-4 text-white" strokeWidth={2} />
          </div>

          {/* Text content */}
          <div className="flex-1">
            <h3 className="font-bold text-base">Go Premium!</h3>
            <p className="text-xs text-white/80">Become NVXT member & enjoy all features hassle-free!</p>
          </div>

          {/* Arrow icon */}
          <div className="bg-white/20 rounded-full p-1.5">
            <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
          </div>

          {/* Decorative hearts */}
          <div className="absolute -top-1 -right-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 17.5C9.5 17.5 9 17.35 8.65 17.15C5.15 14.85 1.5 11.59 1.5 7.5C1.5 4.5 3.9 2 6.75 2C8.1 2 9.35 2.5 10.25 3.4C11.15 2.5 12.4 2 13.75 2C16.6 2 19 4.5 19 7.5C19 11.59 15.35 14.85 11.85 17.15C11.5 17.35 11 17.5 10.5 17.5H10Z"
                fill="#D580FF"
              />
            </svg>
          </div>
          <div className="absolute -bottom-1 -left-1">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 17.5C9.5 17.5 9 17.35 8.65 17.15C5.15 14.85 1.5 11.59 1.5 7.5C1.5 4.5 3.9 2 6.75 2C8.1 2 9.35 2.5 10.25 3.4C11.15 2.5 12.4 2 13.75 2C16.6 2 19 4.5 19 7.5C19 11.59 15.35 14.85 11.85 17.15C11.5 17.35 11 17.5 10.5 17.5H10Z"
                fill="#D580FF"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
