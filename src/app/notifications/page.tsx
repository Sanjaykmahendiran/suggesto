"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowLeft, Bell, Heart, Play, Clock, Film, ThumbsUp, Eye } from 'lucide-react'
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { motion } from "framer-motion"
import home1 from "@/assets/home-1.jpg"
import home2 from "@/assets/home-2.jpg"
import home3 from "@/assets/home-3.jpg"
import home4 from "@/assets/home-4.jpg"
import home5 from "@/assets/home-5.jpg"
import AvatarImg from "@/assets/avatar.jpg"

// Sample notification data
const notifications = [
    {
        id: 1,
        type: "reaction",
        user: "Alex",
        userAvatar: AvatarImg,
        content: "reacted to your suggestion",
        movie: "The Avengers",
        movieImage: home1,
        time: "2 hours ago",
        read: false,
        reactionType: "like"
    },
    {
        id: 2,
        type: "watched",
        user: "Sarah",
        userAvatar: AvatarImg,
        content: "watched a movie you suggested",
        movie: "Joker",
        movieImage: home2,
        time: "Yesterday",
        read: false
    },
    {
        id: 3,
        type: "reaction",
        user: "Mike",
        userAvatar: AvatarImg,
        content: "reacted to your suggestion",
        movie: "Inception",
        movieImage: home3,
        time: "2 days ago",
        read: true,
        reactionType: "love"
    },
    {
        id: 4,
        type: "watched",
        user: "Emma",
        userAvatar: AvatarImg,
        content: "watched a movie you suggested",
        movie: "The Shallows",
        movieImage: home4,
        time: "3 days ago",
        read: true
    },
    {
        id: 5,
        type: "suggestion",
        user: "System",
        userAvatar: AvatarImg,
        content: "New movie suggestion for you",
        movie: "Split",
        movieImage: home5,
        time: "5 days ago",
        read: true
    }
]

export default function NotificationsPage() {
    const router = useRouter()
    const [notificationsList, setNotificationsList] = useState(notifications)

    const markAllAsRead = () => {
        setNotificationsList(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        )
    }

    const getNotificationIcon = (type: string, reactionType?: string) => {
        switch (type) {
            case "reaction":
                return reactionType === "love" ?
                    <Heart className="w-5 h-5 text-red-500" /> :
                    <ThumbsUp className="w-5 h-5 text-primary" />
            case "watched":
                return <Eye className="w-5 h-5 text-green-500" />
            case "suggestion":
                return <Film className="w-5 h-5 text-purple-500" />
            default:
                return <Bell className="w-5 h-5 text-primary" />
        }
    }

    const unreadCount = notificationsList.filter(n => !n.read).length

    return (
        <div className=" text-white min-h-screen pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 ">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button
                            className="mr-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold">Notifications</h1>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="p-4">
                {notificationsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Bell className="w-16 h-16 text-gray-600 mb-4" />
                        <p className="text-gray-400">No notifications yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notificationsList.map((notification, index) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center gap-3 p-3 rounded-lg ${notification.read ? "bg-[#292938]" : "bg-[#292938] border-l-4 border-primary"
                                    }`}
                            >
                                <div className="relative">
                                    <div className="relative w-10 h-10">
                                        <Image
                                            src={notification.userAvatar || "/placeholder.svg"}
                                            alt={notification.user}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#292938]">
                                        {getNotificationIcon(notification.type, notification.reactionType)}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm">
                                        <span className="font-medium">{notification.user}</span>{" "}
                                        <span className="text-gray-300">{notification.content}</span>
                                    </p>
                                    <p className="text-xs text-gray-400">{notification.movie}</p>
                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                </div>

                                <div className="relative w-12 h-16 rounded overflow-hidden">
                                    <Image
                                        src={notification.movieImage || "/placeholder.svg"}
                                        alt={notification.movie}
                                        fill
                                        className="object-cover"
                                    />
                                    {notification.type === "watched" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <Play className="w-5 h-5 text-white" fill="white" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}
