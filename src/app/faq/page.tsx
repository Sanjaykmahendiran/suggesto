"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition";
import toast from "react-hot-toast";

// Define interfaces for TypeScript
interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export default function HelpCenterPage() {
    const router = useRouter()
    const [expandedQuestion, setExpandedQuestion] = useState<string>("")
    const [activeCategory, setActiveCategory] = useState<string>("All")
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        // Fetch FAQs from API
        const fetchFaqs = async () => {
            try {
                setIsLoading(true)
                const response = await fetch("https://suggesto.xyz/App/api.php?gofor=faq")

                if (!response.ok) {
                    throw new Error("Failed to fetch FAQs")
                }

                const data = await response.json()
                setFaqs(data)

                // Extract unique categories from the FAQ data
                const uniqueCategories = [...new Set(data.map((faq: FAQ) => faq.category))] as string[]
                // Add "All" category at the beginning
                setCategories(["All", ...uniqueCategories])

                setIsLoading(false)
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "An unknown error occurred")
                setIsLoading(false)
            }
        }

        fetchFaqs()
    }, [])

    const toggleQuestion = (question: string) => {
        if (expandedQuestion === question) {
            setExpandedQuestion("")
        } else {
            setExpandedQuestion(question)
        }
    }

    // Filter FAQs based on active category and search query
    const filteredFaqs = faqs.filter(faq =>
        (activeCategory === "All" || faq.category === activeCategory) &&
        (searchQuery === "" ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (

        //   <PageTransitionWrapper>
        <div className="min-h-screen text-white">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-8">
                <button className="mr-4 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-medium">FAQs</h1>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar p-4">
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${activeCategory === category ? "bg-primary text-white" : "bg-[#2b2b2b] text-white"
                            }`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="mx-4 mb-4 mt-4 flex items-center rounded-md bg-[#2b2b2b] px-3 py-2">
                <Search className="mr-2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-transparent text-white outline-none placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading && (
                <div className="space-y-4 px-4 pb-8">
                    {/* Skeleton for category buttons */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        {[1, 2, 3, 4].map((item) => (
                            <Skeleton key={item} className="h-9 w-24 rounded-full bg-[#2b2b2b]" />
                        ))}
                    </div>

                    {/* Skeleton for FAQ items */}
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="rounded-lg  p-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-3/4 rounded-md bg-[#2b2b2b]" />
                                <Skeleton className="h-5 w-5 rounded-md bg-[#2b2b2b]" />
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* FAQs */}
            {!isLoading && (
                <div className="space-y-4 px-4 pb-8">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq) => (
                            <div key={faq.id} className="rounded-lg bg-[#2b2b2b] p-4">
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

                                {expandedQuestion === faq.question && (
                                    <p className="mt-2 text-sm text-gray-300">{faq.answer}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 text-gray-400">
                            {searchQuery ? (
                                <p>No FAQs found matching your search{activeCategory !== "All" ? " in this category" : ""}.</p>
                            ) : (
                                <p>No FAQs available{activeCategory !== "All" ? " in this category" : ""}.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
        // </PageTransitionWrapper>

    )
}