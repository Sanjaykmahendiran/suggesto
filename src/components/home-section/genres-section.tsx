"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Genre {
  genre_id: number
  movie_count: number
  name: string
  image: string
  homepage: number
  status: number
}

type GenresSectionProps = {
  genres: Genre[]
}

export default function GenresSection({ genres }: GenresSectionProps) {
  const router = useRouter()

  return (
    <div className="w-full px-4 mb-8" data-tour-target="genres-section">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Genres</h2>
          <Button
            variant="ghost"
            className="p-0 text-sm bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent"
            onClick={() => router.push("/add-movie")}
          >
            See All
          </Button>
        </div>

        {/* Genres Grid */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {genres.map((genre) => (
            <div
              key={genre.genre_id}
              onClick={() => router.push(`/add-movie?genre_id=${genre.genre_id}`)}
              className="relative flex-shrink-0 w-46 h-26 rounded-xl overflow-hidden cursor-pointer transition-transform duration-200 bg-cover bg-center"
              style={{
                backgroundImage: `url(https://suggesto.xyz/App/${genre.image})`,
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60" />

              {/* Content */}
              <div className="absolute inset-0 px-4 flex flex-col justify-end mb-2">
                <h3 className="text-white font-semibold text-lg">{genre.name}</h3>
                <p className="text-white/90 text-sm">
                  {genre.movie_count.toString().padStart(2, '0')} Movies
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
