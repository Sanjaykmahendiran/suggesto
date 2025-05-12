"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface FilterComponentProps {
  onClick: () => void
}

export default function WatchNowFilterComponent({ onClick }: FilterComponentProps) {
  const [ratingRange, setRatingRange] = useState([5])
  const [runtimeRange, setRuntimeRange] = useState([120])

  const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
  ]

  const platforms = ["Netflix", "Prime Video", "Disney+", "HBO Max", "Apple TV+", "Hulu", "Paramount+"]

  return (
    <div className="bg-[#181826] text-white p-6 rounded-t-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Filters</h2>
        <button onClick={onClick} className="p-2 rounded-full bg-[#292938]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Rating Filter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">IMDb Rating</h3>
            <span className="text-sm text-gray-400">{ratingRange[0]}+ / 10</span>
          </div>
          <Slider
            defaultValue={ratingRange}
            max={10}
            step={0.5}
            min={0}
            onValueChange={setRatingRange}
            className="[&>span:first-child]:h-1 [&>span:first-child]:bg-[#292938] [&_[role=slider]]:bg-[#9370ff] [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-[#9370ff]"
          />
        </div>

        {/* Runtime Filter */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Runtime</h3>
            <span className="text-sm text-gray-400">
              {runtimeRange[0] < 60
                ? `${runtimeRange[0]} min`
                : `${Math.floor(runtimeRange[0] / 60)}h ${runtimeRange[0] % 60}m`}
            </span>
          </div>
          <Slider
            defaultValue={runtimeRange}
            max={240}
            step={15}
            min={30}
            onValueChange={setRuntimeRange}
            className="[&>span:first-child]:h-1 [&>span:first-child]:bg-[#292938] [&_[role=slider]]:bg-[#9370ff] [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-[#9370ff]"
          />
        </div>

        {/* Genres Filter */}
        <div>
          <h3 className="font-medium mb-3">Genres</h3>
          <div className="grid grid-cols-2 gap-2">
            {genres.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox id={`genre-${genre}`} />
                <Label htmlFor={`genre-${genre}`} className="text-sm font-normal text-gray-300 cursor-pointer">
                  {genre}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Platforms Filter */}
        <div>
          <h3 className="font-medium mb-3">Platforms</h3>
          <div className="grid grid-cols-2 gap-2">
            {platforms.map((platform) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox id={`platform-${platform}`} />
                <Label htmlFor={`platform-${platform}`} className="text-sm font-normal text-gray-300 cursor-pointer">
                  {platform}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1">
            Reset
          </Button>
          <Button className="flex-1 bg-[#9370ff] hover:bg-[#8360ef]" onClick={onClick}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
