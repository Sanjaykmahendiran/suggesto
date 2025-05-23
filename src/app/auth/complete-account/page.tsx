"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import Cookies from "js-cookie"

export default function CompleteAccount() {
  const router = useRouter()
  const [userID, setUserID] = useState<string | undefined>()
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)


  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Get userID from cookies on component mount (client-side)
    const id = Cookies.get("userID")
    setUserID(id)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (data.register_level_status === 2 || data.success === true) {
        router.push("/auth/success")
      } else {
        setError(data.message || "Failed to update profile")
      }
    } catch (err) {
      setError(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#181826] px-6 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mx-auto pr-10">Create Profile</h2>
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
          <div className="w-24 h-24 rounded-full bg-[#292938] flex items-center justify-center text-white mb-2 animate-pulse">
            Uploading...
          </div>
        ) : profilePic ? (
          <img
            src={URL.createObjectURL(profilePic)}
            alt="Profile Preview"
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
        <p className="text-sm text-gray-400 mb-2">Upload Image</p>
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

        <Button
          type="submit"
          className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium mt-6"
          disabled={isSubmitting || !uploadedImageUrl}
        >
          {isSubmitting ? "Submitting..." : "Sign Up"}
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