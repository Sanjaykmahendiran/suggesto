"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Smartphone, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import mobileNumber from "@/assets/mobile-number-2.png"
import OTP from "@/assets/OTP-ICON.png"
import Image from "next/image"
import { useUser } from "@/contexts/UserContext"

export default function Login() {
  const router = useRouter()
  const [step, setStep] = useState("mobile")
  const [mockOTP, setMockOTP] = useState("")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const { user, setUser } = useUser()

  const mobileInputRef = useRef<HTMLInputElement>(null)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  const [activeInput, setActiveInput] = useState(0)

  useEffect(() => {
    // Focus the appropriate input on mount or step change
    if (step === "mobile") {
      setTimeout(() => mobileInputRef.current?.focus(), 100)
    } else if (step === "otp") {
      setTimeout(() => inputRefs[0].current?.focus(), 100)
    }
  }, [step])

  // Countdown timer for resend code
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      setResendDisabled(false)
      setCountdown(30)
    }

    return () => clearInterval(timer)
  }, [resendDisabled, countdown])

  // Auto-fill OTP when mockOTP is set
  useEffect(() => {
    if (mockOTP && step === "otp") {
      const otpArray = mockOTP.split("")
      setOtp([otpArray[0] || "", otpArray[1] || "", otpArray[2] || "", otpArray[3] || ""])
    }
  }, [mockOTP, step])

  const handleMobileSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid mobile number")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Call the API to register the user
      const apiUrl = `https://suggesto.xyz/App/api.php?gofor=usersadd&mobilenumber=${mobile}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      // Check if user_id exists in the response
      if (data.user_id) {
        // Store user_id in localStorage for later use
        localStorage.setItem("user_id", data.user_id)
        setMockOTP(data.otp)
        // Move to OTP verification step
        setStep("otp")
        setResendDisabled(true)
      } else {
        // Handle error when user_id is not present
        setError(data.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error("API error:", err)
    } finally {
      setLoading(false)
    }
  }



  const handleInputChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
      setActiveInput(index - 1)
    }
  }

  const handleVerifyOTP = async () => {
    // Clear previous messages
    setError("");
    setSuccessMessage("");

    if (!otp.every(digit => digit)) {
      setError("Please enter the complete OTP");
      return;
    }

    setLoading(true);
    const otpValue = otp.join("");

    try {
      const apiUrl = `https://suggesto.xyz/App/api.php?gofor=verify_otp&mobilenumber=${mobile}&otp=${otpValue}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.user_id && data.message === "OTP is success") {
        setSuccessMessage("OTP verified successfully!");

        // Set user_id cookie (expires in 7 days)
        Cookies.set("userID", data.user_id, { expires: 7 });
        setUser(data);


        // Redirect based on register_level_status
        setTimeout(() => {
          if (data.register_level_status === 2) {
            router.push("/home");
          } else {
            router.push("/auth/complete-account");
          }
        }, 1500);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled) return

    setLoading(true)
    setError("")

    try {
      // Call the API to resend OTP
      const apiUrl = `https://suggesto.xyz/App/api.php?gofor=resend_otp&mobilenumber=${mobile}`
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.user_id && data.otp) {
        setSuccessMessage("OTP Resent successfully!")

        // Reset OTP fields
        setOtp(["", "", "", ""])
        setActiveInput(0)
        inputRefs[0].current?.focus()

        setResendDisabled(true)
      } else {
        setError(data.message || "Failed to resend code. Please try again.")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      console.error("API error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col bg-[#181826] min-h-screen fixed inset-0 ">
      {step === "mobile" ? (
        <div className="flex flex-col min-h-screen px-6 ">
          {/* Back button and title */}
          <div className="flex items-center pt-12 pb-4 ">
            <button
              onClick={() => router.push("/")}
              className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center mr-4"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex-1 text-center">
            </div>
          </div>

          {/* Icon */}
          <div className="w-full flex justify-center">
            <Image
              src={mobileNumber}
              alt="Mobile Number"
              width={192}
              height={192}
              className="w-40 h-40 text-primary"
            />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Create Account </h2>
            <p className="text-gray-400 text-sm">Enter your number to Continue </p>
          </div>

          {/* Input */}
          <div className="w-full max-w-md mx-auto mb-8">
            <Input
              ref={mobileInputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter your mobile number"
              className="bg-[#292938] border-gray-700 border h-12 rounded-xl w-full px-4 text-white placeholder-gray-400"
              value={mobile}
              onChange={(e) => {
                const input = e.target.value.replace(/\D/g, '');
                if (input.length <= 10) {
                  setMobile(input);
                }
              }}
              onKeyDown={(e) => {
                const isDigit = /^[0-9]$/.test(e.key);
                const isControlKey = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(e.key);
                if (mobile.length >= 10 && isDigit && !isControlKey) {
                  e.preventDefault(); // Block further digits
                }
                if (e.key === 'Enter') {
                  handleMobileSubmit(e);
                }
              }}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Button */}
          <Button
            variant="default"
            className="w-full"
            onClick={handleMobileSubmit}
            disabled={loading}
          >
            {loading ? "Please wait..." : "Send OTP"}
          </Button>
          <p className="text-gray-400 text-center text-sm mt-4">
            We will send OTP to your mobile number

          </p>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen px-6 ">
          {/* Back button and title */}
          <div className="flex items-center pt-12 pb-4 mb-6">
            <button
              onClick={() => setStep("mobile")}
              className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center mr-4"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex-1 text-center">
            </div>
          </div>

          {/* Icon */}
          <div className="w-full flex justify-center mb-8 w-30 h-30">
            {/* Icon */}
            <div className="flex items-center justify-center">
              <Image
                src={OTP}
                alt="Mobile Number"
                width={192}
                height={192}
                className="w-40 h-40 ml-4 text-primary"
              />

            </div>
          </div>

          {/* Enter OTP */}
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-white">Enter OTP</h2>
          </div>

          {/* We have sent OTP message */}
          <div className="text-center mb-8">
            <p className="text-gray-400 text-sm">
              We have sent OTP on your {(mobile)}
            </p>
          </div>

          {/* 4 Circles */}
          <div className="flex justify-center space-x-4 mb-8">
            {otp.map((digit, index) => (
              <div key={index}>
                <input
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  pattern="\\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setActiveInput(index)}
                  className={`w-16 h-16 bg-[#292938] text-center border-2 rounded-full focus:outline-none text-2xl text-white ${activeInput === index ? 'border-[#6c5ce7]' : 'border-gray-700'
                    }`}
                />
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm text-center mb-4">{successMessage}</p>}

          {/* Verify OTP */}
          <Button
            onClick={handleVerifyOTP}
            className="w-full"
            disabled={!otp.every((digit) => digit) || loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          {/* Didn't receive Code? Resend Code */}
          <p className="text-gray-400 text-center text-sm mt-4">
            Didn't receive Code?{" "}
            <button
              onClick={handleResendCode}
              className={`${resendDisabled ? "text-gray-500" : "text-[#6c5ce7]"}`}
              disabled={resendDisabled}
            >
              {resendDisabled ? `Resend Code (${countdown}s)` : "Resend Code"}
            </button>
          </p>
        </div>
      )}
    </div>
  )
}