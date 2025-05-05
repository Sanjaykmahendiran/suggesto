"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function VerifyOTP() {
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", ""])
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  const [activeInput, setActiveInput] = useState(0)

  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus()
    }
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Move to next input if current input is filled
      if (value && index < 3) {
        inputRefs[index + 1].current?.focus()
        setActiveInput(index + 1)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
      setActiveInput(index - 1)
    }
  }

  const handleContinue = () => {
    if (otp.every((digit) => digit)) {
      router.push("/auth/complete-account")
    }
  }

  const handleResendCode = () => {
    // Reset OTP fields
    setOtp(["", "", "", ""])
    setActiveInput(0)
    inputRefs[0].current?.focus()
    // Here you would typically call an API to resend the code
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#181826] px-6 py-8">
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <h1 className="text-2xl font-bold text-center mb-2">Enter OTP</h1>
      <p className="text-gray-400 text-center text-sm mb-8">
        We have just sent you 4 digit code via your email example@gmail.com
      </p>

      <div className="flex justify-center space-x-4 mb-8">
        {otp.map((digit, index) => (
          <div key={index} className={`w-18 h-18 ${activeInput === index ? "otp-input-active" : ""}`}>
            <input
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={() => setActiveInput(index)}
              className="w-full h-full bg-[#292938] text-center border-2 rounded-full focus:outline-none focus:border-[#6c5ce7] text-2xl text-white placeholder-gray-500"
            />
          </div>
        ))}
      </div>

      <Button
        onClick={handleContinue}
        className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium mb-6"
        disabled={!otp.every((digit) => digit)}
      >
        Continue
      </Button>

      <p className="text-gray-400 text-center text-sm">
        Didn&apos;t receive code?{" "}
        <button onClick={handleResendCode} className="text-[#6c5ce7]">
          Resend Code
        </button>
      </p>
    </div>
  )
}
