"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ArrowLeft, Bell, Film } from 'lucide-react'
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import AvatarImg from "@/assets/avatar.jpg"

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

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch("https://suggesto.xyz/App/api.php?gofor=notifications")
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
        <div className="text-white min-h-screen pb-20">
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

                    {unreadCount > 0 && !loading && (
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
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 rounded-lg "
                            >
                                <Skeleton className="w-10 h-10 rounded-full bg-[#292938]" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/2 bg-[#292938]" />
                                    <Skeleton className="h-3 w-3/4 bg-[#292938]" />
                                    <Skeleton className="h-3 w-1/3 bg-[#292938]" />
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
                                className={`flex items-center gap-3 p-3 rounded-lg ${
                                    notification.is_read
                                        ? "bg-[#292938]"
                                        : "bg-[#292938] border-l-4 border-primary"
                                }`}
                            >
                                <div className="relative w-10 h-10">
                                    <Image
                                        src={AvatarImg}
                                        alt="User Avatar"
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#292938]">
                                        <Film className="w-5 h-5 text-purple-500" />
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
    )
}
