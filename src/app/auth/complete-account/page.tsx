"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function CompleteAccount() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically call an API to create the account
    console.log("Account created:", formData)
    // Redirect to dashboard or home page after successful signup
    router.push("/auth/verify-otp")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#121212] px-6 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mx-auto pr-10">Sign Up</h2>
      </div>

      <h1 className="text-2xl font-bold mb-1">Complete your account</h1>
      <p className="text-gray-400 text-sm mb-6">Finish setting up your account now.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="firstName" className="text-gray-400 text-sm">
            First Name
          </label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Enter your email address"
            className="bg-[#1e1e1e] border-none h-12 rounded-xl"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="lastName" className="text-gray-400 text-sm">
            Last Name
          </label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Enter your name"
            className="bg-[#1e1e1e] border-none h-12 rounded-xl"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="email" className="text-gray-400 text-sm">
            E-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="bg-[#1e1e1e] border-none h-12 rounded-xl"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="password" className="text-gray-400 text-sm">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="bg-[#1e1e1e] border-none h-12 rounded-xl pr-10"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="confirmPassword" className="text-gray-400 text-sm">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="bg-[#1e1e1e] border-none h-12 rounded-xl pr-10"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium mt-6">
          Sign Up
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
