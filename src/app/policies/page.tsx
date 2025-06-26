"use client"

import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

export default function PoliciesPage() {
  const router = useRouter()
  const [activePolicy, setActivePolicy] = useState("privacy")
  const [policyData, setPolicyData] = useState({
    privacy: "",
    terms: "",
    returnpolicy: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true)

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
        toast.error("Failed to load policy data. Please try again later.")
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

    switch (activePolicy) {
      case "privacy":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Privacy Policy</h2>
            <p className="text-sm text-gray-300">Last updated: May 14, 2025</p>
            <div
              className="policy-content font-thin space-y-4"
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
              className="policy-content font-thin space-y-4"
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
              className="policy-content font-thin space-y-4"
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
      <header className="flex items-center justify-between px-4 pb-4 pt-8 ">
        <div className="flex items-center gap-2">
          <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Policies</h1>
        </div>
      </header>

      {/* Fixed Tab Navigation */}
      <div className="flex">
        {["privacy", "terms", "returnpolicy"].map((type) => (
          <button
            key={type}
            className={`relative flex-1 py-3 text-center transition-all duration-200
        ${activePolicy === type
                ? "font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text"
                : "text-gray-400"
              }`}
            onClick={() => setActivePolicy(type)}
          >
            {type === "privacy" && "Privacy Policy"}
            {type === "terms" && "Terms of Service"}
            {type === "returnpolicy" && "Return Policy"}

            {activePolicy === type && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#b56bbc] to-[#7a71c4]" />
            )}
          </button>
        ))}
      </div>


      {/* Scrollable Main Content */}
      <main className="flex-1 px-6 py-4 overflow-y-auto">
        {renderPolicyContent()}
      </main>
    </div>
    // </PageTransitionWrapper>

  )
}