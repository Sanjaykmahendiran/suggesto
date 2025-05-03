"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Apple, Chrome } from "lucide-react"

export default function CreateAccount() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      router.push("/auth/complete-account")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#6c5ce7] ">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
        <p className="text-white/90 text-center mb-6">Quickly sign up to get started!</p>
      </div>

      <div className="bg-[#121212] rounded-t-3xl flex-1 px-6 pt-8 pb-4  flex flex-col">
        <form onSubmit={handleContinue} className="space-y-6">
          <div className="space-y-6">
            <label htmlFor="email" className="text-gray-400 text-sm mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              className="bg-[#1e1e1e] border-none h-12 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium">
            Continue with Email
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-4 text-sm text-gray-400">Or continue with</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full border-gray-700 bg-transparent text-white h-12 rounded-full flex items-center justify-center space-x-2"
          >
            <Chrome className="h-5 w-5 text-red-500" />
            <span>Continue with Google</span>
          </Button>

          <Button
            variant="outline"
            className="w-full border-gray-700 bg-transparent text-white h-12 rounded-full flex items-center justify-center space-x-2"
          >
            <Apple className="h-5 w-5 text-white" />
            <span>Continue with Apple</span>
          </Button>
        </div>

        <div className="mt-auto pt-6 text-center">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <a href="/auth/login" className="text-[#6c5ce7]">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
