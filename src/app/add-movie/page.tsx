"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { type ChangeEvent, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, Plus, ChevronRight, X, ChevronDown, Star } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import NotFound from "@/components/notfound"
import MovieRequestDialog from "@/components/MovieRequestDialog"
import { Movie, Genre, Language, OTT, MovieResult } from "@/app/add-movie/type"
import { SearchResultsSkeleton, FilteredResultsSkeleton } from "@/app/add-movie/_components/loading"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

const AddMoviePage = () => {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [filteredResults, setFilteredResults] = useState<MovieResult[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [otts, setOtts] = useState<OTT[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [showAllCollections, setShowAllCollections] = useState(false)
  const [showAllOtts, setShowAllOtts] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFilter, setCurrentFilter] = useState<{ type: string, name: string } | null>(null)

  // Fetch genres, languages, and OTTs when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch genres
        const genresResponse = await fetch("https://suggesto.xyz/App/api.php?gofor=genreslist")
        const genresData = await genresResponse.json()
        setGenres(genresData)

        // Fetch languages
        const languagesResponse = await fetch("https://suggesto.xyz/App/api.php?gofor=languageslist")
        const languagesData = await languagesResponse.json()
        setLanguages(languagesData)

        // Fetch OTT platforms
        const ottResponse = await fetch("https://suggesto.xyz/App/api.php?gofor=ottlist")
        const ottData = await ottResponse.json()
        setOtts(ottData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    setCurrentFilter(null)
    setFilteredResults([])

    if (term.length > 1) {
      setIsLoading(true)
      try {
        const response = await fetch(
          `https://suggesto.xyz/App/api.php?gofor=tsearchmovies&searchtext=${encodeURIComponent(term)}`
        )
        const data = await response.json()
        setSearchResults(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error searching movies:", error)
        setSearchResults([])
      } finally {
        setIsLoading(false)
      }
    } else {
      setSearchResults([])
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setFilteredResults([])
    setCurrentFilter(null)
  }

  const handleGenreClick = async (genreId: number, genreName: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'genre', name: genreName })
    setIsLoading(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&genre=${genreId}`)
      const data = await response.json()
      setFilteredResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching genre movies:", error)
      setFilteredResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageClick = async (languageCode: string, languageName: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'language', name: languageName })
    setIsLoading(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&language=${languageCode}`)
      const data = await response.json()
      setFilteredResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching language movies:", error)
      setFilteredResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOttClick = async (ottId: number, ottName: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'ott', name: ottName })
    setIsLoading(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&ott=${ottId}`)
      const data = await response.json()
      setFilteredResults(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching OTT movies:", error)
      setFilteredResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const visibleGenres = showAllGenres ? genres : genres.slice(0, 6)
  const visibleLanguages = showAllCollections ? languages : languages.slice(0, 6)
  const visibleOtts = showAllOtts ? otts : otts.slice(0, 6)

  // Get poster URL with base path
  const getPosterUrl = (posterPath: string) => {
    if (posterPath.startsWith('http')) {
      return posterPath
    }
    return `https://suggesto.xyz/App/${posterPath}`
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Check if we should show results (either search results or filtered results)
  const showingResults = searchTerm.length > 1 || currentFilter

  return (

    // <PageTransitionWrapper>
      <div className="min-h-screen ">
        <header className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold">Search</h1>
          </div>
        </header>

        <div className="p-4">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type=""
              value={searchTerm}
              onChange={handleSearch}
              className="bg-[#292938] text-white w-full pl-10 pr-10 py-3 rounded-full focus:outline-none"
              placeholder="Actor, title, or genre"
            />
            {(searchTerm || currentFilter) && (
              <button className="absolute inset-y-0 right-3 flex items-center" onClick={clearSearch}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Current Filter Display */}
          {currentFilter && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-400">Showing results for:</span>
              <span className="bg-[#6c5ce7] px-3 py-1 rounded-full text-sm font-medium">
                {currentFilter.name}
              </span>
            </div>
          )}

          {/* Search Results */}
          {searchTerm.length > 1 && (
            <div className="space-y-4">
              {isLoading ? (
                <SearchResultsSkeleton />
              ) : searchResults.length === 0 ? (
                <NotFound
                  title="We are sorry, we can not find the movie :("
                  description="Find your favorite movie by entering the title" />
              ) : (
                searchResults.map((result) => {
                  // Check if result has only id (TMDB result) or full movie data
                  const isSimpleResult = result.id && !result.movie_id;
                  const linkHref = isSimpleResult
                    ? `/movie-detail-page?tmdb_movie_id=${result.id}`
                    : `/movie-detail-page?movie_id=${result.movie_id}`;

                  return (
                    <Link key={result.id || result.movie_id} href={linkHref}>
                      <div className="flex gap-4 py-3 border-b border-gray-800 hover:bg-[#292938] rounded-lg px-2 transition-colors">
                        {/* <div className="flex-shrink-0 w-16 h-24 relative rounded-md overflow-hidden">
                        {result.poster_path ? (
                          <Image
                            src={getPosterUrl(result.poster_path)}
                            alt={result.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </div> */}
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{result.title}</h3>
                          <p className="text-gray-400 text-sm mb-1">{formatDate(result.release_date)}</p>
                          <p className="text-gray-300 text-sm line-clamp-2">{result.overview}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* Filtered Results (Genre/Language/OTT) */}
          {currentFilter && (
            <div className="space-y-4">
              {isLoading ? (
                <FilteredResultsSkeleton />
              ) : filteredResults.length === 0 ? (
                <NotFound
                  title="We are sorry, we can not find the movie :("
                  description="Find your favorite movie by entering the title" />
              ) : (
                filteredResults.map((result) => (
                  <Link key={result.movie_id} href={`/movie-detail-page?movie_id=${result.movie_id}`}>
                    <div className="flex gap-4 py-3 border-b border-gray-800 hover:bg-[#292938] rounded-lg px-2 transition-colors">
                      <div className="flex-shrink-0 w-16 h-24 relative rounded-md overflow-hidden">
                        {result.poster_path ? (
                          <Image
                            src={getPosterUrl(result.poster_path)}
                            alt={result.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                        {/* Rating badge */}
                        {result.rating && result.rating !== "0" && (
                          <div className="absolute top-1 right-1 bg-primary rounded-full px-1 py-0.5 flex items-center gap-1">
                            <span className="text-xs font-medium">{result.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{result.title}</h3>
                        <p className="text-gray-400 text-sm mb-1">{formatDate(result.release_date)}</p>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-2">{result.overview}</p>

                        {/* Genres */}
                        {result.genres && result.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {result.genres.slice(0, 3).map((genre, index) => (
                              <span
                                key={index}
                                className="bg-[#1a1a2e] text-xs px-2 py-1 rounded text-gray-300"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* OTT platforms */}
                        {result.otts && result.otts.length > 0 && (
                          <div className="flex gap-1 items-center">
                            <span className="text-xs text-gray-400 mr-1">Available on:</span>
                            {result.otts.slice(0, 3).map((ott) => (
                              <div key={ott.ott_id} className="w-4 h-4 relative">
                                <Image
                                  src={ott.logo_url}
                                  alt={ott.name}
                                  fill
                                  className="object-contain rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            ))}
                            {result.otts.length > 3 && (
                              <span className="text-xs text-gray-400 ml-1">+{result.otts.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {/* Genres Section - Only show when not showing results */}
          {!showingResults && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Genres</h2>
                <div className="grid grid-cols-2 gap-3">
                  {visibleGenres.map((genre) => (
                    <button
                      key={genre.genre_id}
                      className="bg-[#292938] rounded-lg py-3 px-4 text-left hover:bg-[#3a3a4a] transition-colors"
                      onClick={() => handleGenreClick(genre.genre_id, genre.name)}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
                {genres.length > 6 && (
                  <button
                    className="w-full mt-3 flex items-center justify-center py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowAllGenres(!showAllGenres)}
                  >
                    {showAllGenres ? "See less" : "See more"}
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAllGenres ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {/* OTT Platforms Section */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">OTT Platforms</h2>
                <div className="grid grid-cols-2 gap-3">
                  {visibleOtts.map((ott) => (
                    <button
                      key={ott.ott_id}
                      className="bg-[#292938] rounded-lg py-3 px-4 text-left hover:bg-[#3a3a4a] transition-colors flex items-center gap-3"
                      onClick={() => handleOttClick(ott.ott_id, ott.name)}
                    >
                      <div className="flex-shrink-0 w-8 h-8 relative">
                        <Image
                          src={ott.logo_url}
                          alt={ott.name}
                          fill
                          className="object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                      <span className="text-sm">{ott.name}</span>
                    </button>
                  ))}
                </div>
                {otts.length > 6 && (
                  <button
                    className="w-full mt-3 flex items-center justify-center py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowAllOtts(!showAllOtts)}
                  >
                    {showAllOtts ? "See less" : "See more"}
                    <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAllOtts ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>

              {/* Featured Collections (Languages) */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Languages</h2>
                <div className="space-y-1">
                  {visibleLanguages.map((language) => (
                    <button
                      key={language.language_id}
                      className="w-full flex items-center justify-between py-3 border-b border-gray-800 hover:bg-[#292938] transition-colors"
                      onClick={() => handleLanguageClick(language.code, language.name)}
                    >
                      <span>{language.name}</span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  ))}
                </div>
                {languages.length > 6 && (
                  <button
                    className="w-full mt-3 flex items-center justify-center py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    onClick={() => setShowAllCollections(!showAllCollections)}
                  >
                    {showAllCollections ? "See less" : "See more"}
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${showAllCollections ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </div>
            </>
          )}

          {/* Can't find your movie section - Now shows with Request Movie button when no search results */}
          {searchTerm.length > 1 && searchResults.length === 0 && !isLoading && (
            <div className="text-center mt-8">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#6c5ce7] hover:bg-[#6c5ce7]/80">Request Movie</Button>
                </DialogTrigger>

                <MovieRequestDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
              </Dialog>
            </div>
          )}
        </div>


        <BottomNavigation currentPath="/watch-list" />
      </div>
    // </PageTransitionWrapper>


  )
}

export default AddMoviePage