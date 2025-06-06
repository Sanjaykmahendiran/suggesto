"use client"

import React from 'react';
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react";
import icon1 from "@/assets/pro-icon-1.png"
import icon2 from "@/assets/pro-icon-2.png"
import icon3 from "@/assets/pro-icon-3.png"
import { Button } from '@/components/ui/button';

export default function Component() {
  const router = useRouter()

  return (
    <div className="fixed text-white min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Pro</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-screen text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="max-w-sm w-full flex flex-col items-center space-y-12">

          {/* Header Text */}
          <div className="text-center space-y-1">
            <h1 className="text-4xl font-bold leading-tight">Build Your</h1>
            <h1 className="text-4xl font-bold leading-tight">Future, Build</h1>
            <h1 className="text-4xl font-bold leading-tight">
              Your <span className="bg-purple-600 px-3 py-1 rounded-lg">Dream</span>
            </h1>
          </div>

          {/* Professional Network Visualization */}
          <div className="relative w-80 h-80 flex items-center justify-center">

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <line x1="80" y1="100" x2="160" y2="160" stroke="white" strokeWidth="1" opacity="0.2" />
              <line x1="240" y1="100" x2="160" y2="160" stroke="white" strokeWidth="1" opacity="0.2" />
              <line x1="80" y1="220" x2="160" y2="160" stroke="white" strokeWidth="1" opacity="0.2" />
              <line x1="240" y1="220" x2="160" y2="160" stroke="white" strokeWidth="1" opacity="0.2" />
              <line x1="80" y1="100" x2="240" y2="100" stroke="white" strokeWidth="1" opacity="0.2" />
              <line x1="80" y1="220" x2="240" y2="220" stroke="white" strokeWidth="1" opacity="0.2" />
            </svg>

            {/* Decorative Lines - Top Left */}
            <div className="absolute top-6 left-8">
              <div className="flex space-x-1">
                <div className="w-0.5 h-4 bg-white rotate-12 opacity-60"></div>
                <div className="w-0.5 h-3 bg-white rotate-45 opacity-60"></div>
                <div className="w-0.5 h-2 bg-white -rotate-12 opacity-60"></div>
              </div>
            </div>

            {/* Decorative Arrow - Top Right */}
            <div className="absolute top-8 right-4">
              <svg width="32" height="32" viewBox="0 0 32 32" className="text-white opacity-60">
                <path
                  d="M16 4 L20 12 L28 12 L22 18 L24 26 L16 22 L8 26 L10 18 L4 12 L12 12 Z"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div>

            {/* Center Profile - Main person */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden">
                <Image
                  src={icon1}
                  alt="Main profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Top Left - Product Designer */}
            <div className="absolute top-8 left-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src={icon2}
                    alt="Product Designer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                  Product Designer
                </div>
              </div>
            </div>

            {/* Top Right - UX/UI Designer */}
            <div className="absolute top-8 right-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden">
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <span className="text-black text-[10px] font-bold text-center leading-tight">UX/UI<br />Designer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Left - Flutter Developer */}
            <div className="absolute bottom-8 left-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                  Flutter Developer
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src={icon3}
                    alt="Flutter Developer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Right - Software Engineer */}
            <div className="absolute bottom-8 right-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                  Software Engineer
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden">
                  <Image
                    src={icon1}
                    alt="Software Engineer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button variant="default" className="w-full ">
            <span>Notify Me</span>
            <div className="w-8 h-8  flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}