"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { useUser } from "@/contexts/UserContext"
import toast from "react-hot-toast"
import confetti from "canvas-confetti"
import BackgroundImage from "@/assets/spend-coins/spin-wheel-bg.png"
import coin from "@/assets/coins.png"
import { Button } from "@/components/ui/button"
import coins25 from "@/assets/spend-coins/25-coins.png"
import coins100 from "@/assets/spend-coins/100-coins.png"
import Brandkit from "@/assets/spend-coins/brand-kit.png"
import DrawTicket from "@/assets/spend-coins/draw-ticket.png"
import GiftCard from "@/assets/spend-coins/gift-card.png"
import ProAccess from "@/assets/spend-coins/pro-access.png"

interface SpinItem {
  spinitem_id: number
  label: string
  icon: string
  reward_type: string
  reward_value: number
  chance_weight: number
  status: number
  created_date: string
  modified_date: string
}

interface SpinHistory {
  sphis_id: number
  user_id: number
  name: string
  image: string
  badge: string
  item_id: number
  item_name: string
  reward_value: number
  reward_type: string
  spin_date: string
}

interface UserSpinListResponse {
  status: boolean
  data: SpinHistory[]
}

interface Segment {
  spinitem_id: number
  icon: string
  reward: string
  reward_type: string
  reward_value: number
  chance_weight: number
}

interface RecentResult {
  badge: string
  image: string
  user: string
  reward: string
}

interface SpinResult {
  icon: string
  reward: string
  remaining_coins?: number
  spinitem_id: number
}

interface SpinApiResponse {
  status: string
  message: string
  item_id: number
  label: string
  icon: string
  reward_type: string
  reward_value: number
  remaining_coins: number
}

export default function SpinPage() {
  const router = useRouter()
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<SpinResult | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [recentResults, setRecentResults] = useState<RecentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCoins, setCurrentCoins] = useState<number>(0)
  const userId = Cookies.get("userID")
  const { user, setUser } = useUser()

  useEffect(() => {
    if (showResult) {
      // Fire confetti when the result modal is shown
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#b56bbc', '#7a71c4', '#f9c74f', '#90be6d'],
      })
    }
  }, [showResult])

  // Initialize current coins from user context
  useEffect(() => {
    if (user?.coins) {
      setCurrentCoins(Number(user.coins))
    }
  }, [user?.coins])

  // Fetch spin items from API
  useEffect(() => {
    const fetchSpinItems = async () => {
      try {
        const response = await fetch('https://suggesto.xyz/App/api.php?gofor=spinitemslist')
        const data: SpinItem[] = await response.json()

        // Direct mapping without sorting
        const segments: Segment[] = data.map(item => ({
          spinitem_id: item.spinitem_id,
          icon: item.icon,
          reward: item.label,
          reward_type: item.reward_type,
          reward_value: item.reward_value,
          chance_weight: item.chance_weight
        }))

        setSegments(segments)
        console.log('Loaded segments:', segments.map(s => ({ id: s.spinitem_id, reward: s.reward })))
      } catch (error) {
        console.error('Error fetching spin items:', error)
      }
    }

    fetchSpinItems()
  }, [])

  // Fetch recent results from API
  const fetchRecentResults = async () => {
    try {
      const response = await fetch('https://suggesto.xyz/App/api.php?gofor=userspinlist')
      const apiResponse: UserSpinListResponse = await response.json()

      if (apiResponse.status && apiResponse.data) {
        const transformedResults: RecentResult[] = apiResponse.data.map(item => ({
          user: item.name || `User ${item.user_id}`,
          reward: item.item_name,
          badge: item.badge,
          // Use the actual image from API response, fallback to generated avatar if not available
          image: item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || `User ${item.user_id}`)}`
        }))

        setRecentResults(transformedResults)
      }
    } catch (error) {
      console.error('Error fetching recent results:', error)
    } finally {
      setLoading(false)
    }
  }

  // Keep the initial useEffect call:
  useEffect(() => {
    // Only fetch recent results after segments are loaded
    if (segments.length > 0) {
      fetchRecentResults()
    }
  }, [segments])

  const handleSpin = async () => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);

    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=spinwheel&user_id=${userId}`);
      const spinApiResult: SpinApiResponse = await response.json();

      if (spinApiResult.status === "success") {
        // Find index of the winning segment by item_id from response
        const wonSegmentIndex = segments.findIndex(
          (seg) => seg.spinitem_id === spinApiResult.item_id
        );

        console.log('Winning item_id:', spinApiResult.item_id);
        console.log('Won segment index:', wonSegmentIndex);

        if (wonSegmentIndex !== -1) {
          // Calculate the angle for each segment
          const segmentAngle = 360 / segments.length;

          // Calculate the center angle of the winning segment
          // Since segments start from index 0 at the top (12 o'clock position)
          const winningSegmentCenterAngle = wonSegmentIndex * segmentAngle + (segmentAngle / 2);

          // Get current rotation normalized to 0-360 range
          const currentRotationNormalized = rotation % 360;

          // Calculate how much we need to rotate to bring the winning segment to the top
          // We want the center of the winning segment to align with the pointer (at 0 degrees/top)
          let targetRotation = 360 - winningSegmentCenterAngle;

          // Normalize the target rotation to be between 0 and 360
          if (targetRotation < 0) targetRotation += 360;
          if (targetRotation >= 360) targetRotation -= 360;

          // Calculate the shortest path to the target
          let rotationDifference = targetRotation - currentRotationNormalized;
          if (rotationDifference < 0) rotationDifference += 360;

          // Add multiple full spins for visual effect
          const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
          const totalRotation = rotation + fullSpins * 360 + rotationDifference;

          console.log('Current rotation:', rotation);
          console.log('Current rotation normalized:', currentRotationNormalized);
          console.log('Segment angle:', segmentAngle);
          console.log('Winning segment center angle:', winningSegmentCenterAngle);
          console.log('Target rotation:', targetRotation);
          console.log('Rotation difference:', rotationDifference);
          console.log('Total rotation:', totalRotation);

          setRotation(totalRotation);
        } else {
          console.error('Winning segment not found for item_id:', spinApiResult.item_id);
          // Fallback: random rotation
          const randomRotation = rotation + 5 * 360 + Math.random() * 360;
          setRotation(randomRotation);
        }

        setTimeout(() => {
          setIsSpinning(false);
          setResult({
            icon: spinApiResult.icon,
            reward: spinApiResult.label,
            remaining_coins: spinApiResult.remaining_coins,
            spinitem_id: spinApiResult.item_id,
          });

          setCurrentCoins(spinApiResult.remaining_coins);
          if (setUser && user) {
            setUser({
              ...user,
              coins: spinApiResult.remaining_coins.toString(),
            });
          }
          setShowResult(true);
        }, 3000);

      } else {
        setIsSpinning(false);
        toast.error(spinApiResult.message || "Spin failed. Please try again.");
      }
    } catch (error) {
      setIsSpinning(false);
      console.error("Error calling spin API:", error);
      toast.error("Network error. Please try again.");
    }
  };

  // Add this useEffect to debug the segments
  useEffect(() => {
    if (segments.length > 0) {
      console.log('Segments loaded in order:')
      segments.forEach((segment, index) => {
        const segmentAngle = 360 / segments.length;
        const startAngle = index * segmentAngle;
        const endAngle = (index + 1) * segmentAngle;
        const centerAngle = startAngle + (segmentAngle / 2);
        console.log(`Index ${index}: spinitem_id=${segment.spinitem_id}, reward="${segment.reward}", angles: ${startAngle}° - ${endAngle}° (center: ${centerAngle}°)`)
      })
    }
  }, [segments])

  const handleCollect = async (spinitem_id: number) => {
    if (!userId) return;

    try {
      const response = await fetch('https://suggesto.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gofor: 'claimspingift',
          user_id: userId,
          spinitem_id: spinitem_id
        })
      });

      const claimResult = await response.json();

      if (claimResult.status) {
        // Update coin balance if available
        if (claimResult.remaining_coins !== undefined) {
          setCurrentCoins(claimResult.remaining_coins);
          if (setUser && user) {
            setUser({ ...user, coins: claimResult.remaining_coins.toString() });
          }
        }

        toast.success(claimResult.message || 'Reward claimed successfully!');
        setShowResult(false);
        setResult(null);

        // Fetch updated recent results after successful claim
        await fetchRecentResults();
      } else {
        toast.error(claimResult.message || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-white min-h-screen mb-22 p-4 animate-pulse space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mt-8">
          <div className="w-10 h-10 rounded-full bg-[#2b2b2b]" />
          <div className="space-y-2">
            <div className="h-4 w-40 bg-[#2b2b2b] rounded" />
            <div className="h-3 w-64 bg-[#2b2b2b] rounded" />
          </div>
        </div>

        {/* Spin Wheel Skeleton */}
        <div className="flex justify-center">
          <div className="w-80 h-80 rounded-full bg-[#121212] border-8 border-gray-700 relative">
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-[#2b2b2b] rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-4 left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-400 transform -translate-x-1/2" />
          </div>
        </div>

        {/* Spin Button Skeleton */}
        <div className="w-full max-w-md mx-auto h-12 bg-[#2b2b2b] rounded" />

        {/* Recent Results Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-48 bg-gray-600 rounded mb-2" />
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center bg-[#2b2b2b] p-3 rounded-lg">
              <div className="h-4 w-24 bg-[#2b2b2b] rounded" />
              <div className="h-4 w-28 bg-[#2b2b2b] rounded" />
            </div>
          ))}
        </div>

        {/* Footer Text */}
        <div className="text-center">
          <div className="h-3 w-48 bg-[#2b2b2b] rounded mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      {/* Top Header & Background */}
      <div className="relative ">
        <div className="absolute inset-0 z-0 h-60">
          <div className="relative w-full h-full">
            <Image src={BackgroundImage} alt="bg" fill className="object-cover" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#121214] opacity-90" />
          </div>
        </div>

        <div className="relative z-10">
          <header className="flex justify-between items-center p-4 pt-8 mb-2">
            <div className="flex items-center gap-2">
              <button className="mr-2 p-2 rounded-full bg-[#2b2b2b]" onClick={() => router.back()}>
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Daily Spin Wheel</h1>
                <p className="text-sm text-white/60">Use coins to win rewards</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#2b2b2b] px-3 py-2 rounded-lg">
              <img
                src={coin.src}
                alt="coin"
                className="w-5 h-5 mr-1"
              />
              <span className="text-white font-semibold">{currentCoins}</span>
            </div>
          </header>

          {/* Spin Wheel */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              <div
                className="relative w-80 h-80 rounded-full overflow-hidden border-4 "
                style={{
                  background: "radial-gradient(circle at center, #ecd9ef 0%, #dcd9f2 100%)",
                  boxShadow: "inset 0 0 30px rgba(181, 107, 188, 0.15), 0 6px 20px rgba(122, 113, 196, 0.2)",
                }}
              >
                <svg
                  className="w-full h-full transition-transform duration-[3000ms] ease-out"
                  style={{ transform: `rotate(${rotation}deg)` }}
                  viewBox="0 0 200 200"
                >
                  {segments.map((segment, index) => {
                    // Start from the top (12 o'clock) and go clockwise
                    const angle = (360 / segments.length) * index - 90;
                    const nextAngle = (360 / segments.length) * (index + 1) - 90;
                    const startAngle = (angle * Math.PI) / 180
                    const endAngle = (nextAngle * Math.PI) / 180
                    const x1 = 100 + 98 * Math.cos(startAngle)  // Increased from 88 to 95
                    const y1 = 100 + 98 * Math.sin(startAngle)  // Increased from 88 to 95
                    const x2 = 100 + 98 * Math.cos(endAngle)   // Increased from 88 to 95
                    const y2 = 100 + 98 * Math.sin(endAngle)   // Increased from 88 to 95
                    const largeArcFlag = nextAngle - angle > 180 ? 1 : 0
                    const pathData = [`M 100 100`, `L ${x1} ${y1}`, `A 95 95 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")


                    const textAngle = (angle + nextAngle) / 2
                    const textRadius = 65
                    const textX = 100 + textRadius * Math.cos((textAngle * Math.PI) / 180)
                    const textY = 100 + textRadius * Math.sin((textAngle * Math.PI) / 180)

                    // Corrected angle calculation to make icons face center
                    const angleToCenter = textAngle + 90;

                    // Check if segment.icon is a URL (image) or emoji/text
                    const isImageIcon = segment.icon.startsWith('http')

                    return (
                      <g key={index}>
                        <path
                          d={pathData}
                          fill={index % 2 === 0 ? "#7316b5" : "#4d137d"}
                          // stroke="rgba(255,255,255,0.3)"
                          // strokeWidth="0"
                          strokeLinecap="round"
                          style={{
                            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.1))",
                          }}
                        />
                        {isImageIcon ? (
                          <image
                            x={textX - 30}  // Increased from -20 to -25 for even larger icon
                            y={textY - 30}  // Increased from -20 to -25 for even larger icon
                            width="60"      // Increased from 40 to 50
                            height="60"     // Increased from 40 to 50
                            href={segment.icon}
                            style={{
                              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                            }}
                            transform={`rotate(${angleToCenter}, ${textX}, ${textY})`}
                          />
                        ) : (
                          <text
                            x={textX}
                            y={textY}
                            fill="#ffffff"
                            fontSize="40"   // Increased from 32 to 40
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontWeight="700"
                            style={{
                              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                            }}
                            transform={`rotate(${angleToCenter}, ${textX}, ${textY})`}
                          >
                            {segment.icon}
                          </text>
                        )}

                      </g>
                    )
                  })}

                </svg>

                {/* Center circle with star symbol */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #f3e8ff, #c084fc, #9333ea)",
                    boxShadow: "0 4px 15px rgba(147, 112, 219, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
                  }}
                >
                  <div className="text-purple-900">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2L14.8 8.9H22L16 13.6L18.8 20.5L12 15.8L5.2 20.5L8 13.6L2 8.9H9.2L12 2Z" />
                    </svg>
                  </div>
                </div>

                {/* Enhanced Pointer */}
                <div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 rotate-180 w-0 h-0 z-20"
                  style={{
                    borderLeft: "16px solid transparent",
                    borderRight: "16px solid transparent",
                    borderBottom: "32px solid #ffff",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                />

              </div>
            </div>

            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              className="px-6 py-3 rounded-lg text-lg "
            >
              {isSpinning ? "Spinning..." : "Spin Now!"}
            </Button>

            {/* Coin indicator */}
            <div className="mt-2 flex items-center gap-2 bg-black/70 px-3 py-1 rounded-full">
              <img
                src={coin.src}
                alt="coin"
                className="w-5 h-5 mr-1"
              />
              <span className="text-white text-sm font-medium">50 Coins</span>
            </div>
          </div>

          {/* Recent Results */}
          <div className="px-4 w-full mx-auto mb-6">
            <div className="mb-6 bg-[#2b2b2b] p-3 rounded-2xl">
              <h3 className="text-lg font-semibold mb-4 text-white">Recent Spin Results</h3>

              <div className="space-y-3 h-[300px] overflow-y-auto pr-1">
                {recentResults.length > 0 ? (
                  recentResults.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#121212] px-3 py-3 rounded-2xl">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.user}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium leading-tight">{item.user}</p>
                          <p className="text-xs text-gray-400">{item.badge}</p>
                        </div>
                      </div>

                      {/* Reward Display */}
                      <div className="flex items-center w-[120px] bg-[#2b2b2b] px-3 py-1 rounded-full truncate">
                        <img
                          src={coin.src}
                          alt="coin"
                          className="w-5 h-5 mr-1"
                        />
                        <span className="text-white text-sm font-semibold">
                          {item.reward}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">
                    No recent spins yet. Be the first to spin!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Result Modal */}
          {showResult && result && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
              <Card className="bg-[#2b2b2b] border-gray-700 w-full max-w-sm">
                <CardContent className="p-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Congratulations!! 🎉</h2>

                  <div className="mb-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-full flex items-center justify-center">
                      {result.icon.startsWith('http') ? (
                        <img
                          src={result.icon}
                          alt="reward"
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <span className="text-4xl">{result.icon}</span>
                      )}
                    </div>

                    <div className="text-3xl font-bold bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent mb-2">
                      {result.reward}
                    </div>
                    {result.remaining_coins !== undefined && (
                      <p className="text-yellow-400 text-sm font-medium mb-2">
                        Remaining Coins: {result.remaining_coins}
                      </p>
                    )}
                    <p className="text-gray-400 text-sm">You have won an amazing reward!</p>
                    <p className="text-gray-400 text-sm">Keep collecting and spinning.</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleCollect(result.spinitem_id)}
                      className="w-full bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:from-[#a55aab] to-[#6960b3] px-4 py-3 rounded-lg text-white"
                    >
                      Collect
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}