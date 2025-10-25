"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import confetti from "canvas-confetti"
import {
  AnimatePresence,
  motion,
} from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Clock,
  Trophy,
  Users,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useUser } from "@/contexts/UserContext"
import BackgroundImage from "@/assets/spend-coins/monthly-mega-draw-bg.png"
import cup from "@/assets/cup.png"
import rulesImage from "@/assets/quiz/rules.png"
import SuccessPopup from "./_components/ticket-successpopup"
import { DrawResult, Prize, SocialFact, Testimonial, Ticket, TimeLeft } from "./type"


const formatYYYYMM = (date: Date): string =>
  `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`

const getPreviousMonthString = (): string => {
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return formatYYYYMM(prev)
}

function getTimeLeftUntilNextMonth(): TimeLeft {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const diff = nextMonth.getTime() - now.getTime()

  const seconds = Math.floor((diff / 1000) % 60)
  const minutes = Math.floor((diff / 1000 / 60) % 60)
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds }
}



export default function LuckyDrawPage() {
  const router = useRouter()
  const { user, setUser } = useUser()

  const userId = Cookies.get("userID")
  const userCoins = Number.parseInt(user?.coins || "0", 10)

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeftUntilNextMonth())
  const [socialFacts, setSocialFacts] = useState<SocialFact[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [drawResults, setDrawResults] = useState<DrawResult | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0)

  const [showResultsPopup, setShowResultsPopup] = useState(false)
  const [usersTicketsVisible, setUsersTicketsVisible] = useState(false)

  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [purchasedTicketNumber, setPurchasedTicketNumber] = useState("")

  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())


  const currentMonth = useMemo(() => formatYYYYMM(new Date()), [])
  const previousMonth = useMemo(() => getPreviousMonthString(), [])

  const isWithinFirstThreeDays = useMemo(() => {
    const today = new Date().getDate()
    return today >= 1 && today <= 3
  }, [])

  const isSecondDayOfMonth = useMemo(
    () => new Date().getDate() === 2,
    [],
  )

  const prizeMonthToFetch = useMemo(
    () => (isSecondDayOfMonth ? currentMonth : previousMonth),
    [isSecondDayOfMonth, currentMonth, previousMonth],
  )

  const drawResultMonthToFetch = useMemo(
    () => (isWithinFirstThreeDays ? previousMonth : currentMonth),
    [isWithinFirstThreeDays, previousMonth, currentMonth],
  )


  const fetchSocialFacts = async () => {
    try {
      const res = await fetch("https://suggesto.xyz/App/api.php?gofor=megadrawfactlist")
      const data: SocialFact[] = await res.json()
      if (Array.isArray(data))
        setSocialFacts(
          data.filter(f => f.status === 1).sort((a, b) => a.sort_order - b.sort_order),
        )
    } catch (e) {
      console.error("Error fetching social facts:", e)
    }
  }

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("https://suggesto.xyz/App/api.php?gofor=megadrawteslist")
      const data: Testimonial[] = await res.json()
      if (Array.isArray(data)) setTestimonials(data.filter(t => t.status === 1))
    } catch (e) {
      console.error("Error fetching testimonials:", e)
    }
  }

  const fetchPrizes = async (month = prizeMonthToFetch) => {
    try {
      const res = await fetch(
        `https://suggesto.xyz/App/api.php?gofor=megamonthprizeresult&draw_month=${month}`,
      )
      const data: { status: boolean; data: Prize[] } = await res.json()
      if (data.status && Array.isArray(data.data)) {
        setPrizes(data.data.filter(p => p.status === 1))
      } else {
        setPrizes([])
      }
    } catch (e) {
      console.error("Error fetching prizes:", e)
      setPrizes([])
    }
  }

  const fetchTickets = async () => {
    if (!userId) return
    try {
      const res = await fetch(
        `https://suggesto.xyz/App/api.php?gofor=ticketslist&user_id=${userId}`,
      )
      const data: { status: boolean; data: Ticket[] } = await res.json()
      if (data.status && Array.isArray(data.data)) setTickets(data.data)
    } catch (e) {
      console.error("Error fetching tickets:", e)
    }
  }

  const fetchDrawResults = async (month = drawResultMonthToFetch) => {
    try {
      const res = await fetch(
        `https://suggesto.xyz/App/api.php?gofor=megamonthdrawresult&draw_month=${month}`,
      )
      const data: { status: boolean; data: DrawResult } = await res.json()
      if (data.status && data.data) setDrawResults(data.data)
    } catch (e) {
      console.error("Error fetching draw results:", e)
    }
  }


  const buyTicket = async () => {
    if (isLoading || !userId) return
    setIsLoading(true)

    try {
      const res = await fetch(
        `https://suggesto.xyz/App/api.php?gofor=buyTicket&user_id=${userId}`,
      )
      const data: {
        status: boolean
        message?: string
        ticket_number?: string
        remaining_coins?: number
      } = await res.json()

      if (data.status) {
        // update coins
        if (data.remaining_coins !== undefined && user) {
          setUser({ ...user, coins: data.remaining_coins.toString() })
        }

        // show popup
        setPurchasedTicketNumber(data.ticket_number || "")
        setShowSuccessPopup(true)
        await fetchTickets()
      } else {
        toast.error(data.message || "Failed to purchase ticket")
      }
    } catch (e) {
      console.error("Error buying ticket:", e)
      toast.error("Error purchasing ticket. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }


  const handleImgError = useCallback((id: number) => {
    setFailedImages(prev => {
      if (prev.has(id)) return prev
      const copy = new Set(prev)
      copy.add(id)
      return copy
    })
  }, [])


  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeftUntilNextMonth())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (socialFacts.length === 0) return
    const id = setInterval(() => {
      setCurrentFeedIndex(prev => (prev + 1) % socialFacts.length)
    }, 2000)
    return () => clearInterval(id)
  }, [socialFacts.length])

  useEffect(() => {
    fetchSocialFacts()
    fetchTestimonials()
    fetchTickets()
    fetchPrizes(prizeMonthToFetch)
    fetchDrawResults(drawResultMonthToFetch)
  }, [])


  const DrawResultsCard = () =>
    drawResults && isWithinFirstThreeDays ? (
      <div className="bg-[#1f1f21] p-3 rounded-xl">
        <div className="text-center mb-4">
          <Trophy className="mx-auto mb-2" size={32} />
          <h2 className="text-xl font-bold text-white">🎉 Last Month's Winners! 🎉</h2>
        </div>

        <div className="space-y-3">
          {[
            { label: "🥇 1st Prize", ticket: drawResults.winning_ticket_1 },
            { label: "🥈 2nd Prize", ticket: drawResults.winning_ticket_2 },
            { label: "🥉 3rd Prize", ticket: drawResults.winning_ticket_3 },
          ].map(({ label, ticket }) => (
            <div key={label} className="bg-white/10 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{label}</span>
                <span className="text-lg font-bold">#{ticket}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null




  return (
    <div className="min-h-screen text-white">
      {/* ------------ Top Header & BG ------------ */}
      <div className="relative h-60">
        <div className="absolute inset-0 z-0 h-60">
          <div className="relative w-full h-full">
            <Image
              src={BackgroundImage}
              alt="Monthly Mega Draw Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#121214] opacity-90" />
          </div>
        </div>

        <div className="relative z-20">
          {/* header */}
          <header className="flex items-center justify-between pt-8 px-4">
            <div className="flex gap-3 items-start">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full bg-[#2b2b2b]"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Monthly Mega Draw</h1>
                <p className="text-sm text-white/60">
                  Buy tickets. Win real rewards
                </p>
              </div>
            </div>
          </header>

          {/* info boxes */}
          <div className="flex gap-2 px-2 mt-4">
            {/* reward points */}
            <div className="w-[60%]">
              <div className="relative p-4 h-28 rounded-2xl shadow-lg bg-gradient-to-r from-[#b56bbc]/200 to-[#7a71c4]/100 flex justify-between items-center">
                <div className="z-10 text-white">
                  <div className="flex items-center gap-1 mb-2">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold text-sm">Reward Points</span>
                  </div>
                  <div className="font-extrabold text-xl">
                    {user?.coins} Points
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-20 h-20 z-0">
                  <Image
                    src={cup}
                    alt="Trophy Cup"
                    width={80}
                    height={80}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* my tickets button */}
            <div className="w-[40%]">
              <div className="p-[2px] rounded-3xl bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:scale-105 transition-transform duration-200 shadow-xl">
                <Card
                  onClick={() => setUsersTicketsVisible(true)}
                  className="relative rounded-3xl bg-[#2b2b2b] text-white flex flex-col items-center justify-end pt-12 pb-5 px-4 h-28"
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <Image
                      src={rulesImage}
                      alt="Ticket Rules"
                      width={50}
                      height={50}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-sm font-semibold">Your Tickets</h3>
                    <p className="text-xs text-white/70">Check your tickets!</p>
                  </div>
                  <div className="absolute -bottom-3 right-6 bg-white rounded-full p-1 shadow-[0_10px_25px_rgba(0,0,0,0.3)] z-50">
                    <ArrowRight className="h-4 w-4 text-[#b56bbc]" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* last month winners (first 3 days) */}
        <DrawResultsCard />

        {/* countdown */}
        <div className="bg-[#2b2b2b] border border-gray-700 shadow-lg rounded-xl">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock size={18} className="text-[#b56bbc]" />
              <p className="text-gray-300 font-medium">Next Draw In:</p>
            </div>

            <div className="flex justify-center gap-4">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-gradient-to-b from-[#b56bbc] to-[#7a71c4] p-3 rounded-lg min-w-[60px]"
                >
                  <div className="text-2xl font-bold text-white">
                    {value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-white/80">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* buy tickets cta */}
        <div className="bg-[#2b2b2b] border border-gray-700 mb-6 rounded-xl">
          <div className="p-4 text-center">
            <p className="text-gray-300 mb-2">Ticket Status</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
              You have {tickets.length} Tickets
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Available Coins: {userCoins}
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 px-4 pt-2 pb-4">
            <Button
              onClick={buyTicket}
              disabled={isLoading || userCoins < 500}
              className="w-full bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:from-[#a55aab] hover:to-[#6960b3] text-white py-4 text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50"
            >
              {isLoading ? "Buying Ticket..." : "Buy Tickets"}
            </Button>
            <p className="text-xs text-gray-400 text-center">
              500 Coins per ticket (buy multiple)
            </p>

            {!isWithinFirstThreeDays && (
              <Button
                onClick={() => {
                  setShowResultsPopup(true)
                  if (!drawResults) fetchDrawResults(previousMonth)
                }}
                className="w-full bg-[#2b2b2b] hover:bg-[#3b3b3b] border border-[#b56bbc]/30 text-white py-3 text-base font-medium rounded-xl mt-3"
              >
                <Trophy size={18} className="mr-2" />
                View Last Month's Results
              </Button>
            )}
          </div>
        </div>

        {/* prize pool */}
        <div>
          <h3 className="text-white text-lg font-bold mb-4">
            Buy Tickets &amp; Grab rewards
          </h3>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
            {prizes.map(p => (
              <div
                key={p.prize_id || p.position}
                className="bg-[#2b2b2b] w-[240px] shrink-0 rounded-xl flex flex-col justify-between shadow border border-white/20"
              >
                {p.price_img ? (
                  <img
                    src={p.price_img}
                    alt={p.prize_title}
                    className="w-full h-[100px] object-contain rounded-t-xl"
                  />
                ) : (
                  <div className="w-full h-[100px] flex items-center justify-center text-white/50 text-xl rounded-t-xl">
                    🎁
                  </div>
                )}

                <div className="p-3 text-center flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-white text-sm font-semibold line-clamp-2 leading-snug">
                      {p.prize_title}
                    </h4>
                    {p.prize_details && (
                      <p className="text-xs text-white/50 mt-1 line-clamp-1">
                        {p.prize_details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* live updates */}
        <div className="bg-[#2b2b2b] border-gray-700 shadow-lg rounded-xl">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-[#b56bbc]" size={20} />
              <h3 className="text-lg font-bold text-white">Live Updates</h3>
            </div>

            <div className="bg-[#1a1a1c] rounded-lg p-3 border border-gray-800">
              <div className="text-sm text-gray-300 animate-pulse">
                <span className="text-[#b56bbc]">●</span>{" "}
                {socialFacts.length > 0
                  ? socialFacts[currentFeedIndex]?.fact_text
                  : "8,000+ participants this month!"}
              </div>
            </div>
          </div>
        </div>

        {/* testimonials */}
        {testimonials.length > 0 && (
          <div className="mt-8">
            <h3 className="text-white text-lg font-bold mb-4">
              Winners Stories
            </h3>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
              <div className="flex gap-4 pb-2" style={{ minWidth: "max-content" }}>
                {testimonials.map(t => {
                  const showImage =
                    t.image_url && !failedImages.has(t.testimonial_id)
                  const initial = t.user_name
                    ? t.user_name.trim().charAt(0).toUpperCase()
                    : "?"

                  return (
                    <div
                      key={t.testimonial_id}
                      className="bg-[#2b2b2b] p-4 rounded-xl min-w-[280px] max-w-[280px]"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {showImage ? (
                          <img
                            src={t.image_url!}
                            alt={t.user_name}
                            className="w-10 h-10 rounded-full object-cover"
                            loading="lazy"
                            onError={() => handleImgError(t.testimonial_id)}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] flex items-center justify-center text-white font-bold">
                            {initial}
                          </div>
                        )}

                        <div>
                          <p className="text-white font-medium text-sm">
                            {t.user_name}
                          </p>
                          <div className="flex text-yellow-400 text-xs">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        &ldquo;{t.message}&rdquo;
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>

      {/* ----------------------- My Tickets Modal ----------------------- */}
      <AnimatePresence>
        {usersTicketsVisible && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black/90 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUsersTicketsVisible(false)}
            />

            <motion.div
              key="tickets-modal"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
            >
              <div
                onClick={e => e.stopPropagation()}
                className="relative w-full max-h-[60vh] max-w-lg bg-[#121214] rounded-2xl shadow-xl overflow-y-auto"
              >
                {/* header */}
                <div className="flex justify-between items-center p-4">
                  <h2 className="text-lg font-semibold text-white">
                    My Tickets ({tickets.length})
                  </h2>
                  <button
                    onClick={() => setUsersTicketsVisible(false)}
                    className="p-2 rounded-full bg-[#2b2b2b] hover:bg-[#3b3b3b]"
                    aria-label="Close tickets view"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* list */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {tickets.length > 0 ? (
                      tickets.map(tk => (
                        <div
                          key={tk.ticket_id}
                          className="bg-gradient-to-r from-[#b56bbc]/30 to-[#7a71c4]/20 p-4 rounded-lg flex justify-between items-center"
                        >
                          <div className="text-white font-bold text-lg">
                            #{tk.ticket_number}
                          </div>
                          <div className="text-white/80 text-xs">
                            {new Date(tk.created_date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-white/50 mb-2">
                          No tickets yet
                        </div>
                        <div className="text-sm text-white/30">
                          Buy your first ticket to get started!
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="h-4" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ----------------------- Draw Results Popup ----------------------- */}
      {showResultsPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1f1f21] rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-xl font-bold text-white">Draw Results</h2>
              <button
                onClick={() => setShowResultsPopup(false)}
                className="p-2 rounded-full bg-[#2b2b2b] hover:bg-[#3b3b3b]"
                aria-label="Close results popup"
              >
                <X size={20} />
              </button>
            </div>
            {drawResults && (
              <div className="p-4">
                <div className="text-center mb-4">
                  <Trophy className="mx-auto mb-2" size={32} />
                  <h3 className="text-lg font-bold text-white">
                    🎉 Last Month's Winners! 🎉
                  </h3> 
                </div>

                <div className="space-y-3">
                  {[
                    { label: "🥇 1st Prize", ticket: drawResults.winning_ticket_1 },
                    { label: "🥈 2nd Prize", ticket: drawResults.winning_ticket_2 },
                    { label: "🥉 3rd Prize", ticket: drawResults.winning_ticket_3 },
                  ].map(({ label, ticket }) => (
                    <div key={label} className="bg-white/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{label}</span>
                        <span className="text-lg font-bold">#{ticket}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------- Success Popup (with AnimatePresence) ----------------------- */}
      <AnimatePresence mode="wait">
        {showSuccessPopup &&
          <SuccessPopup
            onClose={() => setShowSuccessPopup(false)}
            purchasedTicketNumber={purchasedTicketNumber} />}
      </AnimatePresence>
    </div>
  )
}
