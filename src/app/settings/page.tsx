"use client"

import {
    Bell, ChevronRight, LogOut,
    Settings, HelpCircle, Shield, Info,
    ArrowLeft, Contact, Globe, Music, Crown, Users
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/bottom-navigation"
import AvatarImg from "@/assets/avatar.jpg"
import Cookies from "js-cookie"
import useLogout from "@/hooks/useLogout";


export default function ProfilePage() {
    
    const logout = useLogout();
    const [notificationCount, setNotificationCount] = useState(3)
    const [genreInterests, setGenreInterests] = useState<string[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const router = useRouter()

    useEffect(() => {
        const userId = Cookies.get("userID")
        if (userId) {
            fetch(`https://suggesto.xyz/App/api.php?gofor=userintlist&user_id=${userId}`)
                .then(res => res.json())
                .then(data => {
                    const genres = data.map((item: any) => item.genre_name)
                    setGenreInterests(genres)
                })
                .catch(err => {
                    console.error("Failed to fetch genre interests:", err)
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [])

    const userData = {
        name: "Sanjaykumar",
        username: "@sk222",
        avatar: AvatarImg,
        stats: {
            watched: 143,
            favorites: 37,
            friends: 28
        }
    }

    const handleShare = () => {
        if (navigator.canShare?.()) {
            navigator.share({
                title: "Suggesto",
                text: "Check out Suggesto – your personalized movie and show recommendations!",
                url: "https://suggesto.top",
            }).catch((error) => console.error("Error sharing:", error));
        } else {
            alert("Sharing is not supported on this device.");
        }
    };



    return (
        <div className="flex flex-col min-h-screen text-white mb-18">
            {/* Header */}
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        aria-label="Notifications"
                        className="text-gray-300 relative"
                        onClick={() => router.push("/notifications")}
                    >
                        <Bell className="w-5 h-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {notificationCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Profile Info */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-primary">
                        <Image
                            src={userData.avatar}
                            alt="Profile"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="font-semibold text-2xl">{userData.name}</h2>
                        <p className="text-sm text-gray-400">{userData.username}</p>
                    </div>
                </div>
            </div>

            {/* Overview Content */}
            <main className="flex-1 px-6 py-4">
                <div className="flex flex-col">
                    <div className="space-y-1">
                        <MenuItem icon={<HelpCircle className="h-5 w-5 text-gray-400" />} label="FAQs" link="/faq" />
                        <MenuItem icon={<Contact className="h-5 w-5 text-gray-400" />} label="Support" link="/contactus" />
                        <MenuItem icon={<Shield className="h-5 w-5 text-gray-400" />} label="Policies" link="/policies" />
                        <MenuItem icon={<Info className="h-5 w-5 text-gray-400" />} label="About" link="/aboutus" />
                        <MenuItem
                            icon={<LogOut className="h-5 w-5 text-red-400" />}
                            label="Log out"
                            onClick={logout}
                            danger
                        />

                    </div>

                    {/* Share App Button */}
                    <Button
                        onClick={handleShare}
                        className="mt-8 w-full rounded-full py-4 text-xl font-semibold text-white"
                    >
                        Share App
                    </Button>

                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation currentPath="/profile" />
        </div>
    )
}

function MenuItem({
    icon,
    label,
    link,
    onClick,
    danger = false
}: {
    icon: React.ReactNode;
    label: string;
    link?: string;
    onClick?: () => void;
    danger?: boolean;
}) {
    const className = `flex items-center justify-between py-4 border-b border-gray-700 ${danger ? 'text-red-400' : 'text-white'}`;

    if (onClick) {
        return (
            <button onClick={onClick} className={`${className} w-full text-left`}>
                <div className="flex items-center gap-4">
                    {icon}
                    <span>{label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
        );
    }

    return (
        <Link href={link!} className={className}>
            <div className="flex items-center gap-4">
                {icon}
                <span>{label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-500" />
        </Link>
    );
}
