"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Copy, DollarSign, Download, Share2, Star, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Invite from "@/assets/Invite-share.png"
import ensure from "@/assets/Ensure.png"
import yourRewards from "@/assets/your-reward.png"
import reward from "@/assets/Get-rewards.png"
import Image from "next/image"
import Cookies from 'js-cookie'
import { useRouter } from "next/navigation"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import toast from "react-hot-toast"

// Skeleton Loading Component
const FriendSkeleton = () => (
  <div className="bg-[#2b2b2b] rounded-lg p-4 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-600 rounded w-24"></div>
        <div className="h-3 bg-gray-600 rounded w-20"></div>
        <div className="h-3 bg-gray-600 rounded w-16"></div>
      </div>
    </div>
    <div className="text-right space-y-2">
      <div className="h-4 bg-gray-600 rounded w-16"></div>
      <div className="h-3 bg-gray-600 rounded w-12"></div>
    </div>
  </div>
)

export default function InviteFriends() {
  const [activeTab, setActiveTab] = useState("referrals")
  const [copied, setCopied] = useState(false)
  type InvitedFriend = {
    id: string
    name: string
    avatar: string
    joinDate: string
    points: string
    mobilenumber?: string
    referralCode?: string
  }
  const [invitedFriends, setInvitedFriends] = useState<InvitedFriend[]>([])
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [invitedFriendsLoading, setInvitedFriendsLoading] = useState(false)
  const router = useRouter()

  const userId = Cookies.get('userID')

  useEffect(() => {
    if (userId) {
      fetch(`https://suggesto.xyz/App/api.php?gofor=userget&user_id=${userId}`)
        .then((res) => res.json())
        .then((userData) => {
          setUserData(userData)
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  // Fetch invited friends data from API
  const fetchInvitedFriends = async () => {
    if (!userId) {
      toast.error("User ID not found")
      return
    }

    setInvitedFriendsLoading(true)

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=referredlist&user_id=${userId}`)
      const result = await response.json()

      if (result.status === "success" && result.data) {
        // Transform API data to match component structure
        const transformedData = result.data.map((item: { referral_id: any; referred_user_profile: { name: any; mobilenumber: any; imgname: any; referral_code: any }; referred_on: any; reward_given: any }) => ({
          id: item.referral_id,
          name: item.referred_user_profile.name || `User ${item.referred_user_profile.mobilenumber}`,
          avatar: item.referred_user_profile.imgname ? item.referred_user_profile.imgname : "/placeholder.svg?height=40&width=40",
          joinDate: formatJoinDate(item.referred_on),
          points: `${item.reward_given} pts`,
          mobilenumber: item.referred_user_profile.mobilenumber,
          referralCode: item.referred_user_profile.referral_code
        }))

        setInvitedFriends(transformedData)
      } else {
        toast.error("Failed to fetch invited friends")
      }
    } catch (err) {
      console.error("Error fetching invited friends:", err)
      toast.error("Network error occurred")
    } finally {
      setInvitedFriendsLoading(false)
    }
  }

  // Format join date to readable format
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Reset time to compare only dates
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "Joined Today"
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return "Joined Yesterday"
    } else {
      return `Joined ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`
    }
  }

  // Fetch invited friends data on component mount to show count immediately
  useEffect(() => {
    if (userId) {
      fetchInvitedFriends()
    }
  }, [userId])

  // Handle copy referral code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userData?.referral_code || "")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = userData?.referral_code || ""
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  // Handle native Android sharing
  const handleShare = async () => {
    const shareText = `Join me on Suggesto app! Use my referral code: ${userData?.referral_code || ""} to get started. Download now!`

    // Check if native sharing is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Suggesto App',
          text: shareText,
          url: 'https://play.google.com/store/apps/details?id=your.app.id'
        })
      } catch (err) {
        console.error("Error sharing:", err)
        // Fallback to clipboard if sharing is canceled or fails
        handleCopyCode()
      }
    } else {
      // Fallback for browsers that don't support native sharing
      // Try to open WhatsApp with the message
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (

    // <PageTransitionWrapper>
    <div className="max-w-sm mx-auto min-h-screen">
      {/* Header */}
      <div className=" px-4 pb-3 pt-8 flex items-center justify-between ">
        <div className="flex items-center gap-3">
          <button
            className="p-2.5 rounded-full bg-[#2b2b2b] backdrop-blur-sm  transition-all duration-300"
            onClick={handleBack}
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Invite Friends</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className=" px-4 py-2 items-center justify-center flex gap-2">
        <button
          onClick={() => setActiveTab("referrals")}
          className={`px-4 py-2 w-full rounded-full text-sm font-medium transition-colors ${activeTab === "referrals" ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white" : " text-white"
            }`}
        >
          Your Referrals
        </button>
        <button
          onClick={() => setActiveTab("invited")}
          className={`px-4 py-2 w-full rounded-full text-sm font-medium transition-colors ${activeTab === "invited" ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white" : " text-white"
            }`}
        >
          Invited Friends ({invitedFriends.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-2">
        {activeTab === "referrals" ? (
          <div className="w-full max-w-sm mx-auto relative ">

            {/* Decorative elements */}
            <div className="relative px-6">
              <style jsx>{`
                @keyframes bounceSlow {
                  0%, 100% {
                    transform: translateY(0);
                  }
                  50% {
                    transform: translateY(-20px);
                  }
                }

                .bounce-slow {
                  animation: bounceSlow 2s infinite;
                }
              `}</style>

              <div className="w-40 h-40 max-w-xs mx-auto aspect-[4/3] relative bounce-slow">
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
            <div className=" space-y-6 mb-8">
              {/* Step 1 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12  rounded-full flex items-center justify-center">
                  <Image
                    src={Invite}
                    alt="Share"
                    width={24}
                    height={24}
                    className="w-12 h-12 object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">Invite</h3>
                  <p className="text-sm text-gray-300">Share Suggesto app & invite your friends</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12  rounded-full flex items-center justify-center">
                  <Image
                    src={ensure}
                    alt="ensure"
                    width={24}
                    height={24}
                    className="w-12 h-12 object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">Ensure</h3>
                  <p className="text-sm text-gray-300">Make sure that 5 friends installed Suggesto</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <Image
                    src={yourRewards}
                    alt="your rewards"
                    width={24}
                    height={24}
                    className="w-12 h-12 object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">Your Reward</h3>
                  <p className="text-sm text-gray-300">Get free 1 month Suggesto subscription</p>
                </div>
              </div>
            </div>

            {/* Referral Code */}
            <div className="px-6 mb-6">
              <div className="relative flex items-center border rounded-lg bg-white px-4 py-2 shadow-sm">
                <span className="text-sm text-gray-500">Your referral code</span>
                <span className="ml-4 font-bold text-primary tracking-wider">{userData?.referral_code || "WGR47L"}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto p-0"
                  onClick={handleCopyCode}
                >
                  <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : 'text-gray-500'}`} />
                </Button>
              </div>
              {copied && (
                <p className="text-green-500 text-sm text-center mt-2">Copied to clipboard!</p>
              )}
            </div>


            {/* Refer Now Button */}
            <div className="px-6 mb-6">
              <Button
                variant="default"
                className="w-full text-lg font semibold"
                onClick={handleShare}
              >
                REFER NOW
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Skeleton Loading State */}
            {invitedFriendsLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <FriendSkeleton key={index} />
                ))}
              </div>
            )}


            {/* Empty State */}
            {!invitedFriendsLoading && invitedFriends.length === 0 && (
              <div className="text-center py-8 flex flex-col items-center justify-center min-h-[400px]">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-300">No invited friends yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">Start inviting friends to earn points!</p>
                <Button
                  variant="default"
                  className="w-full max-w-xs"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share my Referral Code
                </Button>
              </div>
            )}

            {/* Friends List */}
            {!invitedFriendsLoading && invitedFriends.map((friend) => (
              <div key={friend.id} className="bg-[#2b2b2b] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={friend.avatar} alt={friend.name}
                      className="object-cover" />
                    <AvatarFallback>
                      {friend.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{friend.name}</p>
                    <p className="text-sm text-gray-300">{friend.joinDate}</p>
                    {friend.mobilenumber && (
                      <p className="text-xs text-gray-400">{friend.mobilenumber}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{friend.points}</p>
                  {friend.referralCode && (
                    <p className="text-xs text-gray-400">{friend.referralCode}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Button - Only show for invited friends tab when there are friends */}
      {activeTab === "invited" && invitedFriends.length > 0 && (
        <div className="p-4">
          <Button
            variant="default"
            className="w-full"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share my Referral Code
          </Button>
        </div>
      )}
    </div>
    // </PageTransitionWrapper>

  )
}