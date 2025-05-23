"use client"

import { useState } from "react"
import Image from "next/image"
import crownIcon from "@/assets/pro-crown.png"
import { Check, ArrowLeft } from "lucide-react"
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
    <div className="flex flex-col min-h-screen bg-[#181826] text-white font-sans">
      {/* Background Images with Overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/70 to-[#0a0e17] z-10"></div>
        <div className="flex h-full">
          {[pro1, pro2, pro3, pro4, pro5].map((img, i) => (
            <div key={i} className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#0a0e17]/60"></div>
              <Image
                src={img}
                alt={`Background ${i + 1}`}
                fill
                className="object-cover"
                priority
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <header className="p-4">
          <button
            className="p-2 rounded-full bg-[#292938]/80 hover:bg-[#292938]"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-6 py-4 max-w-md mx-auto w-full">
          {/* Crown Icon */}
          <div className="w-20 h-20 bg-gradient-to-b from-[#0f1824] to-[#0a0e17] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <Image
              src={crownIcon}
              alt="Premium"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-primary mb-8 text-center">Subscribe to Premium</h1>

          {/* Features */}
          <div className="w-full space-y-4 mb-10">
            {["Watch in 4K on All Devices", "Ad-free, No Ads", "High-quality Movies"].map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <Check size={16} className="text-primary" />
                </div>
                <span className="text-white text-base font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Plan Selection */}
          <div className="w-full space-y-3 mb-8">
            {[
              { id: "starter", name: "Starter", trial: "7-Days Free Trial", price: "$29/Month" },
              { id: "professional", name: "Professional", trial: "14-Days Free Trial", price: "$45/Month" },
            ].map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  selectedPlan === plan.id
                    ? "border-primary bg-[#0f1824]/80"
                    : "border-gray-700/50 bg-[#0f1824]/30"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      selectedPlan === plan.id ? "bg-primary" : "border-2 border-gray-500"
                    }`}
                  >
                    {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{plan.name}</div>
                    <div className="text-sm text-gray-200">{plan.trial}</div>
                  </div>
                </div>
                <div className="font-semibold text-white">{plan.price}</div>
              </button>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-primary rounded-xl font-semibold text-white mb-6 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            Continue For Payment
          </button>

          {/* Footer */}
          <div className="text-center text-sm text-gray-300 space-x-2">
            <button className="hover:text-white">Terms of use</button>
            <span>|</span>
            <button className="hover:text-white">Privacy Policy</button>
            <span>|</span>
            <button className="hover:text-white">Restore</button>
          </div>
        </main>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f1824] border border-gray-700/50 rounded-2xl max-w-xs w-full overflow-hidden shadow-xl animate-fade-in">
            <div className="p-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-b from-[#0f1824] to-[#0a0e17] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <Image
                  src={crownIcon}
                  alt="Premium"
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </div>
              <h2 className="text-primary text-xl font-semibold mb-2">Congratulations!</h2>
              <p className="text-center text-gray-200 mb-6">
                You have successfully subscribed to 1 month of premium. Enjoy the benefits!
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
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
