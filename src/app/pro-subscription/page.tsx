"use client"

import { useState } from "react"
import Image from "next/image"
import crownIcon from "@/assets/pro-crown.png"
import { Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import pro1 from "@/assets/pro-1.jpeg"
import pro2 from "@/assets/pro-2.jpeg"
import pro3 from "@/assets/pro-3.jpeg"
import pro4 from "@/assets/pro-4.jpeg"
import pro5 from "@/assets/pro-5.jpeg"
import { useRouter } from "next/navigation"

export default function SubscriptionPage() {
    const router = useRouter()
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState("starter")

    const handleContinue = () => {
        setShowSuccessModal(true)
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#181826] text-white">
            {/* Background Images */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/50 to-[#0a0e17] z-10"></div>
                <div className="flex h-full">
                    {[pro1, pro2, pro3, pro4, pro5].map((img, i) => (
                        <div key={i} className="flex-1 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#0a0e17]/40"></div>
                            <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" priority />
                        </div>
                    ))}
                </div>
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col flex-1">
                {/* Header */}
                <header className="p-4">
                    <button className="mr-4 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                </header>

                {/* Main Section */}
                <main className="flex-1 flex flex-col p-6">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-30 h-30 bg-[#0a0e17] rounded-full flex items-center justify-center mb-4">
                            <Image src={crownIcon} alt="Crown Icon" width={56} height={56} className="h-full w-full p-2 object-cover" />
                        </div>

                        <h1 className="text-2xl font-semibold text-primary mb-6">Subscribe to Premium</h1>

                        <div className="w-full space-y-3 mb-8">
                            <div className="flex items-center">
                                <Check size={20} className="text-primary mr-3" />
                                <span>Watch in 4K on All Devices</span>
                            </div>
                            <div className="flex items-center">
                                <Check size={20} className="text-primary mr-3" />
                                <span>Ad-free, No Ads</span>
                            </div>
                            <div className="flex items-center">
                                <Check size={20} className="text-primary mr-3" />
                                <span>High-quality Movies</span>
                            </div>
                        </div>
                    </div>

                    {/* Plan Selection */}
                    <div className="space-y-4 mb-8">
                        {[
                            { id: "starter", name: "Starter", trial: "7-Days Free Trial", price: "$29/Month" },
                            { id: "professional", name: "Professional", trial: "14-Days Free Trial", price: "$45/Month" }
                        ].map(plan => (
                            <button
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border ${selectedPlan === plan.id ? "border-primary bg-[#0f1824]" : "border-gray-700 bg-[#0f1824]/50"
                                    }`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${selectedPlan === plan.id ? "border-primary" : "border-gray-600"}`}>
                                        {selectedPlan === plan.id && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                                    </div>
                                    <div>
                                        <div className="font-medium">{plan.name}</div>
                                        <div className="text-sm text-gray-400">{plan.trial}</div>
                                    </div>
                                </div>
                                <div className="font-semibold">{plan.price}</div>
                            </button>
                        ))}
                    </div>

                    <button onClick={handleContinue} className="w-full py-4 bg-primary rounded-xl font-medium mb-4">
                        Continue For Payment
                    </button>

                    <div className="text-center text-xs text-gray-400">
                        <span>Terms of use</span> | <span>Privacy Policy</span> | <span>Restore</span>
                    </div>
                </main>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-[#292938] rounded-2xl max-w-xs w-full overflow-hidden">
                        <div className="p-6 flex flex-col items-center">
                            <div className="relative w-26 h-26 rounded-full flex items-center justify-center mb-4">
                                <Image src={crownIcon} alt="Crown Icon" width={56} height={56} className="h-full w-full object-cover" />
                            </div>
                            <h2 className="text-primary text-xl font-semibold mb-2">Congratulations!</h2>
                            <p className="text-center text-gray-300 mb-6">
                                You have successfully subscribed to 1 month of premium. Enjoy the benefits!
                            </p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-3 bg-primary text-white rounded-xl font-medium"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
