"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { MultiSelect } from "@/components/multi-select"

const genreOptions = [
  { value: "Comedy", label: "Comedy" },
  { value: "Action", label: "Action" },
  { value: "Drama", label: "Drama" },
  { value: "Sci-Fi", label: "Sci-Fi" },
]

export default function CompleteAccount() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    location: "",
    preferredGenre: [] as string[],
  })

  const [profilePic, setProfilePic] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
    }
  };

  const handleDivClick = () => {
    inputRef.current?.click();
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log("Submitted:", { ...formData, profilePic })
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
        <h2 className="text-xl font-semibold mx-auto pr-10">Sign Up</h2>
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

      <h1 className="text-2xl font-bold mb-1">Complete your account</h1>
      <p className="text-gray-400 text-sm mb-6">Finish setting up your account now.</p>

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
          <label htmlFor="mobile" className="text-gray-400 text-sm">Mobile</label>
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
          <label htmlFor="preferredGenre" className="text-gray-400 text-sm">Preferred Genre</label>
          <MultiSelect
            options={genreOptions.map((genre) => genre.value)}
            value={formData.preferredGenre}
            defaultValue={formData.preferredGenre}
            onValueChange={(selected: string[]) =>
              setFormData((prev) => ({ ...prev, preferredGenre: selected }))
            }
            placeholder="Select genres"
            variant="default"
            maxCount={3}
            className="bg-[#292938] text-white border-none h-12 rounded-xl"
            id="preferredGenre"
            name="preferredGenre"
          />
        </div>

        <Button
          type="submit"
          className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium mt-6"
        >
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
