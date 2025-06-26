"use client"

import Image from "next/image"
import Link from "next/link"
import { Crown } from "lucide-react"
import logo from "@/assets/bg-logo.jpg"
import { useUser } from "@/contexts/UserContext"
import DefaultImage from "@/assets/default-user.webp"

type User = {
  name?: string
  imgname?: string
}


export default function Header() {
  const { user, setUser } = useUser()

  return (
    <div className="flex justify-between items-center p-4 pt-8">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 overflow-hidden">
          <Image
            src={logo}
            alt="Logo"
            width={36}
            height={36}
            className="items-center object-cover"
          />
        </div>
        <div>
          <h1 className="text-sm font-semibold">Hello {user?.name || "User"}</h1>
          <p className="text-xs text-gray-400">Scroll. Suggest. Stream.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Link
          href="/premium"
          className="border bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white rounded-full w-10 h-10 flex items-center justify-center"
        >
          <Crown className="w-5 h-5" />
        </Link>
        <Link href="/profile">
          <div className="h-10 w-10 rounded-full p-[2px] bg-gradient-to-tr from-[#b56bbc] to-[#7a71c4]">
            <div className="h-full w-full rounded-full overflow-hidden bg-black">
              <Image
                src={user?.imgname || DefaultImage}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
