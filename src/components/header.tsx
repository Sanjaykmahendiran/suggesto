"use client"

import Image from "next/image"
import Link from "next/link"
import { Crown } from "lucide-react"
import logo from "@/assets/bg-logo.jpg"
import { useUser } from "@/contexts/UserContext"

type User = {
  name?: string
  imgname?: string
}


export default function Header() {
  const { user, setUser } = useUser()
  
  return (
    <div className="flex justify-between items-center p-4">
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
          className="border bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center"
        >
          <Crown className="w-5 h-5" />
        </Link>
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
            <Image
              src={user?.imgname || "/placeholder.svg"}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </div>
  )
}
