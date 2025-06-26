"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ChevronDown, Mars, Venus } from "lucide-react"
import Cookies from "js-cookie"
import Image from "next/image"
import CakeImage from "@/assets/cake.png"
import { useUser } from "@/contexts/UserContext"
import toast from "react-hot-toast"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type LocationItem = { id: string; name: string }

export default function CompleteAccount() {
  const router = useRouter()
  const [profilePic, setProfilePic] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"profile" | "gender" | "dob">("profile")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const { user, setUser } = useUser()

  const [countries, setCountries] = useState<LocationItem[]>([])
  const [states, setStates] = useState<LocationItem[]>([])
  const [cities, setCities] = useState<LocationItem[]>([])
  const [source, setSource] = useState("Friend Referral")
  const [referredBy, setReferredBy] = useState("")

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
    country: "",
    state: "",
    source: "Friend Referral",
    referred_by: "",
  })

  useEffect(() => {
    fetch("https://techades.com/App/api.php?gofor=countrieslist")
      .then(res => res.json())
      .then(setCountries)
      .catch(() => toast.error("Failed to load countries"))
  }, [])

  // Fetch states when country changes
  useEffect(() => {
    if (!selectedCountryId) return
    fetch(`https://techades.com/App/api.php?gofor=stateslist&country_id=${selectedCountryId}`)
      .then(res => res.json())
      .then(setStates)
      .catch(() => toast.error("Failed to load states"))
  }, [selectedCountryId])

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedStateId) return
    fetch(`https://techades.com/App/api.php?gofor=citieslist&state_id=${selectedStateId}`)
      .then(res => res.json())
      .then(setCities)
      .catch(() => toast.error("Failed to load cities"))
  }, [selectedStateId])

  const [gender, setGender] = useState("")
  const [dob, setDob] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"))
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString())

  const userId = Cookies.get("userID")

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
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeInMB = 2;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
      toast.error("Image size exceeds 2MB limit");

      // Revoke previous preview if any
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      // Clear states and reset file input
      setPreviewUrl("");
      setUploadedImageUrl("");
      setProfilePic(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Revoke old preview if any
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setProfilePic(file);
    setIsUploading(true);
    await uploadImage(file);
  };


  const uploadImage = async (file: File) => {
    const maxSizeInMB = 2;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    // Reject and reset immediately if file too large
    if (file.size > maxSizeInBytes) {
      toast.error("File size exceeds 2MB limit");
      setPreviewUrl("");
      setUploadedImageUrl("");
      if (inputRef.current) {
        inputRef.current.value = ""; // Clear the file input
      }
      return; // Do not proceed
    }

    // Only start loading and reading if file is valid
    setIsUploading(true);

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        const result = reader.result?.toString();
        const base64String = result?.split(",")[1];

        if (!base64String) {
          toast.error("Image could not be read");
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
          const data = JSON.parse(text);

          if (data.success && data.url) {
            setUploadedImageUrl(data.url);
            setPreviewUrl(result);
          } else {
            console.error("Server error:", data);
            toast.error("Failed to get image URL from server");
          }
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("Upload failed: " + (err instanceof Error ? err.message : String(err)));
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        console.error("File read error:", reader.error);
        toast.error("Error reading file");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      setIsUploading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      toast.error("User ID not found. Please log in again.")
      return
    }

    if (!uploadedImageUrl) {
      toast.error("Please upload a profile picture")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gofor: "usersedit",
          user_id: userId,
          name: formData.name,
          email: formData.email,
          location: formData.location,
          country: formData.country,
          state: formData.state,
          imgname: uploadedImageUrl,
          source: source,
          referred_by: referredBy || "",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()

      if (data.register_level_status === 2 || data.success === true) {
        setCurrentStep("gender")
      } else {
        toast.error(data.message || "Failed to update profile")
      }
    } catch (err) {
      toast.error(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(stateSearch.toLowerCase())
  )

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(citySearch.toLowerCase())
  )

  const handleGenderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      toast.error("User ID not found. Please log in again.")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gofor: "usersedit",
          user_id: userId,
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
      } else {
        toast.error(data.message || "Failed to update gender")
      }
    } catch (err) {
      toast.error(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleBack = () => {
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
            className="w-10 h-10 rounded-full bg-[#2b2b2b] flex items-center justify-center"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

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
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-colors ${gender === "Male" ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]" : " bg-[#2b2b2b]"
                  }`}
              >
                <Mars className=" w-10 h-10 " />
                <span className=" font-semibold text-2xl mt-6">Male</span>
              </button>

              {/* Female Option */}
              <button
                type="button"
                onClick={() => setGender("Female")}
                className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-colors ${gender === "Female" ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]" : " bg-[#2b2b2b]"
                  }`}
              >
                <Venus className=" w-10 h-10" />
                <span className=" font-semibold text-2xl mt-6">Female</span>
              </button>
            </div>

            <div className="fixed px-2 bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-20 flex items-center justify-center">
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
        toast.error("Please select your complete date of birth")
        return
      }

      const monthIndex = months.indexOf(selectedMonth) + 1
      const formattedDob = `${selectedYear}-${monthIndex.toString().padStart(2, "0")}-${selectedDay}`
      setDob(formattedDob)

      if (!userId) {
        toast.error("User ID not found. Please log in again.")
        return
      }

      try {
        setIsSubmitting(true)

        const response = await fetch("https://suggesto.xyz/App/api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gofor: "usersedit",
            user_id: userId,
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
          toast.error(data.message || "Failed to complete profile")
        }
      } catch (err) {
        toast.error(`Submit error: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <div className="fixed inset-0 flex flex-col min-h-screen px-6 py-8  text-white">
        <div className="flex items-center mb-6 space-x-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-[#2b2b2b] flex items-center justify-center"
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>


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
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedMonth === month ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white" : "text-gray-400 hover:text-white"
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
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedDay === day ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white" : "text-gray-400 hover:text-white"
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
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedYear === year ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white" : "text-gray-400 hover:text-white"
                          }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="fixed px-2 bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-20 flex items-center justify-center">
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

  const CountryPopup = () => (
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
            className="bg-[#2b2b2b] border-gray-600 text-white"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCountries.map((country) => (
            <button
              key={country.id}
              onClick={() => {
                setSelectedCountryId(country.id)
                setFormData((prev) => ({ ...prev, country: country.name }))
                setStates([])
                setCities([])
                setFormData((prev) => ({ ...prev, state: "", location: "" }))
                setSelectedStateId("")
                setCountrySearch("")
                setShowCountryPopup(false)
              }}
              className="w-full text-left p-3 hover:bg-[#2b2b2b] rounded-lg text-white transition-colors"
            >
              {country.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // State Selection Popup
  const StatePopup = () => (
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
            className="bg-[#2b2b2b] border-gray-600 text-white"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredStates.map((state) => (
            <button
              key={state.id}
              onClick={() => {
                setSelectedStateId(state.id)
                setFormData((prev) => ({ ...prev, state: state.name }))
                setCities([])
                setFormData((prev) => ({ ...prev, location: "" }))
                setStateSearch("")
                setShowStatePopup(false)
              }}
              className="w-full text-left p-3 hover:bg-[#2b2b2b] rounded-lg text-white transition-colors"
            >
              {state.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // City Selection Popup
  const CityPopup = () => (
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
            className="bg-[#2b2b2b] border-gray-600 text-white"
            autoFocus
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredCities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                setFormData((prev) => ({ ...prev, location: city.name }))
                setCitySearch("")
                setShowCityPopup(false)
              }}
              className="w-full text-left p-3 hover:bg-[#2b2b2b] rounded-lg text-white transition-colors"
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )


  // Step 1: Profile Creation (Default)
  return (
    <div className="flex flex-col min-h-screen px-6 py-8  text-white">
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-[#2b2b2b] flex items-center justify-center"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-white pl-4">Complete Account</h2>
      </div>

      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center mb-6">
        {isUploading ? (
          <div className="w-24 h-24 rounded-full bg-[#2b2b2b] flex flex-col items-center justify-center text-white mb-2 animate-pulse border-2 border-gray-600">
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
            className="w-24 h-24 rounded-full bg-[#2b2b2b] flex items-center justify-center text-gray-400 mb-2 cursor-pointer hover:bg-[#3a3a4a] transition-colors border-2 border-dashed border-gray-600"
          >
            <span className="text-xs">Upload</span>
          </div>
        )}
        <p className="text-sm text-gray-400 mb-2">
          {isUploading ? "Processing image..." : "Upload Image (max 2MB)"}
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
            className="bg-[#2b2b2b] border-none h-12 rounded-xl"
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
            className="w-full bg-[#2b2b2b] text-left px-4 py-3 h-12 rounded-xl text-white flex items-center justify-between hover:bg-[#3a3a4a] transition-colors"
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
            onClick={() => selectedCountryId && setShowStatePopup(true)}
            disabled={!selectedCountryId}
            className={`w-full bg-[#2b2b2b] text-left px-4 py-3 h-12 rounded-xl flex items-center justify-between transition-colors ${!selectedCountryId
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#3a3a4a] cursor-pointer"
              }`}
          >
            <span className={formData.state ? "text-white" : "text-gray-400"}>
              {formData.state || "Select your state"}
            </span>
            <span className="text-gray-400"><ChevronDown className="w-4 h-4 " /></span>
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-gray-400 text-sm">City</label>
          <button
            type="button"
            onClick={() => selectedStateId && setShowCityPopup(true)}
            disabled={!selectedStateId}
            className={`w-full bg-[#2b2b2b] text-left px-4 py-3 h-12 rounded-xl flex items-center justify-between transition-colors ${!selectedStateId
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#3a3a4a] cursor-pointer"
              }`}
          >
            <span className={formData.location ? "text-white" : "text-gray-400"}>
              {formData.location || "Select your city"}
            </span>
            <span className="text-gray-400"><ChevronDown className="w-4 h-4 " /></span>
          </button>
        </div>

        {showCountryPopup && <CountryPopup />}
        {showStatePopup && <StatePopup />}
        {showCityPopup && <CityPopup />}


        {/* How do you know Suggesto field */}
        <div className="space-y-3 mb-6">
          <label className="text-gray-400 text-sm">
            How do you know Suggesto?
          </label>
          <Select
            defaultValue="Friend Referral"
            onValueChange={(value) => {
              setSource(value)
              setFormData((prev) => ({ ...prev, source: value }))
              // Reset referredBy when source changes
              if (value !== "Friend Referral") {
                setReferredBy("")
                setFormData((prev) => ({ ...prev, referredBy: "" }))
              }
            }}
          >
            <SelectTrigger className="w-full bg-[#2b2b2b] border-none py-6 rounded-xl">
              <SelectValue placeholder="Select how you found us" />
            </SelectTrigger>
            <SelectContent className="bg-[#2b2b2b] text-white rounded-xl">
              <SelectItem value="Friend Referral">Friend Referral</SelectItem>
              <SelectItem value="Social Media">Social Media</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Play/App Store">Play/App Store</SelectItem>
              <SelectItem value="Influencer Referral">Influencer Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conditionally show Referred By field */}
        {source === "Friend Referral" && (
          <div className="space-y-3 mb-6">
            <label htmlFor="referredBy" className="text-gray-400 text-sm">
              Referred By
            </label>
            <Input
              id="referredBy"
              name="referredBy"
              placeholder="Enter referral code"
              className="bg-[#2b2b2b] border-none h-12 rounded-xl"
              value={referredBy}
              onChange={(e) => {
                setReferredBy(e.target.value)
                setFormData((prev) => ({ ...prev, referred_by: e.target.value }))
              }}
              required
            />
          </div>
        )}
        <div className="fixed px-2 bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-20 flex items-center justify-center">

          <Button type="submit" variant="default" className="w-full  mt-6" disabled={isSubmitting || !uploadedImageUrl}>
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  )
}