"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterComponentProps {
  onClick: () => void
  onApplyFilters: (filteredMovies: FilteredMovie[]) => void
}

interface FilteredMovie {
  movie_id: number
  title: string
  overview: string
  poster_path: string
  release_date: string
  rating: string
  language: string
  genres: string[]
  otts: {
    ott_id: number
    name: string
    logo_url: string
  }[]
}

interface Genre {
  id: number
  name: string
}

interface Language {
  id: string
  name: string
}

export default function WatchNowFilterComponent({ onClick, onApplyFilters }: FilterComponentProps) {
  const [minRating, setMinRating] = useState([0])
  const [maxRating, setMaxRating] = useState([10])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [releaseYear, setReleaseYear] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("rating")
  const [genres, setGenres] = useState<Genre[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(false)

  // Generate years from 1900 to current year
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i)

  useEffect(() => {
    // Fetch genres
    fetch("https://suggesto.xyz/App/api.php?gofor=genreslist")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const cleaned = data.map((item: any) => ({
            id: item.genre_id,
            name: item.name,
          }))
          // Remove duplicates based on id
          const uniqueGenres = cleaned.filter((genre, index, self) =>
            self.findIndex(g => g.id === genre.id) === index
          )
          setGenres(uniqueGenres)
        }
      })
      .catch(error => console.error('Error fetching genres:', error))

    // Fetch languages
    fetch("https://suggesto.xyz/App/api.php?gofor=languageslist")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const cleaned = data.map((item: any) => ({
            id: item.language_id,
            name: item.name,
          }))
          // Remove duplicates based on id and filter out empty strings
          const uniqueLanguages = cleaned.filter((lang, index, self) =>
            lang.id && String(lang.id).trim() !== "" && self.findIndex(l => l.id === lang.id) === index
          )

          setLanguages(uniqueLanguages)
        }
      })
      .catch(error => console.error('Error fetching languages:', error))
  }, [])

  const handleGenreChange = (genreId: number, checked: boolean) => {
    if (checked) {
      setSelectedGenres(prev => [...prev, genreId])
    } else {
      setSelectedGenres(prev => prev.filter(id => id !== genreId))
    }
  }

  const handleReset = () => {
    setMinRating([0])
    setMaxRating([10])
    setSelectedGenres([])
    setSelectedLanguage("")
    setReleaseYear("")
    setSortBy("rating")
  }

  const handleApplyFilters = async () => {
    setLoading(true)
    try {
      // Build API URL with parameters
      const params = new URLSearchParams()

      if (selectedGenres.length > 0) {
        params.append('genres', selectedGenres.join(','))
      }

      if (selectedLanguage) {
        params.append('language', selectedLanguage)
      }

      if (releaseYear) {
        params.append('release_year', releaseYear)
      }

      params.append('min_rating', minRating[0].toString())
      params.append('max_rating', maxRating[0].toString())
      params.append('sortby', sortBy)

      const apiUrl = `https://suggesto.xyz/App/api.php?gofor=filterAndSortMovies&${params.toString()}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error('Failed to fetch filtered movies')
      }

      const filteredMovies: FilteredMovie[] = await response.json()

      // Pass filtered movies to parent component
      onApplyFilters(filteredMovies)

      // Close the filter panel
      onClick()

    } catch (error) {
      console.error('Error applying filters:', error)
      // You might want to show an error message to the user here
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#181826] text-white p-6 rounded-t-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Filters</h2>
        <button onClick={onClick} className="p-2 rounded-full bg-[#2b2b2b]">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="border-b border-gray-700 mb-14 pb-6">
        <div className="space-y-6">

          {/* Sort By Filter */}
          <div>
            <h3 className="font-medium mb-3">Sort By</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full bg-[#2b2b2b] border-gray-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#2b2b2b] border-gray-600 text-white">
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="release_date">Release Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Minimum Rating</h3>
              <span className="text-sm text-gray-400">{minRating[0]} / 10</span>
            </div>
            <Slider
              value={minRating}
              max={10}
              step={0.5}
              min={0}
              onValueChange={setMinRating}
              className="[&>span:first-child]:h-1 [&>span:first-child]:bg-[#2b2b2b] [&_[role=slider]]:bg-[#b56bbc] [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-[#b56bbc]"
            />
          </div>

          {/* Maximum Rating Filter */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Maximum Rating</h3>
              <span className="text-sm text-gray-400">{maxRating[0]} / 10</span>
            </div>
            <Slider
              value={maxRating}
              max={10}
              step={0.5}
              min={0}
              onValueChange={setMaxRating}
              className="[&>span:first-child]:h-1 [&>span:first-child]:bg-[#2b2b2b] [&_[role=slider]]:bg-[#b56bbc] [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-[#b56bbc]"
            />
          </div>

          {/* Release Year Filter */}
          <div>
            <h3 className="font-medium mb-3">Release Year</h3>
            <Select value={releaseYear} onValueChange={setReleaseYear}>
              <SelectTrigger className="w-full bg-[#2b2b2b] border-gray-600 text-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-[#2b2b2b] border-gray-600 text-white max-h-60">
                <SelectItem value="any-year">Any Year</SelectItem>
                {years.map((year) => (
                  <SelectItem key={`year-${year}`} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Language Filter */}
          <div>
            <h3 className="font-medium mb-3">Language</h3>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-full bg-[#2b2b2b] border-gray-600 text-white">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-[#2b2b2b] border-gray-600 text-white max-h-60">
                <SelectItem value="any-language">Any Language</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={`lang-${lang.id}`} value={lang.id}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Genres Filter */}
          <div>
            <h3 className="font-medium mb-3">Genres</h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {genres.map((genre) => (
                <div key={`genre-${genre.id}`} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre.id}`}
                    checked={selectedGenres.includes(genre.id)}
                    onCheckedChange={(checked) => handleGenreChange(genre.id, checked as boolean)}
                  />
                  <Label htmlFor={`genre-${genre.id}`} className="text-sm font-normal text-gray-300 cursor-pointer">
                    {genre.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 w-full bg-[#181826] px-6 py-4 flex gap-3 z-10">
        <Button
          variant="outline"
          className="flex-1 border-gray-600 text-white hover:bg-[#2b2b2b]"
          onClick={handleReset}
          disabled={loading}
        >
          Reset
        </Button>
        <Button
          className="flex-1"
          onClick={handleApplyFilters}
          disabled={loading}
        >
          {loading ? "Applying..." : "Apply Filters"}
        </Button>
      </div>
    </div>
  )
}