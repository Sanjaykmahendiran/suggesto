"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import mobileNumber from "@/assets/mobile-number-2.png"
import OTP from "@/assets/OTP-ICON.png"
import Image from "next/image"
import { useUser } from "@/contexts/UserContext"
import toast from "react-hot-toast"
import ContactsPermission from "../_components/ContactsPermission"

// Capacitor imports for mobile functionality
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
  }
}

interface GeolocationData {
  country: string;
  countryCode: string;
}

export default function Login() {
  const router = useRouter()
  const [step, setStep] = useState("input") // "input" or "otp"
  const [loginType, setLoginType] = useState<'mobile' | 'email'>('mobile') // Default to mobile
  const [showLoginTypeSelector, setShowLoginTypeSelector] = useState(false)
  const [mockOTP, setMockOTP] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(true)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [showContactsPermission, setShowContactsPermission] = useState(false);
  const [contactsUploaded, setContactsUploaded] = useState(false);
  const { user, setUser } = useUser()

  const inputRef = useRef<HTMLInputElement>(null)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  const [activeInput, setActiveInput] = useState(0)

  // Enhanced location detection for mobile apps
  useEffect(() => {
    const detectLocationAndSetup = async () => {
      try {
        let detectedCountryCode = 'IN'; // Default to India

        // Check if running on native mobile platform
        const isNative = window.Capacitor?.isNativePlatform?.() || false;

        if (isNative) {
          // For native mobile apps, try multiple approaches
          try {
            // Method 1: Try device locale/timezone
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timeZone === 'Asia/Kolkata' || timeZone === 'Asia/Calcutta') {
              detectedCountryCode = 'IN';
            } else if (timeZone.startsWith('Asia/')) {
              // Other Asian countries might prefer email
              detectedCountryCode = 'OTHER';
            }

            // Method 2: Check device language
            const language = navigator.language || 'en-US';
            if (language.includes('IN') || language.startsWith('hi') || language.startsWith('ta') || language.startsWith('te')) {
              detectedCountryCode = 'IN';
            }

            // Method 3: Fallback to IP geolocation with shorter timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

            const response = await fetch('https://ipapi.co/json/', {
              signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              const data: GeolocationData = await response.json();
              detectedCountryCode = data.countryCode || 'IN';
            }
          } catch (error) {
            console.log('Native location detection failed, using defaults:', error);
            // Keep default as 'IN'
          }
        } else {
          // For web/PWA, use IP geolocation
          try {
            const response = await fetch('https://ipapi.co/json/', {
              headers: {
                'Accept': 'application/json',
              }
            });
            const data: GeolocationData = await response.json();
            detectedCountryCode = data.countryCode || 'IN';
          } catch (error) {
            console.log('Web location detection failed, using defaults:', error);
            // Keep default as 'IN'
          }
        }

        // Set login type based on detected country
        if (detectedCountryCode === 'IN') {
          setLoginType('mobile');
          setShowLoginTypeSelector(true); // Allow users to switch if needed
        } else {
          setLoginType('email');
          setShowLoginTypeSelector(true); // Allow users to switch if needed
        }

      } catch (error) {
        console.error('Location detection error:', error);
        // Default to mobile with option to switch
        setLoginType('mobile');
        setShowLoginTypeSelector(true);
      } finally {
        setLocationLoading(false);
      }
    };

    detectLocationAndSetup();
  }, []);

  useEffect(() => {
    // Focus the appropriate input on mount or step change
    if (step === "input" && !locationLoading) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else if (step === "otp") {
      setTimeout(() => inputRefs[0].current?.focus(), 100)
    }
  }, [step, loginType, locationLoading])

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

  const validateInput = () => {
    if (loginType === 'mobile') {
      const isValidMobile = /^[6-9]\d{9}$/.test(mobile);
      if (!isValidMobile) {
        toast.error("Please enter a valid 10-digit mobile number");
        return false;
      }

      const blockedNumbers = ['1234567890', '0000000000', '9999999999', '8888888888', '7777777777', '6666666666'];
      if (blockedNumbers.includes(mobile)) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return false;
      }
    } else {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }
    return true;
  }

  const handleInputSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!validateInput()) return;

    setLoading(true)
    try {
      // Construct API URL based on login type
      let apiUrl = '';
      if (loginType === 'mobile') {
        apiUrl = `https://suggesto.xyz/App/api.php?gofor=usersadd&mobilenumber=${mobile}`
      } else {
        apiUrl = `https://suggesto.xyz/App/api.php?gofor=usersadd&email=${email}`
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      const data = await response.json()

      // Check if user_id exists in the response 
      if (data.user_id) {
        setMockOTP(data.otp)
        // Move to OTP verification step
        setStep("otp")
        setResendDisabled(true)
        // toast.success("OTP sent successfully!")
      } else {
        // Handle error when user_id is not present
        toast.error(data.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      toast.error("Network error. Please check your connection and try again.")
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
    if (!otp.every(digit => digit)) {
      toast.error("Please enter the complete OTP");
      return;
    }

    setLoading(true);
    const otpValue = otp.join("");

    try {
      // Construct verification URL based on login type
      let apiUrl = '';
      if (loginType === 'mobile') {
        apiUrl = `https://suggesto.xyz/App/api.php?gofor=verify_otp&mobilenumber=${mobile}&otp=${otpValue}`;
      } else {
        apiUrl = `https://suggesto.xyz/App/api.php?gofor=verify_otp&email=${email}&otp=${otpValue}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();

      if (data.user_id && data.message === "OTP is success") {
        toast.success("OTP verified successfully!");

        // Set user_id cookie (expires in 7 days)
        Cookies.set("userID", data.user_id, { expires: 7 });
        setUser(data);

        // Debug logging
        console.log("User register_level_status:", data.register_level_status);

        // Only show contacts permission if register_level_status is 1
        if (data.register_level_status === 1) {
          console.log("Showing contacts permission for register_level_status 1");
          setTimeout(() => {
            setShowContactsPermission(true);
          }, 500);
        } else {
          console.log("Skipping contacts permission, navigating directly");
          // Navigate directly for other register levels
          setTimeout(() => {
            if (data.register_level_status === 2) {
              router.push("/home");
            } else {
              router.push("/auth/complete-account");
            }
          }, 1000);
        }

      } else {
        toast.error(data.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Please check your connection and try again.");
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleContactsPermissionGranted = async (uploadResult?: any) => {
    console.log("Contacts permission granted callback", uploadResult);

    // Show appropriate toast based on upload result
    if (uploadResult && uploadResult.success) {
      toast.success(`Successfully uploaded ${uploadResult.uploadedCount} contacts!`);
      setContactsUploaded(true);

      setTimeout(() => {
        setShowContactsPermission(false);
        setTimeout(() => {
          if (user?.register_level_status === 2) {
            router.push("/home");
          } else {
            router.push("/auth/complete-account");
          }
        }, 500);
      }, 4000);
    } else {
      toast.success('Contacts permission granted!');
      setTimeout(() => {
        setShowContactsPermission(false);
        setTimeout(() => {
          if (user?.register_level_status === 2) {
            router.push("/home");
          } else {
            router.push("/auth/complete-account");
          }
        }, 500);
      }, 4000);
    }
  };

  const handleSkipContacts = () => {
    console.log("Skipping contacts permission");
    setShowContactsPermission(false);
    setTimeout(() => {
      if (user?.register_level_status === 2) {
        router.push("/home");
      } else {
        router.push("/auth/complete-account");
      }
    }, 500);
  };

  const handleResendCode = async () => {
    if (resendDisabled) return

    setLoading(true)

    try {
      // Construct resend URL based on login type
      let apiUrl = '';
      if (loginType === 'mobile') {
        apiUrl = `https://suggesto.xyz/App/api.php?gofor=resend_otp&mobilenumber=${mobile}`
      } else {
        apiUrl = `https://suggesto.xyz/App/api.php?gofor=resend_otp&email=${email}`
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      const data = await response.json()

      if (data.user_id && data.otp) {
        toast.success("OTP Resent successfully!")

        // Set the new OTP for auto-fill
        setMockOTP(data.otp)

        // Reset OTP fields
        setOtp(["", "", "", ""])
        setActiveInput(0)
        inputRefs[0].current?.focus()

        setResendDisabled(true)
      } else {
        toast.error(data.message || "Failed to resend code. Please try again.")
      }
    } catch (err) {
      toast.error("Network error. Please check your connection and try again.")
      console.error("API error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col bg-[#121214] min-h-screen fixed inset-0 ">
      {step === "input" ? (
        <div className="flex flex-col min-h-screen px-6 ">
          {/* Back button and title */}
          <div className="flex items-center pt-12 pb-4 ">
            <button
              onClick={() => router.push("/")}
              className="w-10 h-10 rounded-full bg-[#2b2b2b] flex items-center justify-center mr-4"
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
              alt="Authentication"
              width={192}
              height={192}
              className="w-40 h-40 text-primary"
            />
          </div>

          {/* Title and Subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Create Account</h2>
            <p className="text-gray-400 text-sm">
              {loginType === 'mobile'
                ? 'Enter your mobile number to Continue'
                : 'Enter your email address to Continue'
              }
            </p>
          </div>

          {/* Input */}
          <div className="w-full max-w-md mx-auto mb-8">
            {loginType === 'mobile' ? (
              <Input
                ref={inputRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter your mobile number"
                className="bg-[#2b2b2b] border-gray-700 border h-12 rounded-xl w-full px-4 text-white placeholder-gray-400"
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
                    e.preventDefault();
                  }
                  if (e.key === 'Enter') {
                    handleInputSubmit(e);
                  }
                }}
              />
            ) : (
              <Input
                ref={inputRef}
                type="email"
                inputMode="email"
                placeholder="Enter your email address"
                className="bg-[#2b2b2b] border-gray-700 border h-12 rounded-xl w-full px-4 text-white placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputSubmit(e);
                  }
                }}
              />
            )}
          </div>

          {/* Button */}
          <Button
            variant="default"
            className="w-full"
            onClick={handleInputSubmit}
            disabled={loading || (loginType === 'mobile' ? !mobile : !email)}
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>
          <p className="text-gray-400 text-center text-sm mt-4">
            {loginType === 'mobile'
              ? 'We will send OTP to your mobile number'
              : 'We will send OTP to your email address'
            }
          </p>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen px-6 ">
          {/* Back button and title */}
          <div className="flex items-center pt-12 pb-4 mb-6">
            <button
              onClick={() => setStep("input")}
              className="w-10 h-10 rounded-full bg-[#2b2b2b] flex items-center justify-center mr-4"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex-1 text-center">
            </div>
          </div>

          {/* Icon */}
          <div className="w-full flex justify-center mb-8 w-30 h-30">
            <div className="flex items-center justify-center">
              <Image
                src={OTP}
                alt="OTP"
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
              {loginType === 'mobile'
                ? `We have sent OTP to ${mobile}`
                : `We have sent OTP to ${email}`
              }
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
                  className={`w-16 h-16 bg-[#2b2b2b] text-center border-2 rounded-full focus:outline-none text-2xl text-white ${activeInput === index ? 'border-[#b56bbc]' : 'border-gray-700'
                    }`}
                />
              </div>
            ))}
          </div>

          {/* Verify OTP */}
          <Button
            variant="default"
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
              className={`${resendDisabled ? "text-gray-500" : "text-[#b56bbc]"}`}
              disabled={resendDisabled || loading}
            >
              {resendDisabled ? `Resend Code (${countdown}s)` : "Resend Code"}
            </button>
          </p>
        </div>
      )}

      {showContactsPermission && (
        <ContactsPermission
          onPermissionGranted={handleContactsPermissionGranted}
          onSkip={handleSkipContacts}
          userRegisterLevel={user?.register_level_status}
        />
      )}
    </div>
  )
}