"use client"

import { type SetStateAction, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, ArrowLeft, Filter, MessageCircle, Share2, Plus, X } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import AvatarImg from "@/assets/avatar.jpg"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"

// Placeholder data
const friendMovies = [
  {
    id: 1,
    title: "Inception",
    imageSrc: home1,
    friend: "Alex",
    friendAvatar: AvatarImg,
    date: "2 days ago",
  },
  {
    id: 2,
    title: "The Shawshank Redemption",
    imageSrc: home2,
    friend: "Sarah",
    friendAvatar: AvatarImg,
    date: "1 week ago",
  },
  {
    id: 3,
    title: "Pulp Fiction",
    imageSrc: home3,
    friend: "Mike",
    friendAvatar: AvatarImg,
    date: "3 days ago",
  },
]

const receivedSuggestions = [
  {
    id: 1,
    title: "The Dark Knight",
    imageSrc: home1,
    friend: "Jessica",
    friendAvatar: AvatarImg,
    note: "This is the best Batman movie ever made! You'll love it.",
    date: "Yesterday",
  },
  {
    id: 2,
    title: "Interstellar",
    imageSrc: home2,
    friend: "David",
    friendAvatar: AvatarImg,
    note: "Mind-bending sci-fi with amazing visuals.",
    date: "3 days ago",
  },
]

const mySuggestions = [
  {
    id: 1,
    title: "The Godfather",
    imageSrc: home3,
    friend: "Ryan",
    friendAvatar: AvatarImg,
    note: "Classic that everyone should watch at least once.",
    date: "1 week ago",
  },
  {
    id: 2,
    title: "Parasite",
    imageSrc: home1,
    friend: "Emma",
    friendAvatar: AvatarImg,
    note: "This Korean thriller is absolutely brilliant!",
    date: "2 days ago",
  },
]

const friends: { id: number; name: string; avatar: string }[] = [
  { id: 1, name: "Alex", avatar: AvatarImg.src },
  { id: 2, name: "Sarah", avatar: AvatarImg.src },
  { id: 3, name: "Mike", avatar: AvatarImg.src },
  { id: 4, name: "Jessica", avatar: AvatarImg.src },
  { id: 5, name: "David", avatar: AvatarImg.src },
]

const searchResults = [
  { id: 1, title: "The Matrix", imageSrc: home1, year: 1999 },
  { id: 2, title: "Inception", imageSrc: home2, year: 2010 },
  { id: 3, title: "Interstellar", imageSrc: home3, year: 2014 },
]

export default function SuggestPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("received")
  const [showSuggestDialog, setShowSuggestDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<{
    id: number
    title: string
    imageSrc: string
    year?: number
  } | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<{ id: number; name: string; avatar: string } | null>(null)
  const [note, setNote] = useState("")
  const [suggestStep, setSuggestStep] = useState(1)

  const handleMovieSelect = (
    movie: SetStateAction<{ id: number; title: string; imageSrc: string; year?: number } | null>,
  ) => {
    setSelectedMovie(movie)
    setSuggestStep(2)
  }

  const handleFriendSelect = (friend: { id: number; name: string; avatar: string }) => {
    setSelectedFriend(friend)
    setSuggestStep(3)
  }

  const handleSuggest = () => {
    // Here you would implement the actual suggestion logic
    setShowSuggestDialog(false)
    setSuggestStep(1)
    setSelectedMovie(null)
    setSelectedFriend(null)
    setNote("")
    // Show success message or notification
  }

  const resetSuggestFlow = () => {
    setSuggestStep(1)
    setSelectedMovie(null)
    setSelectedFriend(null)
    setNote("")
  }

  return (
    <div className="text-white min-h-screen mb-18">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Suggest</h1>
        </div>
        <div className="flex gap-4">
          <button className="text-gray-300">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="received" className="w-full" onValueChange={setActiveTab}>
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
            <TabsTrigger 
              value="received" 
              className="data-[state=active]:bg-[#6c5ce7] transition-colors duration-200"
            >
              Received
            </TabsTrigger>
            <TabsTrigger 
              value="sent" 
              className="data-[state=active]:bg-[#6c5ce7] transition-colors duration-200"
            >
              Sent
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Received Tab */}
        <TabsContent value="received" className="mt-4">
          <div className="px-4">
            <div className="space-y-4">
              {receivedSuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#292938] rounded-lg overflow-hidden"
                >
                  <div className="flex p-3">
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={suggestion.imageSrc || "/placeholder.svg"}
                        alt={suggestion.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage
                            src={
                              (typeof suggestion.friendAvatar === "string"
                                ? suggestion.friendAvatar
                                : suggestion.friendAvatar.src) || "/placeholder.svg"
                            }
                            alt={suggestion.friend}
                          />
                          <AvatarFallback>{suggestion.friend[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-400">{suggestion.friend} suggested</span>
                        <span className="text-xs text-gray-500">• {suggestion.date}</span>
                      </div>
                      <h3 className="font-medium mb-1">{suggestion.title}</h3>
                      <p className="text-xs text-gray-400 bg-[#181826] p-2 rounded-lg mb-2">{suggestion.note}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="rounded-full text-xs h-8 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                          onClick={() => router.push("/movie-detail-page")}
                        >
                          Watch Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-8 px-3 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white"
                        >
                          Add to List
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-8 w-8 p-0 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white ml-auto"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Suggested Tab */}
        <TabsContent value="sent" className="mt-4">
          <div className="px-4">
            <div className="space-y-4">
              {mySuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#292938] rounded-lg overflow-hidden"
                >
                  <div className="flex p-3">
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={suggestion.imageSrc || "/placeholder.svg"}
                        alt={suggestion.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">You suggested to</span>
                        <Avatar className="w-5 h-5">
                          <AvatarImage
                            src={
                              (typeof suggestion.friendAvatar === "string"
                                ? suggestion.friendAvatar
                                : suggestion.friendAvatar.src) || "/placeholder.svg"
                            }
                            alt={suggestion.friend}
                          />
                          <AvatarFallback>{suggestion.friend[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-400">{suggestion.friend}</span>
                        <span className="text-xs text-gray-500">• {suggestion.date}</span>
                      </div>
                      <h3 className="font-medium mb-1">{suggestion.title}</h3>
                      <div className="flex items-center gap-2 mt-1 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#181826] text-gray-300">
                          {Math.random() > 0.5 ? "Watched ✓" : "Not watched yet"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 bg-[#181826] p-2 rounded-lg mb-2">{suggestion.note}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-full text-xs h-8 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80">
                          Suggest Again
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-8 w-8 p-0 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white ml-auto"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSuggestDialog(true)}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Suggest Dialog */}
      <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
        <DialogContent className="bg-[#292938] border-gray-700 text-white p-0 max-w-md">
          <div className="sticky top-0 z-10 bg-[#292938] p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {suggestStep === 1
                  ? "Find a movie to suggest"
                  : suggestStep === 2
                    ? "Select a friend"
                    : "Add a note (optional)"}
              </DialogTitle>
              <button
                onClick={() => {
                  if (suggestStep > 1) {
                    setSuggestStep(suggestStep - 1)
                  } else {
                    setShowSuggestDialog(false)
                    resetSuggestFlow()
                  }
                }}
                className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700"
              >
                {suggestStep > 1 ? <ArrowLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
            </div>
            {suggestStep === 1 && (
              <div className="mt-4">
                <div className="flex items-center bg-[#181826] rounded-full px-4 py-3">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search for a movie..."
                    className="bg-transparent w-full focus:outline-none text-gray-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {suggestStep === 1 && (
              <div className="space-y-3">
                {searchResults.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#181826] cursor-pointer"
                    onClick={() => handleMovieSelect({ ...movie, imageSrc: movie.imageSrc.src })}
                  >
                    <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={movie.imageSrc || "/placeholder.svg"}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{movie.title}</h3>
                      <p className="text-xs text-gray-400">{movie.year}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {suggestStep === 2 && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedMovie?.imageSrc ?? "/placeholder.svg"}
                      alt={selectedMovie?.title ?? "Movie image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedMovie?.title}</h3>
                    <p className="text-xs text-gray-400">{selectedMovie?.year}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <motion.button
                      key={friend.id}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-[#181826]"
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleFriendSelect(friend)}
                    >
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{friend.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {suggestStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedMovie?.imageSrc ?? "/placeholder.svg"}
                      alt={selectedMovie?.title ?? "Movie image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedMovie?.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">To:</span>
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={selectedFriend?.avatar || "/placeholder.svg"} alt={selectedFriend?.name} />
                        <AvatarFallback>{selectedFriend?.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{selectedFriend?.name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Why are you recommending this?</label>
                  <Textarea
                    placeholder="Write a short note..."
                    className="bg-[#181826] text-white border-gray-700"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="mt-4 p-3 bg-[#181826] rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Smart Suggestion</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <p className="text-xs text-gray-300">
                      {selectedFriend?.name} might like this movie! They've watched similar titles.
                    </p>
                  </div>
                </div>

                <Button className="w-full bg-[#6c5ce7] hover:bg-[#6c5ce7]/80 h-12" onClick={handleSuggest}>
                  Send Suggestion
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation currentPath="/suggest" />
    </div>
  )
}