"use client"


import { ArrowLeft, MoreVertical, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Pricing() {
    const router = useRouter()
  return (
    <div className="min-h-screen text-white flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between p-4 w-full max-w-4xl">
        <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">Select Your Plan</h1>
        <div className="p-2">
          <MoreVertical size={20} />
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mb-6">Switch plan or cancel any time</p>

      {/* Standard Plan */}
      <div className="mx-4 mb-8 bg-[#292938] rounded-xl overflow-hidden w-full max-w-[350px] space-y-8 py-8">
        <div className="relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-[#2e2e2e] text-sm px-4 py-1 rounded-full">Most Popular</div>
          </div>

          <div className="pt-8 px-4 text-center">
            <h2 className="text-lg font-semibold">Suggesto - Standard</h2>
            <p className="text-sm text-gray-400 mt-1">Get 1 month free, then</p>
            <p className="text-2xl font-bold mt-2">
              $8.99<span className="text-sm font-normal text-gray-400">/monthly</span>
            </p>

            <Button className="w-full text-white bg-[#6c5ce7] hover:bg-[#6c5ce7] mt-4 mb-6">Select Plan</Button>

            <div className="grid grid-cols-2 gap-4 pb-6">
              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Streaming in high quality</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Ad-free viewing experience</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Download to watch later</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Text of different languages</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Stream on multiple devices</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">With the best audio quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Plan */}
      <div className="mx-4 mb-8 bg-[#292938] rounded-xl overflow-hidden w-full max-w-[350px] space-y-8 py-8">
        <div className="relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="bg-[#2e2e2e] text-sm px-4 py-1 rounded-full">Premium</div>
          </div>

          <div className="pt-8 px-4 text-center">
            <h2 className="text-lg font-semibold">Suggesto - Premium</h2>
            <p className="text-sm text-gray-400 mt-1">Get 1 month free, then</p>
            <p className="text-2xl font-bold mt-2">
              $14.99<span className="text-sm font-normal text-gray-400">/monthly</span>
            </p>

            <Button className="w-full text-white bg-[#6c5ce7] hover:bg-[#6c5ce7] mt-4 mb-6">Select Plan</Button>

            <div className="grid grid-cols-2 gap-4 pb-6">
              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Streaming in ultra high quality</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Ad-free viewing experience</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Download to watch later</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Text of different languages</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">Stream on multiple devices</p>
              </div>

              <div className="flex items-start space-x-2 justify-center">
                <div className="bg-[#6c5ce7] p-1 rounded mt-0.5">
                  <Check size={14} />
                </div>
                <p className="text-xs">With the best audio quality</p>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
