"use client"

import { useState } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LanguagePage() {
  const router = useRouter()
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English (US)"])

  const suggestedLanguages = ["English (US)"]

  const otherLanguages = [
    "Mandarin",
    "Hindi",
    "Spanish",
    "French",
    "Arabic",
    "Bengali",
    "Russian",
    "Indonesian",
    "Portugal",
    "Urdu",
  ]

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language]
    )
  }

  const renderLanguageOption = (language: string) => {
    const isSelected = selectedLanguages.includes(language)
    return (
      <div key={language} className="flex items-center justify-between">
        <span>{language}</span>
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

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-3  p-4">
        <button
          className="mr-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium">Language</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Suggested Languages */}
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-gray-400">Suggested</h2>
          <div className="space-y-3">
            {suggestedLanguages.map(renderLanguageOption)}
          </div>
        </div>

        {/* Other Languages */}
        <div>
          <h2 className="mb-2 text-sm font-medium text-gray-400">Language</h2>
          <div className="space-y-3">
            {otherLanguages.map(renderLanguageOption)}
          </div>
        </div>
      </div>
      {/* Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-between p-4">
        <Link href="/home">
          <Button
            variant="outline"
            className="w-full"
          >
            SKIP</Button>
        </Link>
        <Link href="/home">
          <Button
            variant="default"
            className="w-full"
          >
            CONTINUE
          </Button>
        </Link>
      </div>
    </div>
  )
}
