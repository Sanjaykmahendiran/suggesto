"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilterComponentProps {
    onClick: () => void;
}

export default function FilterComponent({ onClick }: FilterComponentProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Action"])
  const [selectedType, setSelectedType] = useState<string>("Free")
  const [selectedRatings, setSelectedRatings] = useState<number[]>([3, 4, 5])

  const handleCategoryToggle = (category: string) => {
    if (category === "All") {
      setSelectedCategories(["All"])
    } else {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories.filter((c) => c !== "All"), category]

      setSelectedCategories(newCategories.length ? newCategories : ["All"])
    }
  }

  const handleTypeToggle = (type: string) => {
    setSelectedType(type)
  }

  const handleRatingToggle = (rating: number) => {
    setSelectedRatings(
      selectedRatings.includes(rating) ? selectedRatings.filter((r) => r !== rating) : [...selectedRatings, rating],
    )
  }

  const resetFilters = () => {
    setSelectedCategories(["All"])
    setSelectedType("")
    setSelectedRatings([])
  }

  return (
    <div className="w-full bg-[#1a1a24] text-white p-4 rounded-t-2xl pt-10 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <X className="h-5 w-5" onClick={onClick} />
          <span className="font-medium">Filter</span>
        </div>
        <button className="text-[#6c5ce7] text-sm" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-base font-medium mb-3">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {["All", "Action", "Adventure", "Mystery", "Fantasy", "Others"].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedCategories.includes(category) ? "bg-[#6c5ce7]" : "bg-[#2d2d3a]"
                }`}
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <h3 className="text-base font-medium mb-3">Type</h3>
          <div className="flex gap-2">
            {["Premium", "Free"].map((type) => (
              <button
                key={type}
                className={`px-4 py-2 rounded-full text-sm ${selectedType === type ? "bg-[#6c5ce7]" : "bg-[#2d2d3a]"}`}
                onClick={() => handleTypeToggle(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Star Rating */}
        <div>
          <h3 className="text-base font-medium mb-3">Star Rating</h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className={`px-3 py-2 rounded-full flex items-center ${
                  selectedRatings.includes(rating) ? "bg-[#2d2d3a]" : "bg-[#2d2d3a]"
                }`}
                onClick={() => handleRatingToggle(rating)}
              >
                {Array(rating)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Filters Button */}
      <Button className="w-full mt-6 bg-[#6c5ce7] hover:bg-[#5b4dd1] text-white py-3 rounded-md">Apply Filters</Button>
    </div>
  )
}
