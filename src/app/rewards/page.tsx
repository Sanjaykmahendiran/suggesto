"use client"

import { ArrowLeft, Share2, Download, DollarSign, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import reward from "@/assets/Get-rewards.png"

export default function Rewards() {
    return (
        <div className="w-full max-w-sm mx-auto  min-h-screen relative ">
            {/* Header */}
            <div className="flex items-center px-4">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
            </div>

            {/* Decorative elements */}
            <div className="relative px-6 ">
                <div className="w-full max-w-xs mx-auto aspect-[4/3] relative">
                    <Image
                        src={reward}
                        alt="rewards"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>


            {/* Title */}
            <div className="text-center px-6 mb-8">
                <h1 className="text-2xl font-bold text-primary mb-2">Get Rewards</h1>
                <p className="text-gray-300 text-sm">Invite friends; Have fun; Get rewarded!</p>
            </div>

            {/* Steps */}
            <div className="px-6 space-y-6 mb-8">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Share2 className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">Invite</h3>
                        <p className="text-sm text-gray-300">Share iky app & invite your friends</p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Download className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">Ensure</h3>
                        <p className="text-sm text-gray-300">Make sure that 5 friends installed iky</p>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <h3 className="font-medium text-white">Your Reward</h3>
                        <p className="text-sm text-gray-300">Get free 1 month ikyNXT subscription</p>
                    </div>
                </div>
            </div>

            {/* Refer Now Button */}
            <div className="px-6 mb-6">
                <Button className="w-full bg-primary text-white rounded-full py-3 text-lg font-medium">
                    REFER NOW
                </Button>
            </div>

            {/* Referral Code */}
            <div className="px-6 mb-6">
                <div className="relative">
                    <Input
                        value="WGR67L"
                        readOnly
                        className="text-center text-lg font-medium bg-gray-40 border-gray-200"
                        placeholder="Your referral code"
                    />
                    <Button size="sm" variant="ghost" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Copy className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
