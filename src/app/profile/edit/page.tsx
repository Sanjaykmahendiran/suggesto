"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ChevronDown } from "lucide-react"
import { BottomNavigation } from "@/components/bottom-navigation"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import toast from "react-hot-toast"
import EditSkeletonLoader from "../_components/edit-loading"

interface UserData {
  user_id: number
  name: string
  email: string
  location: string
  imgname: string
  mobilenumber: string
  dob?: string
  gender?: string
  country?: string
  state?: string
}

type LocationItem = { id: string; name: string }

export default function EditProfile() {
  const router = useRouter()
  const [userID, setUserID] = useState<string | undefined>()
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const [countries, setCountries] = useState<LocationItem[]>([])
  const [states, setStates] = useState<LocationItem[]>([])
  const [cities, setCities] = useState<LocationItem[]>([])

  const [selectedCountryId, setSelectedCountryId] = useState("")
  const [selectedStateId, setSelectedStateId] = useState("")
  const [countrySearch, setCountrySearch] = useState("")
  const [stateSearch, setStateSearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [showCountryPopup, setShowCountryPopup] = useState(false)
  const [showStatePopup, setShowStatePopup] = useState(false)
  const [showCityPopup, setShowCityPopup] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    dob: "",
    gender: "",
    country: "",
    state: "",
  })

  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Load countries on component mount
  useEffect(() => {
    fetch("https://techades.com/App/api.php?gofor=countrieslist")
      .then(res => res.json())
      .then(setCountries)
      .catch(() => toast.error("Failed to load countries"))
  }, [])

  // Load user data when userID and countries are available
  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem("userID") : null
    setUserID(id)

    if (id && countries.length > 0 && !initialDataLoaded) {
      fetchUserData(id)
    } else if (!id) {
      toast.error("User ID not found. Please log in again.")
      setIsLoading(false)
    }
  }, [countries, initialDataLoaded])

  // Set country ID and fetch states when user data is loaded
  useEffect(() => {
    if (formData.country && countries.length > 0 && initialDataLoaded) {
      const country = countries.find(c => c.name === formData.country)
      if (country && country.id !== selectedCountryId) {
        setSelectedCountryId(country.id)
      }
    }
  }, [formData.country, countries, initialDataLoaded])

  // Fetch states when country ID is set
  useEffect(() => {
    if (!selectedCountryId) return

    fetch(`https://techades.com/App/api.php?gofor=stateslist&country_id=${selectedCountryId}`)
      .then(res => res.json())
      .then(data => {
        setStates(data)

        // After states are loaded, set the selected state ID if we have user's state data
        if (formData.state && initialDataLoaded) {
          const state = data.find((s: LocationItem) => s.name === formData.state)
          if (state && state.id !== selectedStateId) {
            setSelectedStateId(state.id)
          }
        }
      })
      .catch(() => toast.error("Failed to load states"))
  }, [selectedCountryId])

  // Fetch cities when state ID is set
  useEffect(() => {
    if (!selectedStateId) return

    fetch(`https://techades.com/App/api.php?gofor=citieslist&state_id=${selectedStateId}`)
      .then(res => res.json())
      .then(setCities)
      .catch(() => toast.error("Failed to load cities"))
  }, [selectedStateId])

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(stateSearch.toLowerCase())
  )

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  )

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
        country: userData.country || "",
        state: userData.state || "",
      })

      // Set existing profile image if available
      if (userData.imgname) {
        setUploadedImageUrl(userData.imgname)
      }

      setInitialDataLoaded(true)

    } catch (err) {
      toast.error(`Failed to load profile data: ${err instanceof Error ? err.message : String(err)}`)
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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, or WebP)")
      return
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB")
      return
    }

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
          toast.error("Failed to get image URL from server")
        }
      }

      reader.onerror = () => toast.error("Error reading file")

      reader.readAsDataURL(file)
    } catch (err) {
      toast.error(`Upload error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userID) {
      toast.error("User ID not found. Please log in again.")
      return
    }

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    if (!formData.email.trim()) {
      toast.error("Email is required")
      return
    }

    if (!formData.location.trim()) {
      toast.error("Location is required")
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the payload with all user information
      const payload = {
        gofor: "usersedit",
        user_id: userID,
        name: formData.name.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        ...(uploadedImageUrl && { imgname: uploadedImageUrl }),
        ...(formData.dob && { dob: formData.dob }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.country && { country: formData.country }),
        ...(formData.state && { state: formData.state }),
      }

      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()

      if (data.success !== false) {
        toast.success("Profile updated successfully!")
        router.push("/profile")
      } else {
        toast.error(data.message || "Failed to update profile")
      }
    } catch (err) {
      toast.error(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  // Show skeleton loading while fetching data
  if (isLoading) {
    return <EditSkeletonLoader />
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-9">
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-[#2b2b2b] flex items-center justify-center"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mx-auto pr-10">Edit Profile</h2>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center mb-6">
        {isUploading ? (
          <div className="w-24 h-24 rounded-full bg-[#2b2b2b] flex items-center justify-center text-white mb-2">
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
            className="w-24 h-24 rounded-full bg-[#2b2b2b] flex items-center justify-center text-gray-400 mb-2 cursor-pointer"
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
          <label htmlFor="name" className="text-gray-400 text-sm">Name *</label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your full name"
            className="bg-[#2b2b2b] border-none h-12 rounded-xl"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="email" className="text-gray-400 text-sm">Email *</label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="bg-[#2b2b2b] border-none h-12 rounded-xl"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-gray-400 text-sm">Country</label>
          <button
            type="button"
            onClick={() => setShowCountryPopup(true)}
            className="w-full bg-[#2b2b2b] border-none h-12 rounded-xl px-3 text-left text-white flex items-center justify-between"
          >
            <span className={formData.country ? "text-white" : "text-gray-400"}>
              {formData.country || "Select your country"}
            </span>
            <span className="text-gray-400"><ChevronDown className="w-4 h-4 " /></span>
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-gray-400 text-sm">State</label>
          <button
            type="button"
            onClick={() => selectedCountryId ? setShowStatePopup(true) : toast.error("Please select a country first")}
            disabled={!selectedCountryId}
            className={`w-full bg-[#2b2b2b] border-none h-12 rounded-xl px-3 text-left flex items-center justify-between ${!selectedCountryId ? "opacity-50 cursor-not-allowed" : "text-white"
              }`}
          >
            <span className={formData.state ? "text-white" : "text-gray-400"}>
              {formData.state || "Select your state"}
            </span>
            <span className="text-gray-400"><ChevronDown className="w-4 h-4 " /></span>
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-gray-400 text-sm">City *</label>
          <button
            type="button"
            onClick={() => selectedStateId ? setShowCityPopup(true) : toast.error("Please select a state first")}
            disabled={!selectedStateId}
            className={`w-full bg-[#2b2b2b] border-none h-12 rounded-xl px-3 text-left flex items-center justify-between ${!selectedStateId ? "opacity-50 cursor-not-allowed" : "text-white"
              }`}
          >
            <span className={formData.location ? "text-white" : "text-gray-400"}>
              {formData.location || "Select your city"}
            </span>
            <span className="text-gray-400"><ChevronDown className="w-4 h-4 " /></span>
          </button>
        </div>

        <div className="space-y-3">
          <label htmlFor="dob" className="text-gray-400 text-sm">Date of Birth</label>
          <Input
            id="dob"
            name="dob"
            type="date"
            placeholder="Select your date of birth"
            className="bg-[#2b2b2b] border-none h-12 rounded-xl text-white"
            value={formData.dob}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
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
              className="w-full bg-[#2b2b2b] border-none rounded-xl px-3 py-6 text-white focus:outline-none focus:ring-2 focus:ring-[#b56bbc]"
            >
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent className="bg-[#2b2b2b] text-white rounded-xl">
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
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? "Saving..." : "Update Profile"}
        </Button>
      </form>
      <BottomNavigation currentPath="/profile" />

      {showCountryPopup && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2b2b2b] rounded-xl w-full max-w-md h-[50vh] flex flex-col">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Select Country</h3>
                <button
                  onClick={() => setShowCountryPopup(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <Input
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="bg-[#1a1a1a] border-gray-600 text-white"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredCountries.map((country) => (
                <button
                  type="button"
                  key={country.id}
                  onClick={() => {
                    const selectedCountry = countries.find(c => c.name === country.name)
                    if (selectedCountry) {
                      setSelectedCountryId(selectedCountry.id)
                    }
                    setFormData((prev) => ({
                      ...prev,
                      country: country.name,
                      state: "",
                      location: ""
                    }))
                    setStates([])
                    setCities([])
                    setSelectedStateId("")
                    setCountrySearch("")
                    setStateSearch("")
                    setCitySearch("")
                    setShowCountryPopup(false)
                  }}
                  className="w-full text-left p-3 hover:bg-[#3a3a4a] rounded-lg text-white transition-colors"
                >
                  {country.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showStatePopup && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2b2b2b] rounded-xl w-full max-w-md h-[50vh] flex flex-col">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Select State</h3>
                <button
                  onClick={() => setShowStatePopup(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <Input
                placeholder="Search states..."
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="bg-[#1a1a1a] border-gray-600 text-white"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredStates.map((state) => (
                <button
                  type="button"
                  key={state.id}
                  onClick={() => {
                    const selectedState = states.find(s => s.name === state.name)
                    if (selectedState) {
                      setSelectedStateId(selectedState.id)
                    }
                    setFormData((prev) => ({
                      ...prev,
                      state: state.name,
                      location: ""
                    }))
                    setCities([])
                    setStateSearch("")
                    setCitySearch("")
                    setShowStatePopup(false)
                  }}
                  className="w-full text-left p-3 hover:bg-[#3a3a4a] rounded-lg text-white transition-colors"
                >
                  {state.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCityPopup && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2b2b2b] rounded-xl w-full max-w-md h-[50vh] flex flex-col">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Select City</h3>
                <button
                  onClick={() => setShowCityPopup(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <Input
                placeholder="Search cities..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="bg-[#1a1a1a] border-gray-600 text-white"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {/* Show current location first if it exists and doesn't match any city in the list */}
              {formData.location && !filteredCities.some(city => city.name === formData.location) && (
                <button
                  type="button"
                  onClick={() => {
                    setCitySearch("")
                    setShowCityPopup(false)
                  }}
                  className="w-full text-left p-3 hover:bg-[#3a3a4a] rounded-lg text-white transition-colors"
                >
                  {formData.location}
                </button>
              )}
              {filteredCities.map((city) => (
                <button
                  type="button"
                  key={city.id}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, location: city.name }))
                    setCitySearch("")
                    setShowCityPopup(false)
                  }}
                  className="w-full text-left p-3 hover:bg-[#3a3a4a] rounded-lg text-white transition-colors"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}