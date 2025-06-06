"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

export default function AboutPage() {
  const router = useRouter()
  const [aboutData, setAboutData] = useState<string | null>(null)

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch("https://suggesto.xyz/App/api.php?gofor=about")
        const data = await res.text()
        setAboutData(data)
      } catch (error) {
        console.error("Failed to fetch About content:", error)
      }
    }

    fetchAboutData()
  }, [])

  if (!aboutData) {
    return <div className="text-white p-6">Loading...</div>
  }

  return (

    // <PageTransitionWrapper>
    <div className="flex flex-col min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center p-4">
        <button
          className="mr-4 p-2 rounded-full bg-[#292938]"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">About Us</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-4 overflow-y-auto">
        <section className="space-y-6">
          <div
            className="policy-content text-gray-300 space-y-4"
            dangerouslySetInnerHTML={{ __html: aboutData }}
          />
        </section>
      </main>
    </div>
    // </PageTransitionWrapper>

  )
}
