"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/contexts/UserContext"
import toast from "react-hot-toast"

// Define language type
interface Language {
  language_id: number;
  code: string;
  name: string;
  status: number;
}

export default function LanguagePage() {
  const router = useRouter()

  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [suggestedLanguages, setSuggestedLanguages] = useState<Language[]>([])
  const [otherLanguages, setOtherLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectionError, setSelectionError] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState(false)
  const { user, setUser } = useUser()

  useEffect(() => {
    // Get user ID from cookies
    const cookieUserId = Cookies.get("userID") || ""
    setUserId(cookieUserId)

    const fetchLanguages = async () => {
      try {
        setIsLoading(true)

        const allLanguagesResponse = await fetch("https://suggesto.xyz/App/api.php?gofor=languageslist")
        if (!allLanguagesResponse.ok) throw new Error("Failed to fetch languages")

        const allLanguagesData = await allLanguagesResponse.json() as Language[]
        const activeLanguages = allLanguagesData.filter(lang => lang.status === 1)
        setLanguages(activeLanguages)

        if (cookieUserId) {
          const userLanguagesResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=userlanlist&user_id=${cookieUserId}`)
          if (!userLanguagesResponse.ok) throw new Error("Failed to fetch user languages")

          const userLanguagesData = await userLanguagesResponse.json()

          if (Array.isArray(userLanguagesData) && userLanguagesData.length > 0) {
            setIsEditMode(true)

            const userSelectedLanguages = userLanguagesData
              .map(userLang => activeLanguages.find(lang => lang.language_id === parseInt(userLang.language_id)))
              .filter(Boolean) as Language[]

            setSelectedLanguages(userSelectedLanguages)
          } else {
            setIsEditMode(false)
            const englishLang = activeLanguages.find(lang => lang.code === "en")
            if (englishLang) setSelectedLanguages([englishLang])
          }
        } else {
          setIsEditMode(false)
          const englishLang = activeLanguages.find(lang => lang.code === "en")
          if (englishLang) setSelectedLanguages([englishLang])
        }

        const englishLang = activeLanguages.find(lang => lang.code === "en")
        const suggested = englishLang ? [englishLang] : activeLanguages.slice(0, 1)
        const others = activeLanguages.filter(lang => !suggested.some(sug => sug.language_id === lang.language_id))

        setSuggestedLanguages(suggested)
        setOtherLanguages(others)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  useEffect(() => {
    if (selectionError) {
      const timer = setTimeout(() => setSelectionError(""), 2000)
      return () => clearTimeout(timer)
    }
  }, [selectionError])

  const toggleLanguage = (language: Language) => {
    setSelectedLanguages(prev => {
      const alreadySelected = prev.some(lang => lang.language_id === language.language_id)
      if (alreadySelected) {
        return prev.filter(lang => lang.language_id !== language.language_id)
      } else {
        if (prev.length >= 5) {
          setSelectionError("Select up to 5 languages.")
          return prev
        }
        return [...prev, language]
      }
    })
  }

  const handleSubmit = async () => {
    if (selectedLanguages.length === 0) return

    try {
      setIsSubmitting(true)

      const languageIds = selectedLanguages.map(lang => lang.language_id)
      const apiEndpoint = isEditMode ? "edituserlan" : "adduserlan"
      const redirectPath = isEditMode ? "/profile" : "/home"

      const response = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          gofor: apiEndpoint,
          user_id: userId,
          language_id: languageIds
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? "update" : "save"} language preferences`)
      }

      const data = await response.json()

      if (data) {
        setUser(data)
        router.push(redirectPath)
      } else {
        throw new Error(data?.message || "Unexpected response from server")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleBack = () => isEditMode ? router.push("/profile") : router.back()

  const renderLanguageOption = (language: Language) => {
    const isSelected = selectedLanguages.some(lang => lang.language_id === language.language_id)

    return (
      <div key={language.language_id} className="flex items-center justify-between py-2">
        <span>{language.name}</span>
        <div
          className={`h-5 w-5 flex items-center justify-center rounded-full border cursor-pointer ${isSelected ? "border-primary bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white" : "border-gray-600"
            }`}
          onClick={() => toggleLanguage(language)}
        >
          {isSelected && <Check size={14} />}
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-8">
        <button
          className="mr-2 p-2 rounded-full bg-[#2b2b2b] transition-colors"
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium">
          {isEditMode ? "Edit your language" : "Language"}
        </h1>
      </div>

      {/* Description */}
      <div className="px-4 pb-2">
        <p className="text-gray-400">
          {isEditMode ? "Update your language preferences to personalize your experience." :
            "Choose your preferred languages. Don't worry, you can always change it later."}
        </p>
        <div className="flex justify-between items-center mt-2">
          {selectionError ? (
            <p className="text-red-500 text-sm">{selectionError}</p>
          ) : (
            <span />
          )}
          <p className="text-gray-400 text-sm">
            Selected{" "}
            <span className="px-4 py-1 rounded-3xl border-0 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white">
              {selectedLanguages.length}/5
            </span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-36">
        {/* Suggested */}
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-gray-400">Suggested</h2>
          <div className="space-y-1">
            {isLoading
              ? Array(1).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full rounded bg-[#2b2b2b]" />
              ))
              : suggestedLanguages.map(renderLanguageOption)}
          </div>
        </div>

        {/* Others */}
        <div>
          <h2 className="mb-2 text-sm font-medium text-gray-400">Language</h2>
          <div className="space-y-4">
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full rounded bg-[#2b2b2b]" />
              ))
              : otherLanguages.map(renderLanguageOption)}
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed px-2 bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-20 flex items-center justify-center">
        <Button
          variant="default"
          className="w-full"
          onClick={handleSubmit}
          disabled={selectedLanguages.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {isEditMode ? "UPDATING..." : "SAVING..."}
            </span>
          ) : (
            isEditMode ? "UPDATE" : "CONTINUE"
          )}
        </Button>

      </div>

    </div>
  )
}
