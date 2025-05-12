"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HelpCenterPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("FAQ")
    const [expandedQuestion, setExpandedQuestion] = useState("How to create an account?")
    const [activeCategory, setActiveCategory] = useState("General")

    const categories = ["General", "Account", "Payment", "Other"]

    const faqs = [
        {
            question: "How to create an account?",
            answer: "Open the app, tap on Sign Up, and follow the prompts to create and maintain your account.",
        },
        {
            question: "How to add a payment method to this app?",
            answer: "Go to Settings > Payment Methods > Add New Payment Method and follow the instructions.",
        },
        {
            question: "What Time Does The Stock Market Open?",
            answer:
                "The stock market typically opens at 9:30 AM Eastern Time and closes at 4:00 PM Eastern Time on weekdays.",
        },
        {
            question: "Is The Stock Market Open On Weekends?",
            answer: "No, the stock market is closed on weekends. It operates Monday through Friday, excluding holidays.",
        },
    ]

    const toggleQuestion = (question: string) => {
        if (expandedQuestion === question) {
            setExpandedQuestion("")
        } else {
            setExpandedQuestion(question)
        }
    }

    return (
        <div className="min-h-screen text-white">
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
                <button
                    className="mr-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    onClick={() => router.back()}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-medium">Help Center</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                <button
                    className={`flex-1 py-3 text-center font-medium ${activeTab === "FAQ" ? "border-b-2 border-primary text-primary" : ""
                        }`}
                    onClick={() => setActiveTab("FAQ")}
                >
                    FAQ
                </button>
                <button
                    className={`flex-1 py-3 text-center font-medium ${activeTab === "Contact Us" ? "border-b-2 border-primary text-primary" : ""
                        }`}
                    onClick={() => setActiveTab("Contact Us")}
                >
                    Contact Us
                </button>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto p-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${activeCategory === category ? "bg-primary text-white" : "bg-gray-800 text-white"
                            }`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mx-4 mb-4 flex items-center rounded-md bg-gray-800 px-3 py-2">
                <Search className="mr-2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-transparent text-white outline-none placeholder:text-gray-400"
                />
            </div>

            {/* FAQs */}
            <div className="space-y-4 px-4">
                {faqs.map((faq) => (
                    <div key={faq.question} className="rounded-lg bg-gray-800 p-4">
                        <div
                            className="flex cursor-pointer items-center justify-between"
                            onClick={() => toggleQuestion(faq.question)}
                        >
                            <h3 className="font-medium">{faq.question}</h3>
                            {expandedQuestion === faq.question ? (
                                <ChevronUp className="h-5 w-5 text-primary" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-primary" />
                            )}
                        </div>

                        {expandedQuestion === faq.question && <p className="mt-2 text-sm text-gray-400">{faq.answer}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}
