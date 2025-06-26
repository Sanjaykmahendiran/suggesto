"use client"

import { useState } from "react"
import Image, { StaticImageData } from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Star, X, Clock } from "lucide-react"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import home4 from "@/assets/home-4.jpg"
import home5 from "@/assets/home-5.jpg"
import { Button } from "./ui/button"

type Movie = {
  id: number
  title: string
  imageSrc: string | StaticImageData
  genre: string
  rating: number | null
  runtime: string
  userRating?: number | null
  watched?: boolean
  addedDate: string
}

export default function UserMovieCollection() {
  // Sample user-added movies - in a real app, this would come from a database
  const [userMovies, setUserMovies] = useState<Movie[]>([
    {
      id: 101,
      title: "Foundation",
      imageSrc: home1,
      genre: "Sci-Fi",
      rating: 8.4,
      runtime: "60 min",
      userRating: null,
      watched: false,
      addedDate: "2 days ago",
    },
    {
      id: 102,
      title: "Dune: Part Two",
      imageSrc: home2,
      genre: "Sci-Fi",
      rating: 8.7,
      runtime: "166 min",
      userRating: null,
      watched: false,
      addedDate: "1 week ago",
    },
    {
      id: 103,
      title: "Oppenheimer",
      imageSrc: home3,
      genre: "Drama/Biography",
      rating: 8.5,
      runtime: "180 min",
      userRating: 4,
      watched: true,
      addedDate: "2 weeks ago",
    },
    {
      id: 104,
      title: "Everything Everywhere All at Once",
      imageSrc: home4,
      genre: "Sci-Fi/Comedy",
      rating: 8.0,
      runtime: "139 min",
      userRating: null,
      watched: false,
      addedDate: "3 weeks ago",
    },
    {
      id: 105,
      title: "The Batman",
      imageSrc: home5,
      genre: "Action/Crime",
      rating: 7.8,
      runtime: "176 min",
      userRating: 5,
      watched: true,
      addedDate: "1 month ago",
    },
  ])

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [ratingMode, setRatingMode] = useState(false)

  const markAsWatched = (movieId: number) => {
    setUserMovies((movies) => movies.map((movie) => (movie.id === movieId ? { ...movie, watched: true } : movie)))
    setSelectedMovie(null)
  }

  const rateMovie = (movieId: number, rating: number) => {
    setUserMovies((movies) =>
      movies.map((movie) => (movie.id === movieId ? { ...movie, userRating: rating, watched: true } : movie)),
    )
    setRatingMode(false)
    setSelectedMovie(null)
  }

  return (
    <div className="bg-[#181826] text-white pb-20">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold mb-1">My Collection</h2>
        <p className="text-xs text-gray-400">Movies you've added to watch later</p>
      </div>

      {/* Horizontal scroll view */}
      <div className="relative pb-4">
        <div className="flex overflow-x-auto gap-3 px-4 pb-4 no-scrollbar">
          {userMovies.map((movie) => (
            <div key={movie.id} className="relative flex-shrink-0 w-[140px]" onClick={() => setSelectedMovie(movie)}>
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                <Image src={movie.imageSrc || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />

                {/* Watched indicator */}
                {movie.watched && (
                  <div className="absolute top-2 right-2 bg-[#9370ff] rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* User rating badge */}
                {movie.userRating && (
                  <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5 flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-0.5" fill="rgb(250 204 21)" />
                    <span className="text-xs">{movie.userRating}</span>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-400">{movie.runtime}</span>
                  </div>
                  <span className="text-xs text-gray-400">{movie.addedDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Movie action modal */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => {
              if (!ratingMode) {
                setSelectedMovie(null)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#2b2b2b] rounded-xl overflow-hidden max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {ratingMode ? (
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Rate this movie</h3>
                    <Button className="text-gray-400" onClick={() => setRatingMode(false)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <p className="text-center mb-6 text-gray-300">{selectedMovie.title}</p>

                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button key={rating} className="p-2" onClick={() => rateMovie(selectedMovie.id, rating)}>
                        <Star
                          className={`w-8 h-8 ${
                            selectedMovie.userRating && rating <= selectedMovie.userRating
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                          fill={
                            selectedMovie.userRating && rating <= selectedMovie.userRating ? "rgb(250 204 21)" : "none"
                          }
                        />
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative h-[200px]">
                    <Image
                      src={selectedMovie.imageSrc || "/placeholder.svg"}
                      alt={selectedMovie.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2b2b2b] to-transparent"></div>

                    <Button
                      className="absolute top-4 right-4 bg-black/50 rounded-full p-1.5"
                      onClick={() => setSelectedMovie(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2">{selectedMovie.title}</h3>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" fill="rgb(250 204 21)" />
                        <span className="text-sm">{selectedMovie.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm">{selectedMovie.runtime}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      {!selectedMovie.watched ? (
                        <Button
                          className="flex-1 bg-[#9370ff] text-white py-3 rounded-lg flex items-center justify-center gap-2"
                          onClick={() => markAsWatched(selectedMovie.id)}
                        >
                          <Check className="w-4 h-4" />
                          Mark as Watched
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-[#2b2b2b] border border-gray-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                          onClick={() => {
                            setUserMovies((movies) =>
                              movies.map((movie) =>
                                movie.id === selectedMovie.id ? { ...movie, watched: false, userRating: null } : movie,
                              ),
                            )
                            setSelectedMovie(null)
                          }}
                        >
                          <X className="w-4 h-4" />
                          Mark as Unwatched
                        </Button>
                      )}

                      <Button
                        className={`flex-1 ${
                          selectedMovie.userRating ? "bg-[#2b2b2b] border border-gray-700" : "bg-[#9370ff]"
                        } text-white py-3 rounded-lg flex items-center justify-center gap-2`}
                        onClick={() => setRatingMode(true)}
                      >
                        <Star className="w-4 h-4" fill={selectedMovie.userRating ? "rgb(250 204 21)" : "none"} />
                        {selectedMovie.userRating ? "Change Rating" : "Rate Movie"}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
