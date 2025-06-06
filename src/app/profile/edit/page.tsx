"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import Cookies from "js-cookie"
import { BottomNavigation } from "@/components/bottom-navigation"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

interface UserData {
  user_id: number
  name: string
  email: string
  location: string
  imgname: string
  mobilenumber: string
  dob?: string
  gender?: string
}

// Skeleton Loading Component
const SkeletonLoader = () => {
  return (
    <div className="flex flex-col min-h-screen px-6 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 rounded-full bg-[#292938]"></div>
        <div className="mx-auto pr-10">
          <div className="h-6 bg-[#292938] rounded w-32"></div>
        </div>
      </div>

      {/* Profile Picture Skeleton */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-[#292938] mb-2"></div>
        <div className="h-4 bg-[#292938] rounded w-24 mb-2"></div>
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#292938] rounded w-12"></div>
          <div className="h-12 bg-[#292938] rounded-xl"></div>
        </div>

        {/* Email Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#292938] rounded w-16"></div>
          <div className="h-12 bg-[#292938] rounded-xl"></div>
        </div>

        {/* Location Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#292938] rounded w-20"></div>
          <div className="h-12 bg-[#292938] rounded-xl"></div>
        </div>

        {/* DOB Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#292938] rounded w-24"></div>
          <div className="h-12 bg-[#292938] rounded-xl"></div>
        </div>

        {/* Gender Field */}
        <div className="space-y-3">
          <div className="h-4 bg-[#292938] rounded w-16"></div>
          <div className="h-12 bg-[#292938] rounded-xl"></div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="h-12 bg-[#292938] rounded-xl mt-6"></div>
      </div>
    </div>
  )
}

export default function EditProfile() {
  const router = useRouter()
  const [userID, setUserID] = useState<string | undefined>()
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    dob: "",
    gender: "",
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Get userID from cookies on component mount (client-side)
    const id = Cookies.get("userID")
    setUserID(id)

    if (id) {
      fetchUserData(id)
    } else {
      setError("User ID not found. Please log in again.")
      setIsLoading(false)
    }
  }, [])

  const fetchUserData = async (userId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }

      const userData: UserData = await response.json()

      // Prefill form data
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        location: userData.location || "",
        dob: userData.dob || "",
        gender: userData.gender || "",
      })

      // Set existing profile image if available
      if (userData.imgname) {
        setUploadedImageUrl(userData.imgname)
      }

    } catch (err) {
      setError(`Failed to load profile data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDivClick = () => {
    inputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProfilePic(file)
    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true)
      const reader = new FileReader()

      reader.onload = async () => {
        const base64String = reader.result?.toString().split(",")[1]
        if (!base64String) return

        const response = await fetch("https://suggesto.xyz/App/api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gofor: "image_upload",
            imgname: base64String,
            type: "create account",
          }),
        })

        if (!response.ok) throw new Error("Failed to upload image")

        const data = await response.json()

        if (data.success && data.url) {
          setUploadedImageUrl(data.url)
        } else {
          setError("Failed to get image URL from server")
        }
      }

      reader.onerror = () => setError("Error reading file")

      reader.readAsDataURL(file)
    } catch (err) {
      setError(`Upload error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsUploading(false)
    }
  }

  const updateDOB = async (dob: string) => {
    if (!userID || !dob) return false

    try {
      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gofor: "usersedit",
          user_id: userID,
          dob: dob,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update date of birth")
      }

      return true
    } catch (err) {
      throw new Error(`DOB update error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const updateGender = async (gender: string) => {
    if (!userID || !gender) return false

    try {
      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gofor: "usersedit",
          user_id: userID,
          gender: gender,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update gender")
      }

      return true
    } catch (err) {
      throw new Error(`Gender update error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userID) {
      setError("User ID not found. Please log in again.")
      return
    }

    if (!uploadedImageUrl) {
      setError("Please upload a profile picture")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Update basic profile information
      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gofor: "usersedit",
          user_id: userID,
          name: formData.name,
          email: formData.email,
          location: formData.location,
          imgname: uploadedImageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()

      if (data) {
        // Update DOB if provided
        if (formData.dob) {
          await updateDOB(formData.dob)
        }

        // Update Gender if provided
        if (formData.gender) {
          await updateGender(formData.gender)
        }

        router.push("/profile")
      } else {
        setError(data.message || "Failed to update profile")
      }
    } catch (err) {
      setError(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  // Show skeleton loading while fetching data
  if (isLoading) {
    return <SkeletonLoader />
  }

  return (
    
      // <PageTransitionWrapper>
        <div className="flex flex-col min-h-screen px-6 py-8">
          <div className="flex items-center mb-8">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center"
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold mx-auto pr-10">Edit Profile</h2>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-6">
            {isUploading ? (
              <div className="w-24 h-24 rounded-full bg-[#292938] flex items-center justify-center text-white mb-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : profilePic ? (
              <img
                src={URL.createObjectURL(profilePic)}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer"
                onClick={handleDivClick}
              />
            ) : uploadedImageUrl ? (
              <img
                src={uploadedImageUrl}
                alt="Current Profile"
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
            <p className="text-sm text-gray-400 mb-2">
              {uploadedImageUrl ? "Tap to change image" : "Upload Image"}
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={inputRef}
              className="hidden"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <label htmlFor="name" className="text-gray-400 text-sm">Name</label>
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
              <label htmlFor="email" className="text-gray-400 text-sm">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="bg-[#292938] border-none h-12 rounded-xl"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="location" className="text-gray-400 text-sm">Location</label>
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
              <label htmlFor="dob" className="text-gray-400 text-sm">Date of Birth</label>
              <Input
                id="dob"
                name="dob"
                type="date"
                placeholder="Select your date of birth"
                className="bg-[#292938] border-none h-12 rounded-xl text-white"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="gender" className="text-gray-400 text-sm">Gender</label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger
                  id="gender"
                  className="w-full bg-[#292938] border-none h-12 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]"
                >
                  <SelectValue placeholder="Select your gender" className="h-12" />
                </SelectTrigger>
                <SelectContent className="bg-[#292938] text-white">
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full mt-6"
              disabled={isSubmitting || !uploadedImageUrl}
            >
              {isSubmitting ? "Saving..." : "Update Profile"}
            </Button>
          </form>
          <BottomNavigation currentPath="/profile" />
        </div>
      // </PageTransitionWrapper>
    
  )
}