"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Bell, Clock, Heart, MessageCircle, Play, UserPlus } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import AvatarImg  from "@/assets/avatar.jpg"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"

// Placeholder data
const notifications = [
  {
    id: 1,
    type: "suggestion",
    user: "Sarah",
    userAvatar: AvatarImg,
    movie: "The Shawshank Redemption",
    movieImage: home1,
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "like",
    user: "Mike",
    userAvatar: AvatarImg,
    movie: "Inception",
    movieImage: home2,
    time: "Yesterday",
    read: false,
  },
  {
    id: 3,
    type: "comment",
    user: "Jessica",
    userAvatar: AvatarImg,
    movie: "The Dark Knight",
    movieImage: home3,
    comment: "I loved this movie too! Great suggestion!",
    time: "2 days ago",
    read: true,
  },
  {
    id: 4,
    type: "friend_request",
    user: "Alex",
    userAvatar: AvatarImg,
    time: "3 days ago",
    read: true,
  },
]

const activityLog = [
  {
    id: 1,
    type: "suggested",
    movie: "The Godfather",
    movieImage: home1,
    to: "Ryan",
    toAvatar: AvatarImg,
    time: "2 days ago",
  },
  {
    id: 2,
    type: "watched",
    movie: "Pulp Fiction",
    movieImage: home2,
    rating: 5,
    time: "3 days ago",
  },
  {
    id: 3,
    type: "liked",
    movie: "Fight Club",
    movieImage: home3,
    time: "1 week ago",
  },
  {
    id: 4,
    type: "suggested",
    movie: "The Matrix",
    movieImage: home1,
    to: "Emma",
    toAvatar: AvatarImg,
    time: "1 week ago",
  },
  {
    id: 5,
    type: "watched",
    movie: "Interstellar",
    movieImage: home2,
    rating: 4,
    time: "2 weeks ago",
  },
]

export default function ActivityPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("notifications")

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "suggestion":
        return <MessageCircle className="w-4 h-4 text-primary" />
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-green-500" />
      case "friend_request":
        return <UserPlus className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4 text-primary" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "suggested":
        return <MessageCircle className="w-4 h-4 text-primary" />
      case "watched":
        return <Play className="w-4 h-4 text-green-500" />
      case "liked":
        return <Heart className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-primary" />
    }
  }

  const renderNotificationContent = (notification: { id: number; type: string; user: string; userAvatar: string; movie: string; movieImage: string; time: string; read: boolean; comment?: undefined } | { id: number; type: string; user: string; userAvatar: string; movie: string; movieImage: string; comment: string; time: string; read: boolean } | { id: number; type: string; user: string; userAvatar: string; time: string; read: boolean; movie?: undefined; movieImage?: undefined; comment?: undefined }) => {
    switch (notification.type) {
      case "suggestion":
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={notification.userAvatar || "/placeholder.svg"} alt={notification.user} />
              <AvatarFallback>{notification.user[0]}</AvatarFallback>
            </Avatar>
            <span>
              <span className="font-medium">{notification.user}</span> suggested{" "}
              <span className="font-medium">{notification.movie}</span> to you
            </span>
          </div>
        )
      case "like":
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={notification.userAvatar || "/placeholder.svg"} alt={notification.user} />
              <AvatarFallback>{notification.user[0]}</AvatarFallback>
            </Avatar>
            <span>
              <span className="font-medium">{notification.user}</span> liked your suggestion:{" "}
              <span className="font-medium">{notification.movie}</span>
            </span>
          </div>
        )
      case "comment":
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={notification.userAvatar || "/placeholder.svg"} alt={notification.user} />
              <AvatarFallback>{notification.user[0]}</AvatarFallback>
            </Avatar>
            <span>
              <span className="font-medium">{notification.user}</span> commented on your suggestion:{" "}
              <span className="font-medium">{notification.movie}</span>
            </span>
          </div>
        )
      case "friend_request":
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={notification.userAvatar || "/placeholder.svg"} alt={notification.user} />
              <AvatarFallback>{notification.user[0]}</AvatarFallback>
            </Avatar>
            <span>
              <span className="font-medium">{notification.user}</span> sent you a friend request
            </span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className=" text-white min-h-screen mb-18">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
        <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
          <h1 className="text-xl font-bold">Activity</h1>
        </div>
        <div className="flex gap-4">
          <button className="text-gray-300 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="notifications" className="w-full" onValueChange={setActiveTab}>
        <div className="px-4">
        <TabsList className="w-full h-12 p-1 bg-transparent">
            <TabsTrigger value="notifications" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="activity" className="transition-colors duration-200 bg-transparent active:bg-[#1f1f2e]">
              Activity Log
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-4">
          <div className="px-4">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#292938] rounded-lg overflow-hidden p-3 ${
                    !notification.read ? "border-l-4 border-[#6c5ce7]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-[#181826] rounded-full p-2">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      {renderNotificationContent(notification)}

                      {notification.type !== "friend_request" && (
                        <div className="flex items-center gap-3 mt-3">
                          <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={notification.movieImage || "/placeholder.svg"}
                              alt={notification.movie || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {notification.type === "comment" && (
                            <div className="bg-[#181826] p-2 rounded-lg text-xs text-gray-300">
                              {notification.comment}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{notification.time}</span>

                        {notification.type === "suggestion" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="rounded-full text-xs h-7 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                              onClick={() => router.push("/movie-detail-page")}
                            >
                              Watch
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-7 px-3 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white"
                            >
                              Later
                            </Button>
                          </div>
                        )}

                        {notification.type === "friend_request" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="rounded-full text-xs h-7 px-3 bg-[#6c5ce7] hover:bg-[#6c5ce7]/80"
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full text-xs h-7 px-3 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white"
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="mt-4 mb-6">
          <div className="px-4">
            <div className="space-y-4">
              {activityLog.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#292938] rounded-lg overflow-hidden p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-[#181826] rounded-full p-2">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>
                          You {activity.type} <span className="font-medium">{activity.movie}</span>
                          {activity.type === "suggested" && (
                            <>
                              {" "}
                              to{" "}
                              <div className="inline-flex items-center gap-1">
                                <Avatar className="w-4 h-4 inline-block">
                                  <AvatarImage src={activity.toAvatar || "/placeholder.svg"} alt={activity.to} />
                                  <AvatarFallback>{activity.to ? activity.to[0] : "?"}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{activity.to}</span>
                              </div>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={activity.movieImage || "/placeholder.svg"}
                            alt={activity.movie}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {activity.type === "watched" && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${i < (activity.rating ?? 0) ? "text-yellow-400" : "text-gray-600"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{activity.time}</span>

                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full text-xs h-7 px-3 bg-transparent border-gray-600 hover:bg-[#6c5ce7]/20 hover:text-white"
                          onClick={() => router.push("/movie-detail-page")}
                        >
                          View
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

      <BottomNavigation currentPath="/activity" />
    </div>
  )
}
