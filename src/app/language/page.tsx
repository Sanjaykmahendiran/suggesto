"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    // Get user ID from cookies
    const cookieUserId = Cookies.get('userID') || ''
    setUserId(cookieUserId)

    const fetchLanguages = async () => {
      try {
        setIsLoading(true)

        // Fetch all available languages
        const allLanguagesResponse = await fetch('https://suggesto.xyz/App/api.php?gofor=languageslist')
        if (!allLanguagesResponse.ok) {
          throw new Error('Failed to fetch languages')
        }
        const allLanguagesData = await allLanguagesResponse.json() as Language[]

        // Filter active languages
        const activeLanguages = allLanguagesData.filter(lang => lang.status === 1)
        setLanguages(activeLanguages)

        // Check if user has existing language preferences
        if (cookieUserId) {
          const userLanguagesResponse = await fetch(`https://suggesto.xyz/App/api.php?gofor=userlanlist&user_id=${cookieUserId}`)
          if (!userLanguagesResponse.ok) {
            throw new Error('Failed to fetch user languages')
          }

          const userLanguagesData = await userLanguagesResponse.json()

          // If user has existing language preferences, set to edit mode
          if (Array.isArray(userLanguagesData) && userLanguagesData.length > 0) {
            setIsEditMode(true)
            
            // Find full language objects from the active languages list
            const userSelectedLanguages = userLanguagesData.map(userLang => {
              return activeLanguages.find(lang => lang.language_id === parseInt(userLang.language_id))
            }).filter(Boolean) as Language[]

            setSelectedLanguages(userSelectedLanguages)
          } else {
            // No existing preferences, use default (English)
            setIsEditMode(false)
            const englishLang = activeLanguages.find(lang => lang.code === "en")
            if (englishLang) {
              setSelectedLanguages([englishLang])
            }
          }
        } else {
          // No user ID, use default (English)
          setIsEditMode(false)
          const englishLang = activeLanguages.find(lang => lang.code === "en")
          if (englishLang) {
            setSelectedLanguages([englishLang])
          }
        }

        // Process suggested languages
        const englishLang = activeLanguages.find(lang => lang.code === "en")
        const suggested = englishLang
          ? [englishLang]
          : activeLanguages.length > 0 ? [activeLanguages[0]] : []

        // Set other languages
        const others = activeLanguages.filter(lang =>
          !suggested.some(sugLang => sugLang.language_id === lang.language_id)
        )

        setSuggestedLanguages(suggested)
        setOtherLanguages(others)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  const toggleLanguage = (language: Language) => {
    setSelectedLanguages((prev) =>
      prev.some(lang => lang.language_id === language.language_id)
        ? prev.filter(lang => lang.language_id !== language.language_id)
        : [...prev, language]
    )
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Don't continue if no languages selected
      if (selectedLanguages.length === 0) return

      // Get selected language IDs
      const languageIds = selectedLanguages.map(lang => lang.language_id)

      const apiEndpoint = isEditMode ? "edituserlan" : "adduserlan"
      const redirectPath = isEditMode ? "/profile" : "/home"

      const response = await fetch('https://suggesto.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gofor: apiEndpoint,
          user_id: userId,
          language_id: languageIds
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'save'} language preferences`)
      }

      router.push(redirectPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    router.push("/home")
  }

  const handleBack = () => {
    if (isEditMode) {
      router.push("/profile")
    } else {
      router.back()
    }
  }

  const renderLanguageOption = (language: Language) => {
    const isSelected = selectedLanguages.some(lang => lang.language_id === language.language_id)

    return (
      <div key={language.language_id} className="flex items-center justify-between py-2">
        <span>{language.name}</span>
        <div
          className={`h-5 w-5 flex items-center justify-center rounded-full border cursor-pointer ${isSelected ? "border-primary bg-primary text-white" : "border-gray-600"
            }`}
          onClick={() => toggleLanguage(language)}
        >
          {isSelected && <Check size={14} />}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <button
          className="mr-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium">
          {isEditMode ? "Edit your language" : "Language"}
        </h1>
      </div>

      {/* Description - Added this section */}
      <div className="px-4 pb-6">
        <p className="text-gray-400">
          {isEditMode
            ? "Update your language preferences to personalize your experience."
            : "Choose your preferred languages. Don't worry, you can always change it later."
          }
        </p>
      </div>

      {/* Content */}
      <div className="p-4 pb-32">
        {/* Suggested Languages */}
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-gray-400">Suggested</h2>
          <div className="space-y-1">
            {isLoading
              ? Array(1).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full rounded bg-[#292938]" />
              ))
              : suggestedLanguages.map(renderLanguageOption)}
          </div>
        </div>

        {/* Other Languages */}
        <div>
          <h2 className="mb-2 text-sm font-medium text-gray-400">Language</h2>
          <div className="space-y-4">
            {isLoading
              ? Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full rounded bg-[#292938]" />
              ))
              : otherLanguages.map(renderLanguageOption)}
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-[-8] left-0 right-0 flex p-4 bg-[#181826]">
        {!isEditMode && (
          <div className="w-1/2 pr-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              SKIP
            </Button>
          </div>
        )}
        <div className={isEditMode ? "w-full" : "w-1/2"}>
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
    </div>
  )
}