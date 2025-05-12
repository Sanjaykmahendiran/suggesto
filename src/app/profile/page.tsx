"use client"

import {
  Bell, ChevronRight, CreditCard, LogOut,
  Settings, Film, Bookmark, Star, Heart,
  Users, Clock, HelpCircle, Shield, Info,
  ArrowLeft
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/bottom-navigation"
import  AvatarImg from "@/assets/avatar.jpg"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const [notificationCount, setNotificationCount] = useState(3)

  // Mock user data - would come from API/state in real app
  const userData = {
    name: "Sanjaykumar",
    username: "@sk222",
    avatar: AvatarImg, // Replace with actual path
    stats: {
      watched: 143,
      favorites: 37,
      friends: 28
    },
    genreInterests: ["Action", "Sci-Fi", "Thriller", "Comedy"]
  }

  return (
    <div className="flex flex-col min-h-screen text-white mb-18 ">
      {/* Header */}
      <header className="flex items-center justify-between p-4 ">
        <div className="flex items-center gap-2">
          <button
            className="mr-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">My Profile</h1>
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
          <Link href="/settings">
            <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
              <Settings className="h-5 w-5 text-gray-300" />
            </button>
          </Link>
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

          {/* Name and Username */}
          <div>
            <h2 className="font-semibold text-2xl">{userData.name}</h2>
            <p className="text-sm text-gray-400">{userData.username}</p>
          </div>
        </div>

        {/* Genre Interests Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {userData.genreInterests.map((genre, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="w-full flex justify-between mt-6 px-4 py-3 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{userData.stats.watched}</p>
            <p className="text-gray-300 text-xs">Watched</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{userData.stats.favorites}</p>
            <p className="text-gray-300 text-xs">Favorites</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{userData.stats.friends}</p>
            <p className="text-gray-300 text-xs">Friends</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          className={`flex-1 py-3 text-center ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`flex-1 py-3 text-center ${activeTab === 'watchlist' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('watchlist')}
        >
          Watchlist
        </button>
        <button
          className={`flex-1 py-3 text-center ${activeTab === 'watched' ? 'border-b-2 border-primary text-primary font-medium' : 'text-gray-400'}`}
          onClick={() => setActiveTab('watched')}
        >
          Watched
        </button>
      </div>

      {/* Main Content Based on Tab */}
      <main className="flex-1 px-6 py-4">
        {activeTab === 'overview' && (
          <div className="flex flex-col">

            {/* Settings Section */}
            <h3 className="text-lg font-medium mb-4">Settings</h3>
            <div className="mb-6 space-y-1">
              <MenuItem
                icon={<Bell className="h-5 w-5 text-gray-400" />}
                label="Notifications"
                link="/notifications"
              />
              <MenuItem
                icon={<Shield className="h-5 w-5 text-gray-400" />}
                label="Privacy & Security"
                link="/privacy"
              />
            </div>

            {/* Help Section */}
            <h3 className="text-lg font-medium mb-4">Help & About</h3>
            <div className="space-y-1">
              <MenuItem
                icon={<HelpCircle className="h-5 w-5 text-gray-400" />}
                label="FAQs & Support"
                link="/faq-contactus"
              />
              <MenuItem
                icon={<Info className="h-5 w-5 text-gray-400" />}
                label="About"
                link="/about"
              />
              <MenuItem
                icon={<LogOut className="h-5 w-5 text-red-400" />}
                label="Log out"
                link="/"
                danger
              />
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="flex flex-col items-center justify-center h-64">
            <Bookmark className="h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400">Your watchlist content will appear here</p>
            <Button className="mt-4 px-6" variant="default">Browse Movies</Button>
          </div>
        )}

        {activeTab === 'watched' && (
          <div className="flex flex-col items-center justify-center h-64">
            <Clock className="h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400">Your watch history will appear here</p>
            <Button className="mt-4 px-6" variant="default">Browse Movies</Button>
          </div>
        )}
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
  danger = false
}: {
  icon: React.ReactNode;
  label: string;
  link: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={link}
      className={`flex items-center justify-between py-4 border-b border-gray-700 ${danger ? 'text-red-400' : 'text-white'}`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-500" />
    </Link>
  )
}