"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { type ChangeEvent, useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Search, Plus, ChevronRight, X, ChevronDown, Star } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import NotFound from "@/components/notfound"
import MovieRequestDialog from "@/components/MovieRequestDialog"
import { Movie, Genre, Language, OTT, MovieResult, Mood } from "@/app/add-movie/type"
import { SearchResultsSkeleton, FilteredResultsSkeleton } from "@/app/add-movie/_components/loading"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import Cookies from "js-cookie"

const AddMoviePage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = Cookies.get("userID")
  const GenreId = searchParams.get("genre_id");
  const MoodId = searchParams.get("mood_id");
  const keyWord = searchParams.get("keyword");
  const actorId = searchParams.get("actor_id");
  const actorName = searchParams.get("actorname");
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [filteredResults, setFilteredResults] = useState<MovieResult[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [otts, setOtts] = useState<OTT[]>([])
  const [moods, setMoods] = useState<Mood[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAllGenres, setShowAllGenres] = useState(false)
  const [showAllCollections, setShowAllCollections] = useState(false)
  const [showAllOtts, setShowAllOtts] = useState(false)
  const [showAllMoods, setShowAllMoods] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentFilter, setCurrentFilter] = useState<{ type: string, name: string } | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const observerRef = useRef<HTMLDivElement>(null)
  const [years, setYears] = useState<{ year: number }[]>([])
  const [showYearPopup, setShowYearPopup] = useState(false)
  const [yearSearch, setYearSearch] = useState("")
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

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

        // Fetch moods
        const moodsResponse = await fetch("https://suggesto.xyz/App/api.php?gofor=moodslist")
        const moodsData = await moodsResponse.json()
        setMoods(moodsData)

        // Generate years array (last 20 years)
        const currentYear = new Date().getFullYear()
        const yearsArray = []
        for (let i = 0; i < 40; i++) {
          yearsArray.push({ year: currentYear - i })
        }
        setYears(yearsArray)

      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!actorId || !actorName) return;

    handleActorClick(actorName); // Pass the actor name instead of ID
  }, [actorId, actorName]);

  useEffect(() => {
    if (!keyWord) return;

    handleKeywordSearch(keyWord);
  }, [keyWord]);

  const handleKeywordSearch = async (keyword: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'keyword', name: keyword })
    setIsLoading(true)
    setOffset(0)
    setHasMore(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&keyword=${encodeURIComponent(keyword)}&user_id=${userId}&limit=10&offset=${offset}`)
      const data = await response.json()
      const movies = data?.data || []
      setFilteredResults(movies)
      setTotalCount(data?.total_count || 0)
      setOffset(movies.length)
      setHasMore(movies.length === 10 && movies.length < (data?.total_count || 0))
    } catch (error) {
      console.error("Error fetching keyword movies:", error)
      setFilteredResults([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!GenreId || genres.length === 0) return;

    const genreIdNum = parseInt(GenreId, 10);
    const selectedGenre = genres.find(genre => genre.genre_id === genreIdNum);

    if (selectedGenre) {
      handleGenreClick(selectedGenre.genre_id, selectedGenre.name);
    }
  }, [GenreId, genres]);

  useEffect(() => {
    if (!MoodId || moods.length === 0) return;

    const moodIdNum = parseInt(MoodId, 10);
    const selectedMood = moods.find(mood => mood.mood_id === moodIdNum);

    if (selectedMood) {
      handleMoodClick(selectedMood.mood_id, selectedMood.mood_name);
    }
  }, [MoodId, moods]);


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
    // Also clear the URL params to reset the page state
    const url = new URL(window.location.href)
    url.searchParams.delete('genre_id')
    url.searchParams.delete('mood_id')
    url.searchParams.delete('keyword')
    router.replace(url.pathname)
  }

  const handleGenreClick = async (genreId: number, genreName: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'genre', name: genreName })
    setIsLoading(true)
    setOffset(0)
    setHasMore(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&genre=${genreId}&limit=10&offset=${offset}`)
      const data = await response.json()
      const movies = data?.data || []
      setFilteredResults(movies)
      setTotalCount(data?.total_count || 0)
      setOffset(movies.length)
      setHasMore(movies.length === 10 && movies.length < (data?.total_count || 0))
    } catch (error) {
      console.error("Error fetching genre movies:", error)
      setFilteredResults([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageClick = async (languageCode: string, languageName: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'language', name: languageName })
    setIsLoading(true)
    setOffset(0)
    setHasMore(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&language=${languageCode}&limit=10&offset=${offset}`)
      const data = await response.json()
      const movies = data?.data || []
      setFilteredResults(movies)
      setTotalCount(data?.total_count || 0)
      setOffset(movies.length)
      setHasMore(movies.length === 10 && movies.length < (data?.total_count || 0))
    } catch (error) {
      console.error("Error fetching language movies:", error)
      setFilteredResults([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleActorClick = async (actorName: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'actor', name: actorName }) // Use the passed actorName
    setIsLoading(true)
    setOffset(0)
    setHasMore(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&actor_id=${actorId}&limit=10&offset=${offset}`)
      const data = await response.json()
      const movies = data?.data || []
      setFilteredResults(movies)
      setTotalCount(data?.total_count || 0)
      setOffset(movies.length)
      setHasMore(movies.length === 10 && movies.length < (data?.total_count || 0))
    } catch (error) {
      console.error("Error fetching actor movies:", error)
      setFilteredResults([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOttClick = async (ottId: number, ottName: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'ott', name: ottName })
    setIsLoading(true)
    setOffset(0)
    setHasMore(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&ott=${ottId}&limit=10&offset=${offset}`)
      const data = await response.json()
      const movies = data?.data || []
      setFilteredResults(movies)
      setTotalCount(data?.total_count || 0)
      setOffset(movies.length)
      setHasMore(movies.length === 10 && movies.length < (data?.total_count || 0))
    } catch (error) {
      console.error("Error fetching OTT movies:", error)
      setFilteredResults([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMoodClick = async (moodId: number, moodName: string) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'mood', name: moodName })
    setIsLoading(true)
    setOffset(0)
    setHasMore(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&mood=${moodId}&limit=10&offset=${offset}`)
      const data = await response.json()
      const movies = data?.data || []
      setFilteredResults(movies)
      setTotalCount(data?.total_count || 0)
      setOffset(movies.length)
      setHasMore(movies.length === 10 && movies.length < (data?.total_count || 0))
    } catch (error) {
      console.error("Error fetching Mood Movie:", error)
      setFilteredResults([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleYearClick = async (year: number) => {
    setSearchTerm("")
    setSearchResults([])
    setCurrentFilter({ type: 'year', name: year.toString() })
    setIsLoading(true)
    setOffset(0)
    setHasMore(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=movieslist&year=${year}&limit=10&offset=${offset}`)
      const data = await response.json()
      const movies = data?.data || []
      setFilteredResults(movies)
      setTotalCount(data?.total_count || 0)
      setOffset(movies.length)
      setHasMore(movies.length === 10 && movies.length < (data?.total_count || 0))
    } catch (error) {
      console.error("Error fetching year movies:", error)
      setFilteredResults([])
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreResults = useCallback(async () => {
    if (!currentFilter || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)

    try {
      let url = `https://suggesto.xyz/App/api.php?gofor=movieslist&limit=10&offset=${offset}`

      // Build URL based on current filter type
      switch (currentFilter.type) {
        case 'genre':
          const genreId = genres.find(g => g.name === currentFilter.name)?.genre_id
          url += `&genre=${genreId}`
          break
        case 'language':
          const languageCode = languages.find(l => l.name === currentFilter.name)?.code
          url += `&language=${languageCode}`
          break
        case 'ott':
          const ottId = otts.find(o => o.name === currentFilter.name)?.ott_id
          url += `&ott=${ottId}`
          break
        case 'mood':
          const moodId = moods.find(m => m.mood_name === currentFilter.name)?.mood_id
          url += `&mood=${moodId}`
          break
        case 'actor':
          url += `&actor_id=${actorId}`
          break
        case 'keyword':
          url += `&keyword=${encodeURIComponent(keyWord || '')}&user_id=${userId}`
          break
        case 'year':
          const year = parseInt(currentFilter.name)
          url += `&year=${year}`
          break
      }

      const response = await fetch(url)
      const data = await response.json()
      const newMovies = data?.data || []

      if (newMovies.length > 0) {
        setFilteredResults(prev => [...prev, ...newMovies])
        setOffset(prev => prev + newMovies.length)
      }

      setHasMore(newMovies.length === 10 && (offset + newMovies.length) < totalCount)
    } catch (error) {
      console.error("Error loading more results:", error)
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [currentFilter, offset, isLoadingMore, hasMore, genres, languages, otts, moods, actorId, keyWord, userId])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !isLoadingMore && hasMore && currentFilter) {
          loadMoreResults()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [loadMoreResults, isLoadingMore, hasMore, currentFilter])

  const visibleGenres = showAllGenres ? genres : genres.slice(0, 6)
  const visibleLanguages = showAllCollections ? languages : languages.slice(0, 6)
  const visibleOtts = showAllOtts ? otts : otts.slice(0, 6)
  const visibleMoods = showAllMoods ? moods : moods.slice(0, 6)

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

  const YearPopup = () => {
    const filteredYears = years.filter(yearObj =>
      yearObj.year.toString().includes(yearSearch)
    )

    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#1f1f21] rounded-xl w-full max-w-md h-[50vh] flex flex-col">
          {/* Header + Search */}
          <div className="p-4 border-b border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Select Year</h3>
              <button
                onClick={() => setShowYearPopup(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <input
              placeholder="Search year..."
              value={yearSearch}
              onChange={(e) => setYearSearch(e.target.value)}
              className="w-full bg-[#2b2b2b] border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gray-500"
              autoFocus
            />
          </div>

          {/* Year List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredYears.map((yearObj) => (
              <button
                key={yearObj.year}
                onClick={() => {
                  setSelectedYear(yearObj.year)
                  handleYearClick(yearObj.year)
                  setYearSearch("")
                  setShowYearPopup(false)
                }}
                className="w-full text-left p-3  rounded-lg text-white transition-colors"
              >
                {yearObj.year}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (

    // <PageTransitionWrapper>
    <div className="min-h-screen ">
      <header className="p-4 flex items-center justify-between pt-8">
        <div className="flex items-center gap-2">
          <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
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
            className="bg-[#2b2b2b] text-white w-full pl-10 pr-10 py-3 rounded-full focus:outline-none"
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
            <span className="bg-gradient-to-r from-[#ff968b] to-[#ff2251] px-3 py-1 rounded-full text-sm font-medium">
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
                    <div className="flex gap-4 py-3 border-b border-gray-800 hover:bg-[#2b2b2b] rounded-lg px-2 transition-colors">
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
                  <div className="flex gap-4 py-3 border-b border-gray-800 hover:bg-[#2b2b2b] rounded-lg px-2 transition-colors">
                    <div className="flex-shrink-0 w-16 h-24 relative rounded-md overflow-hidden">
                      {result.poster_path ? (
                        <Image
                          src={getPosterUrl(result.poster_path)}
                          alt={result.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#2b2b2b] flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                      {/* Rating badge */}
                      {result.rating && result.rating !== "0" && (
                        <div className="absolute top-1 right-1 bg-gradient-to-r from-[#ff968b] to-[#ff2251] rounded-full px-1.5 py-0.5 flex items-center justify-center gap-1">
                          <Star className="w-2 h-2 text-white" />
                          <span className="text-xs font-medium text-white">
                            {parseFloat(result.rating).toFixed(1)}
                          </span>
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
                              className="bg-[#2b2b2b] text-xs px-2 py-1 rounded text-gray-300"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* OTT platforms */}
                      {/* {result.otts && result.otts.length > 0 && (
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
                      )} */}
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
                    className="bg-[#2b2b2b] rounded-lg py-3 px-4 text-left hover:bg-[#3a3a4a] transition-colors"
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

            {/* Moods Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Moods</h2>
              <div className="grid grid-cols-2 gap-3">
                {visibleMoods.map((mood) => (
                  <button
                    key={mood.mood_id}
                    className="bg-[#2b2b2b] rounded-lg py-3 px-4 text-left hover:bg-[#3a3a4a] transition-colors"
                    onClick={() => handleGenreClick(mood.mood_id, mood.mood_name)}
                  >
                    {mood.mood_name}
                  </button>
                ))}
              </div>
              {moods.length > 6 && (
                <button
                  className="w-full mt-3 flex items-center justify-center py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowAllMoods(!showAllMoods)}
                >
                  {showAllMoods ? "See less" : "See more"}
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showAllMoods ? "rotate-180" : ""}`} />
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
                    className="bg-[#2b2b2b] rounded-lg py-3 px-4 text-left hover:bg-[#3a3a4a] transition-colors flex items-center gap-3"
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


            {/* Years Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Year</h2>
              <button
                type="button"
                onClick={() => setShowYearPopup(true)}
                className="w-full bg-[#2b2b2b] text-left px-4 py-3 h-12 rounded-xl text-white flex items-center justify-between hover:bg-[#3a3a4a] transition-colors"
              >
                <span className={selectedYear ? "text-white" : "text-gray-400"}>
                  {selectedYear || "Select year"}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {showYearPopup && <YearPopup />}


            {/* Featured Collections (Languages) */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Languages</h2>
              <div className="space-y-1">
                {visibleLanguages.map((language) => (
                  <button
                    key={language.language_id}
                    className="w-full flex items-center justify-between py-3 border-b border-gray-800 hover:bg-[#2b2b2b] transition-colors"
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

        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <FilteredResultsSkeleton />
          </div>
        )}

        {/* Intersection observer target */}
        {hasMore && !isLoadingMore && currentFilter && (
          <div ref={observerRef} className="h-4 w-full" />
        )}

        {/* Can't find your movie section - Now shows with Request Movie button when no search results */}
        {searchTerm.length > 1 && searchResults.length === 0 && !isLoading && (
          <div className="text-center mt-8">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="w-full">Request Movie</Button>
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