"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import CinemaIcon from "@/assets/cinema-icon.png"
import Cookies from "js-cookie"


export default function login() {
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
      mobileInputRef.current?.focus()
    } else if (step === "otp") {
      inputRefs[0].current?.focus()
    }
  }, [step])

  // Countdown timer for resend code
  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined
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

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
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
    <div className="flex flex-col min-h-screen bg-[#1c1c28]">
      {step === "mobile" ? (
        <div className="flex-1 flex flex-col items-center px-6">
          {/* Logo centered at top with proper spacing */}
          <div className="w-full pt-12 pb-6 flex justify-center">
            <Image
              src={CinemaIcon}
              alt="Logo"
              width={160}
              height={160}
              className="mx-auto"
            />
          </div>

          {/* Form container with proper spacing below the image */}
          <div className="w-full max-w-md rounded-2xl bg-transparent mt-18">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
              <p className="text-white/70 text-sm">Quickly sign up to get started!</p>
            </div>

            <form onSubmit={handleMobileSubmit} className="space-y-6">
              <div>
                <label htmlFor="mobile" className="text-gray-400 text-sm mb-2 block">
                  Mobile Number
                </label>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter your mobile number"
                  className="bg-[#292938] border-gray-700 border h-12 rounded-xl w-full"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  ref={mobileInputRef}
                  required
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <Button
                type="submit"
                className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium"
                disabled={loading}
              >
                {loading ? "Please wait..." : "Continue with Mobile"}
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen px-6 py-8">
          <button
            onClick={() => setStep("mobile")}
            className="w-10 h-10 rounded-full bg-[#292938] flex items-center justify-center mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <h1 className="text-2xl font-bold text-center mb-2">Enter OTP</h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            We have just sent you 4 digit code via your Mobile {mobile}
          </p>

          <div className="flex justify-center space-x-4 mb-8">
            {otp.map((digit, index) => (
              <div key={index} className={`w-16 h-16 ${activeInput === index ? "otp-input-active" : ""}`}>
                <input
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  autoFocus={index === 0}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={() => setActiveInput(index)}
                  className="w-full h-full bg-[#292938] text-center border-2 rounded-full focus:outline-none focus:border-[#6c5ce7] text-2xl text-white placeholder-gray-500"
                />
              </div>
            ))}
          </div>
          <p className="mb-4">OTP: {mockOTP}</p>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm text-center mb-4">{successMessage}</p>}

          <Button
            onClick={handleVerifyOTP}
            className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium mb-6"
            disabled={!otp.every((digit) => digit) || loading}
          >
            {loading ? "Verifying..." : "Continue"}
          </Button>

          <p className="text-gray-400 text-center text-sm">
            Didn&apos;t receive code?{" "}
            <button
              onClick={handleResendCode}
              className={`${resendDisabled ? "text-gray-500" : "text-[#6c5ce7]"}`}
              disabled={resendDisabled}
            >
              {resendDisabled ? `Resend in ${countdown}s` : "Resend Code"}
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
