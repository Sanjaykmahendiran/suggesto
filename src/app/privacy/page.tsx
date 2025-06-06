"use client"

import { User, Bell, Ban, ChevronRight, ArrowLeft, ArrowRight, UserX } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import NoBlockedUsers from "@/assets/no-blocked-users.png" 
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"


export default function SettingsPage() {
    const router = useRouter()
    const [showModal, setShowModal] = useState(false)
    const [showNotificationModal, setShowNotificationModal] = useState(false)
    const [showBlockedUsers, setShowBlockedUsers] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState("Everyone")
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)

    type BlockedUser = {
        friend_id: number
        name: string
        genre: string
        profile_pic?: string
    }

    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])

    const menuItems = [
        {
            label: "Profile",
            subLabel: selectedStatus,
            icon: <User className="w-5 h-5 text-white" />,
            iconBg: "bg-purple-600",
            onClick: () => setShowModal(true)
        },
        {
            label: "Notifications",
            subLabel: notificationsEnabled ? "on" : "off",
            icon: <Bell className="w-5 h-5 text-white" />,
            iconBg: "bg-blue-600",
            onClick: () => setShowNotificationModal(true)
        },
        {
            label: "Blocked Users",
            subLabel: "Check list of blocked users",
            icon: <Ban className="w-5 h-5 text-white" />,
            iconBg: "bg-red-600",
            onClick: () => setShowBlockedUsers(true)
        }
    ]

    if (showBlockedUsers) {
        return (
            <div className="min-h-screen px-6 py-4 text-white">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        className="p-2 rounded-full bg-[#292938] transition-colors"
                        onClick={() => setShowBlockedUsers(false)}
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <div className="max-w-md mx-auto">
                    {blockedUsers.length > 0 ? (
                        <div className="space-y-4">
                            {blockedUsers.map((user) => (
                                <div key={user.friend_id} className="flex items-center justify-between p-4 bg-[#292938] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12">
                                            <img
                                                src={user.profile_pic || "/api/placeholder/48/48"}
                                                alt={user.name}
                                                className="w-full h-full rounded-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/api/placeholder/48/48"
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.name}</p>
                                            <p className="text-gray-400 text-sm">{user.genre}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center justify-center w-10 h-10 bg-[#6c5ce7] hover:bg-[#5d4fd7] rounded-full transition-colors">
                                            <ArrowRight size={16} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-100px)]">
                            <div className="mb-6">
                                <div className="w-40 h-40 rounded-full overflow-hidden mx-auto relative">
                                    <Image
                                        src= {NoBlockedUsers}
                                        alt="User"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2">
                                No blocked users
                            </h3>
                            <p className="text-gray-400 text-lg">
                                You haven't blocked anyone!<br />
                                You are really a wonderful human
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (

//   <PageTransitionWrapper>
        <div className="min-h-screen px-6 py-4 text-white">
            <div className="flex items-center gap-4 mb-8">
                <button
                    className="p-2 rounded-full bg-[#292938] transition-colors"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold">Privacy</h1>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
                {menuItems.map((item, idx) => (
                    <div
                        key={idx}
                        onClick={item.onClick}
                        className="flex items-center justify-between px-4 py-4 border-b border-gray-400 rounded-lg cursor-pointer transition-colors duration-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl ${item.iconBg}`}>
                                {item.icon}
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="font-medium">{item.label}</span>
                                <span className="text-sm text-gray-400">{item.subLabel}</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                ))}
            </div>

            {/* Profile Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="bg-[#1a1a2e] rounded-xl p-6 w-full max-w-sm text-white shadow-xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-xl leading-none text-gray-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-center text-primary pr-8">
                            Profile View Status
                        </h2>
                        <div className="space-y-2 mb-6">
                            {["Everyone", "Contacts", "Nobody"].map((option) => (
                                <label key={option} className="flex items-center gap-3 py-2 cursor-pointer rounded-md px-2 transition-colors">
                                    <Input
                                        type="radio"
                                        name="profileViewStatus"
                                        value={option}
                                        checked={selectedStatus === option}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-8 h-8 bg-primary"
                                    />
                                    <span className="text-lg">{option}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowModal(false)} className="text-sm flex-1">
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                console.log('Selected status:', selectedStatus);
                                setShowModal(false);
                            }} className="text-sm font-semibold flex-1">
                                Submit
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Notifications Modal */}
            {showNotificationModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="bg-[#1a1a2e] rounded-xl p-6 w-full max-w-sm text-white shadow-xl relative">
                        <button
                            onClick={() => setShowNotificationModal(false)}
                            className="absolute top-3 right-3 text-xl leading-none text-gray-400 hover:text-white transition-colors w-6 h-6 flex items-center justify-center"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-center text-primary pr-8">
                            Notifications
                        </h2>
                        <div className="space-y-2 mb-6">
                            {[{ value: true, label: "On" }, { value: false, label: "Off" }].map((option) => (
                                <label key={option.label} className="flex items-center gap-3 py-2 cursor-pointer rounded-md px-2 transition-colors">
                                    <Input
                                        type="radio"
                                        name="notificationStatus"
                                        value={option.value.toString()}
                                        checked={notificationsEnabled === option.value}
                                        onChange={() => setNotificationsEnabled(option.value)}
                                        className="w-8 h-8 bg-primary"
                                    />
                                    <span className="text-lg">{option.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowNotificationModal(false)} className="text-sm flex-1">
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                console.log('Notifications enabled:', notificationsEnabled);
                                setShowNotificationModal(false);
                            }} className="text-sm font-semibold flex-1">
                                Submit
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
        // </PageTransitionWrapper>
           
    )
}
