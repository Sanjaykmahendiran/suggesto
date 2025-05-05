"use client"

import type React from "react"

import { Bell, ChevronRight, CreditCard, Gift, LogOut, MapPin, Star, Truck, User, ChevronLeft, ArrowLeft, BarChart, Download, Heart, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import home1 from "@/assets/home-1.jpg"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"


export default function AccountPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-primary">My Account</h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative">
            <Bell className="h-6 w-6 text-gray-500" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              1
            </span>
          </button>
          <button className="flex flex-col gap-1.5" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="h-0.5 w-6 bg-gray-700"></div>
            <div className="h-0.5 w-6 bg-gray-700"></div>
            <div className="h-0.5 w-6 bg-gray-700"></div>
          </button>
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-gray-500">
            <Image
              src={home1}
              alt="Profile"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="px-6 pb-8">

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              SK
            </div>
            <div>
              <h2 className="font-semibold text-xl">Sanjaykumar</h2>
              <p className="text-sm text-slate-400">@sk222</p>
            </div>
          </div>

          {/* Move this section outside the profile info row */}
          <div className="w-full flex justify-between mt-6 px-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">143</p>
              <p className="text-gray-400 text-sm">Watched</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">37</p>
              <p className="text-gray-400 text-sm">Favorites</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">28</p>
              <p className="text-gray-400 text-sm">Friends</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col">
          <MenuItem icon={<User className="h-6 w-6 text-gray-500" />} label="Edit Profile" link={"/profile/edit"} />
          <MenuItem icon={<Download className="h-6 w-6 text-gray-500" />} label="Downloads" link={"/download"} />
          <MenuItem icon={<BarChart className="h-6 w-6 text-gray-500" />} label="Watch Stats" link={"/watch-stats"} />
          <MenuItem icon={<Users className="h-6 w-6 text-gray-500" />} label="Friends" link={"/friends"} />
          <MenuItem icon={<Heart className="h-6 w-6 text-gray-500" />} label="Friend Recommendations" link={"/friend-recommendations"} />
          <MenuItem icon={<CreditCard className="h-6 w-6 text-gray-500" />} label="Payment methods" link={""} />
          <MenuItem icon={<Bell className="h-6 w-6 text-gray-500" />} label="Notification" link={""} />
          <MenuItem icon={<Gift className="h-6 w-6 text-gray-500" />} label="Refer & Earn" link={""} />
          <MenuItem icon={<LogOut className="h-6 w-6 text-gray-500" />} label="Log out" link={"/"} />
        </div>

        {/* Share App Button */}
        <Button className="mt-8 w-full rounded-full py-6 text-xl font-semibold text-white">
          Share App
        </Button>
      </main>
    </div>
  )
}

function MenuItem({ icon, label, link }: { icon: React.ReactNode; label: string, link: string }) {
  return (
    <Link href={link} className="flex items-center justify-between border-b border-gray-200 py-5">
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-xl text-white">{label}</span>
      </div>
      <ChevronRight className="h-6 w-6 text-gray-400" />
    </Link>
  )
}