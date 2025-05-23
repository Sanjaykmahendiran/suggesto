"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"

type CompleteAccountProps = {
  initialData?: {
    name: string
    mobile: string
    location: string
    preferredGenre: string
    profilePicUrl?: string 
  }
}

export default function CompleteAccount({ initialData }: CompleteAccountProps) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    location: "",
    preferredGenre: "",
  })
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [existingProfilePicUrl, setExistingProfilePicUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        mobile: initialData.mobile,
        location: initialData.location,
        preferredGenre: initialData.preferredGenre,
      })
      if (initialData.profilePicUrl) {
        setExistingProfilePicUrl(initialData.profilePicUrl)
      }
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePic(file)
      setExistingProfilePicUrl(null) // clear old preview if uploading new one
    }
  }

  const handleDivClick = () => {
    inputRef.current?.click()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitted:", { ...formData, profilePic })
    // Update or create logic here...
    router.push("/auth/success")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#181826] px-6 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mx-auto pr-10">
          Edit Profile
        </h2>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center mb-6">
        {profilePic ? (
          <img
            src={URL.createObjectURL(profilePic)}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer"
            onClick={handleDivClick}
          />
        ) : existingProfilePicUrl ? (
          <img
            src={existingProfilePicUrl}
            alt="Existing Profile"
            className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer"
            onClick={handleDivClick}
          />
        ) : (
          <div
            onClick={handleDivClick}
            className="w-24 h-24 rounded-full bg-[#292938] flex items-center justify-center text-gray-400 mb-2 cursor-pointer"
          >
            Upload
          </div>
        )}

        <p className="text-sm text-gray-400 mb-2">Upload Profile Image</p>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={inputRef}
          className="hidden"
        />
      </div>

      <h1 className="text-2xl font-bold mb-1">
        Update your profile
      </h1>
      <p className="text-gray-400 text-sm mb-6"> "Make changes to your profile below.

      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="name" className="text-gray-400 text-sm">
            Name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your full name"
            className="bg-[#292938] border-none h-12 rounded-xl"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="mobile" className="text-gray-400 text-sm">
            Mobile
          </label>
          <Input
            id="mobile"
            name="mobile"
            placeholder="Enter your mobile number"
            className="bg-[#292938] border-none h-12 rounded-xl"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="location" className="text-gray-400 text-sm">
            Location
          </label>
          <Input
            id="location"
            name="location"
            placeholder="Enter your location"
            className="bg-[#292938] border-none h-12 rounded-xl"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="preferredGenre" className="text-gray-400 text-sm">
            Preferred Genre
          </label>
          <Input
            id="preferredGenre"
            name="preferredGenre"
            placeholder="e.g., Comedy, Action, Drama, Sci-Fi"
            className="bg-[#292938] border-none h-12 rounded-xl"
            value={formData.preferredGenre}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium mt-6"
        >
          Update Profile
        </Button>
      </form>

    </div>
  )
}
