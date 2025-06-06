"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Cookies from "js-cookie"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

export default function ContactPage() {
  const router = useRouter()

  const [formState, setFormState] = useState({
    category: "",
    query: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "">("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const userId = Cookies.get("userID")

    if (!userId) {
      setStatusType("error")
      setStatusMessage("User not logged in. Please log in and try again.")
      setIsSubmitting(false)
      return
    }

    const payload = {
      gofor: "addhelp",
      user_id: userId,
      category: formState.category,
      query: formState.query,
    }

    try {
      const res = await fetch("https://suggesto.xyz/App/api.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data?.response) {
        setSubmitted(true)
        setFormState({ category: "", query: "" })
        setStatusType("success")
        setStatusMessage(data.response || "Message sent successfully.")
      } else {
        setStatusType("error")
        setStatusMessage("Failed to send message. Please try again.")
      }
    } catch (error) {
      console.error("API error:", error)
      setStatusType("error")
      setStatusMessage("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    
    // <PageTransitionWrapper>
    <div className="flex flex-col min-h-screen text-white mb-8">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white">Contact Us</h1>
        </div>
      </header>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-3 m-3 rounded-md text-sm mb-4 ${statusType === "success" ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
            }`}
        >
          {statusMessage}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-6 py-4">
        {submitted ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-primary/20 p-4 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-6">Your message has been sent successfully. We'll get back to you soon.</p>
            <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
          </div>
        ) : (
          <>
            <p className="text-gray-400 mb-6">
              Have an issue or feedback? Fill out the form below and we'll take care of it.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Input
                  id="category"
                  name="category"
                  value={formState.category}
                  onChange={handleChange}
                  placeholder="App Issue, Feedback, etc."
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label htmlFor="query" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Textarea
                  id="query"
                  name="query"
                  value={formState.query}
                  onChange={handleChange}
                  placeholder="Describe your issue or feedback..."
                  rows={5}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button type="submit" className="w-full py-6 text-white font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </>
        )}
      </main>
    </div>
    // </PageTransitionWrapper>
    
  )
}
