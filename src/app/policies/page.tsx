"use client"

import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function PoliciesPage() {
  const router = useRouter()
  const [activePolicy, setActivePolicy] = useState("privacy")
  const [policyData, setPolicyData] = useState({
    privacy: "",
    terms: "",
    returnpolicy: ""
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true)
      setError("")

      try {
        const [privacyResponse, termsResponse, returnResponse] = await Promise.all([
          fetch("https://suggesto.xyz/App/api.php?gofor=privacypolicy"),
          fetch("https://suggesto.xyz/App/api.php?gofor=termsandconditions"),
          fetch("https://suggesto.xyz/App/api.php?gofor=returnpolicy")
        ])

        // Check if responses are ok
        if (!privacyResponse.ok || !termsResponse.ok || !returnResponse.ok) {
          throw new Error("Failed to fetch policy data")
        }

        // Parse JSON responses
        const [privacyData, termsData, returnData] = await Promise.all([
          privacyResponse.text(),
          termsResponse.text(),
          returnResponse.text()
        ])

        // Update state with fetched data
        setPolicyData({
          privacy: privacyData || "Privacy policy content not available",
          terms: termsData || "Terms of service content not available",
          returnpolicy: returnData || "Return policy content not available"
        })
      } catch (err) {
        console.error("Error fetching policy data:", err)
        setError("Failed to load policy data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPolicies()
  }, [])

  const renderPolicyContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary rounded hover:bg-opacity-80 transition-colors"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )
    }

    switch (activePolicy) {
      case "privacy":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Privacy Policy</h2>
            <p className="text-sm text-gray-300">Last updated: May 14, 2025</p>
            <div
              className="policy-content text-gray-300 space-y-4"
              dangerouslySetInnerHTML={{ __html: policyData.privacy }}
            />
          </div>
        )
      case "terms":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Terms of Service</h2>
            <p className="text-sm text-gray-300">Last updated: May 14, 2025</p>
            <div
              className="policy-content text-gray-300 space-y-4"
              dangerouslySetInnerHTML={{ __html: policyData.terms }}
            />
          </div>
        )
      case "returnpolicy":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Return Policy</h2>
            <p className="text-sm text-gray-300">Last updated: May 14, 2025</p>
            <div
              className="policy-content text-gray-300 space-y-4"
              dangerouslySetInnerHTML={{ __html: policyData.returnpolicy }}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    
      // <PageTransitionWrapper>
        <div className="flex flex-col h-screen text-white ">
          {/* Fixed Header */}
          <header className="flex items-center justify-between p-4 ">
            <div className="flex items-center gap-2">
              <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold text-white">Policies</h1>
            </div>
          </header>

          {/* Fixed Tab Navigation */}
          <div className="flex ">
            <button
              className={`flex-1 py-3 text-center ${activePolicy === "privacy" ? "border-b-2 border-primary text-primary font-medium" : "text-gray-400"}`}
              onClick={() => setActivePolicy("privacy")}
            >
              Privacy Policy
            </button>
            <button
              className={`flex-1 py-3 text-center ${activePolicy === "terms" ? "border-b-2 border-primary text-primary font-medium" : "text-gray-400"}`}
              onClick={() => setActivePolicy("terms")}
            >
              Terms of Service
            </button>
            <button
              className={`flex-1 py-3 text-center ${activePolicy === "returnpolicy" ? "border-b-2 border-primary text-primary font-medium" : "text-gray-400"}`}
              onClick={() => setActivePolicy("returnpolicy")}
            >
              Return Policy
            </button>
          </div>

          {/* Scrollable Main Content */}
          <main className="flex-1 px-6 py-4 overflow-y-auto">
            {renderPolicyContent()}
          </main>
        </div>
      // </PageTransitionWrapper>
    
  )
}