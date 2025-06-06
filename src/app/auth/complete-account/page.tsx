"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Mars, Venus } from "lucide-react"
import Cookies from "js-cookie"
import Image from "next/image"
import CakeImage from "@/assets/cake.png"
import { useUser } from "@/contexts/UserContext"

export default function CompleteAccount() {
  const router = useRouter()
  const [userID, setUserID] = useState<string | undefined>()
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null) // Added separate preview URL state
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"profile" | "gender" | "dob">("profile")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const { user, setUser } = useUser()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
  })

  const [gender, setGender] = useState("")
  const [dob, setDob] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"))
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString())

  useEffect(() => {
    // Get userID from cookies on component mount (client-side)
    const id = Cookies.get("userID")
    setUserID(id)
  }, [])

  // Cleanup preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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

    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setProfilePic(file)
    setIsUploading(true)
    setError(null)

    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setIsUploading(true); // Set loading true at start
    try {
      const reader = new FileReader();

      reader.onload = async () => {
        const result = reader.result?.toString();
        const base64String = result?.split(",")[1];

        if (!base64String) {
          setError("Image could not be read");
          setIsUploading(false);
          return;
        }

        try {
          const response = await fetch("https://suggesto.xyz/App/api.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gofor: "image_upload",
              imgname: base64String,
              type: "create account",
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Upload failed:", errorText);
            throw new Error("Failed to upload image to server");
          }

          const text = await response.text();
          console.log("Raw response text:", text);
          const data = JSON.parse(text);

          if (data.success && data.url) {
            setUploadedImageUrl(data.url);
            setPreviewUrl(result); // use base64 directly
          } else {
            console.error("Server error:", data);
            setError("Failed to get image URL from server");
          }
        } catch (err) {
          console.error("Upload error:", err);
          setError("Upload failed: " + (err instanceof Error ? err.message : String(err)));
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        console.error("File read error:", reader.error);
        setError("Error reading file");
        setIsUploading(false);
      };

      reader.readAsDataURL(file); // Start reading after setting onload/onerror
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      setIsUploading(false);
    }
  };


  const handleProfileSubmit = async (e: React.FormEvent) => {
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
        // Move to gender step
        setCurrentStep("gender")
        setError(null)
      } else {
        setError(data.message || "Failed to update profile")
      }
    } catch (err) {
      setError(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGenderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userID) {
      setError("User ID not found. Please log in again.")
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
          gender: gender,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update gender")
      }

      const data = await response.json()

      if (data) {
        // Move to DOB step
        setCurrentStep("dob")
        setError(null)
      } else {
        setError(data.message || "Failed to update gender")
      }
    } catch (err) {
      setError(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDobSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userID) {
      setError("User ID not found. Please log in again.")
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
          dob: dob,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update date of birth")
      }

      const data = await response.json()

      if (data) {
        router.push("/auth/success")
      } else {
        setError(data.message || "Failed to complete profile")
      }
    } catch (err) {
      setError(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    setError(null)
    if (currentStep === "gender") {
      setCurrentStep("profile")
    } else if (currentStep === "dob") {
      setCurrentStep("gender")
    } else {
      router.back()
    }
  }

  // Step 2: Gender Selection
  if (currentStep === "gender") {
    return (
      <div className=" fixed inset-0 flex flex-col min-h-screen px-6 py-8  text-white">
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        <div className="flex-1 flex flex-col">
          <form onSubmit={handleGenderSubmit} className="space-y-6">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold mb-2">Tell Us About Yourself</h3>
              <p className="text-gray-400">Choose your identity & help us to find accurate content for you</p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              {/* Male Option */}
              <button
                type="button"
                onClick={() => setGender("Male")}
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-colors ${gender === "Male" ? "bg-[#6c5ce7]" : " bg-[#292938]"
                  }`}
              >
                <Mars className=" w-10 h-10 " />
                <span className=" font-semibold text-2xl mt-6">Male</span>
              </button>

              {/* Female Option */}
              <button
                type="button"
                onClick={() => setGender("Female")}
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-colors ${gender === "Female" ? "bg-[#6c5ce7]" : " bg-[#292938]"
                  }`}
              >
                <Venus className=" w-10 h-10" />
                <span className=" font-semibold text-2xl mt-6">Female</span>
              </button>
            </div>

            <div className="flex space-x-4 mt-12">
              <Button
                variant="default"
                type="submit"
                className="flex-1 "
                disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Step 3: Date of Birth
  if (currentStep === "dob") {
    const handleDobFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!selectedMonth || !selectedDay || !selectedYear) {
        setError("Please select your complete date of birth")
        return
      }

      const monthIndex = months.indexOf(selectedMonth) + 1
      const formattedDob = `${selectedYear}-${monthIndex.toString().padStart(2, "0")}-${selectedDay}`
      setDob(formattedDob)

      if (!userID) {
        setError("User ID not found. Please log in again.")
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
            dob: formattedDob,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update date of birth")
        }

        const data = await response.json()

        if (data) {
          setUser(data)
          router.push("/auth/success")
        } else {
          setError(data.message || "Failed to complete profile")
        }
      } catch (err) {
        setError(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <div className="fixed inset-0 flex flex-col min-h-screen px-6 py-8  text-white">
        <div className="flex items-center mb-6">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        <div className="flex-1 flex flex-col">
          <form onSubmit={handleDobFormSubmit} className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">When is Your Birthday?</h3>
              <p className="text-gray-400">Your birthday will not be shown to the public</p>
            </div>

            {/* Birthday Cake Illustration */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Image
                  src={CakeImage}
                  alt="Birthday Cake"
                  className="w-40 h-40 mx-auto"
                />
              </div>
            </div>

            {/* Date Display */}
            <div className="flex justify-center items-center ">
              <Input
                className="text-gray-400 text-lg mb-2 max-w-[200px] border border-gray-300 rounded-md text-center"
                value={
                  selectedYear && selectedMonth && selectedDay
                    ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
                    : "1995-12-27"
                }
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setSelectedDay(date.getDate().toString());
                  setSelectedMonth((date.getMonth() + 1).toString());
                  setSelectedYear(date.getFullYear().toString());
                }}
              />
            </div>

            {/* Date Picker */}
            <div className="flex justify-center space-x-4 mb-8">
              {/* Month Picker */}
              <div className="flex flex-col items-center">
                <div className="h-40 overflow-y-auto no-scrollbar">
                  <div className="flex flex-col items-center space-y-2 py-4">
                    {months.map((month) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => setSelectedMonth(month)}
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedMonth === month ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                          }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Day Picker */}
              <div className="flex flex-col items-center">
                <div className="h-40 overflow-y-auto no-scrollbar">
                  <div className="flex flex-col items-center space-y-2 py-4">
                    {days.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedDay === day ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Year Picker */}
              <div className="flex flex-col items-center">
                <div className="h-40 overflow-y-auto no-scrollbar">
                  <div className="flex flex-col items-center space-y-2 py-4">
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setSelectedYear(year)}
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedYear === year ? "bg-primary text-white" : "text-gray-400 hover:text-white"
                          }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="fixed bottom-6 left-6 right-6 flex space-x-4">
              <Button
                variant="default"
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Completing..." : "Continue"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Step 1: Profile Creation (Default)
  return (
    <div className="fixed inset-0 flex flex-col min-h-screen px-6 py-8  text-white">
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">{error}</div>
      )}

      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center mb-6">
        {isUploading ? (
          <div className="w-24 h-24 rounded-full bg-[#292938] flex flex-col items-center justify-center text-white mb-2 animate-pulse border-2 border-gray-600">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
            <span className="text-xs">Uploading...</span>
          </div>
        ) : previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover mb-2 cursor-pointer border-2 border-green-500"
            onClick={handleDivClick}
          />
        ) : (
          <div
            onClick={handleDivClick}
            className="w-24 h-24 rounded-full bg-[#292938] flex items-center justify-center text-gray-400 mb-2 cursor-pointer hover:bg-[#3a3a4a] transition-colors border-2 border-dashed border-gray-600"
          >
            <span className="text-xs">Upload</span>
          </div>
        )}
        <p className="text-sm text-gray-400 mb-2">
          {isUploading ? "Processing image..." : "Upload Image"}
        </p>
        <input type="file" accept="image/*" onChange={handleImageChange} ref={inputRef} className="hidden" />
      </div>

      <form onSubmit={handleProfileSubmit} className="space-y-4">
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
          <label htmlFor="email" className="text-gray-400 text-sm">
            Email
          </label>
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

        <Button type="submit" variant="default" className="w-full  mt-6" disabled={isSubmitting || !uploadedImageUrl}>
          {isSubmitting ? "Saving..." : "Continue"}
        </Button>
      </form>
    </div>
  )
}