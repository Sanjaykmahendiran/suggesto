"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeft, Bell, Film } from 'lucide-react'
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import AvatarImg from "@/assets/avatar.jpg"
import Cookies from "js-cookie"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

interface Notification {
    id: number
    user_id: number
    title: string
    message: string
    is_read: number
    created_date: string
}

export default function NotificationsPage() {
    const router = useRouter()
    const [notificationsList, setNotificationsList] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const userId = Cookies.get("userID")

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`https://suggesto.xyz/App/api.php?gofor=notifications&user_id=${userId}`)
                const data = await res.json()
                setNotificationsList(data)
            } catch (error) {
                console.error("Error fetching notifications:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [])

    const markAllAsRead = () => {
        setNotificationsList(prev =>
            prev.map(notification => ({ ...notification, is_read: 1 }))
        )
    }

    const unreadCount = notificationsList.filter(n => n.is_read === 0).length

    return (

        // <PageTransitionWrapper>
        <div className="text-white min-h-screen pb-20 ">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-8 mb-4">
                <div className="flex items-center gap-3">
                    <button
                        className="mr-2 p-2 rounded-full bg-[#2b2b2b] hover:bg-gray-600 transition-colors"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Notifications</h1>
                </div>

                {unreadCount > 0 && !loading && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm text-primary"
                    >
                        Mark all as read
                    </button>
                )}
            </div>


            {/* Notifications List */}
            <div className="p-4">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-lg "
                            >
                                <Skeleton className="w-10 h-10 rounded-full bg-[#2b2b2b]" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/2 bg-[#2b2b2b]" />
                                    <Skeleton className="h-3 w-3/4 bg-[#2b2b2b]" />
                                    <Skeleton className="h-3 w-1/3 bg-[#2b2b2b]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notificationsList.length === 0 ? (
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
                                className={`relative flex items-center gap-3 p-3 rounded-lg ${notification.is_read ? "bg-[#2b2b2b]" : "bg-[#2b2b2b]"
                                    } ${!notification.is_read ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-lg before:bg-gradient-to-b before:from-[#b56bbc] before:to-[#7a71c4]" : ""}`}
                            >
                                <div className="relative w-10 h-10">
                                    <Image
                                        src={AvatarImg}
                                        alt="User Avatar"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#2b2b2b]">
                                        <Film className="w-5 h-5 text-[#b56bbc]" />
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm font-medium">{notification.title}</p>
                                    <p className="text-xs text-gray-300">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{notification.created_date}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        // </PageTransitionWrapper>

    )
}
