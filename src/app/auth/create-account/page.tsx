"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CreateAccount() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus the input on mount
    emailInputRef.current?.focus()
  }, [])

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      router.push("/auth/verify-otp")
    }
  }

  return (
    <div className=" rounded-t-3xl flex-1 px-6 pt-8 pb-4 mt-18 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-white/90 text-center mb-6">Quickly sign up to get started!</p>
      </div>
      <form onSubmit={handleContinue} className="space-y-6">
        <div className="space-y-6">
          <label htmlFor="email" className="text-gray-400 text-sm mb-4">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className="bg-[#292938] border-none h-12 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            ref={emailInputRef}
            required
          />
        </div>

        <Button type="submit" className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium">
          Continue with Email
        </Button>
      </form>

      <div className="mt-auto pt-6 text-center">
        <p className="text-gray-400 text-sm">
          Already have an account?{" "}
          <a href="/auth/login" className="text-[#6c5ce7]">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}
