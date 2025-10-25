"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Clock, Zap, Target, Timer, Loader2, Award, RefreshCcw, Share2Icon, ArrowRight, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Cookies from "js-cookie"
import BackgroundImage from "@/assets/quiz/movie-quiz-battle-bg.png"
import BackgroundImageResult from "@/assets/quiz/movie-quiz-result-bg.png"
import clock from "@/assets/quiz/clock.png"
import rulesImage from "@/assets/quiz/rules.png"
import { useUser } from "@/contexts/UserContext"
import { AnimatePresence, motion } from "framer-motion"
import tropy from "@/assets/quiz/result.png"
import BetterLuck from "@/assets/quiz/better-luck.png"
import toast from "react-hot-toast"
import { Prize, QuizQuestion, QuizResult } from "./type"
import * as htmlToImage from "html-to-image";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

export default function QuizPage() {
  const resultRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const router = useRouter()
  const { user } = useUser()
  const [coins, setCoins] = useState(1250)
  const [timeLeft, setTimeLeft] = useState(86400)
  const [isJoining, setIsJoining] = useState(false)
  const [rulesVisible, setRulesVisible] = useState(false)
  const userId = Cookies.get("userID")
  // Quiz states
  const [gameState, setGameState] = useState("waiting")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizTimeLeft, setQuizTimeLeft] = useState(180) // Changed to 180 seconds (3 minutes)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [score, setScore] = useState(0)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)

  // API data states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [prizeList, setPrizeList] = useState<Prize[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [quizScreenshot, setQuizScreenshot] = useState<string | null>(null);


  // Fetch quiz questions
  const fetchQuizQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=quizqueans&user_id=${userId}`);
      const data = await response.json();

      if (data.status && data.data) {
        setQuizQuestions(data.data);
        setSelectedAnswers(new Array(data.data.length).fill(null));
      } else {
        // status is false → show message
        toast.error(data.message || "Unable to fetch quiz questions");
      }
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Fetch prize list
  const fetchPrizeList = async () => {
    setIsLoadingPrizes(true)
    try {
      const response = await fetch('https://suggesto.xyz/App/api.php?gofor=quizpricelist')
      const data = await response.json()

      if (Array.isArray(data)) {
        setPrizeList(data.filter(prize => prize.status === 1))
      }
    } catch (error) {
      console.error('Error fetching prize list:', error)
    } finally {
      setIsLoadingPrizes(false)
    }
  }

  // Submit quiz results
  const submitQuizResults = async () => {
    setIsSubmittingQuiz(true)
    try {
      const queans = selectedAnswers.map((answerIndex, questionIndex) => {
        const question = quizQuestions[questionIndex]
        const selectedOption = answerIndex !== null ? question.options[answerIndex] : null

        return {
          question_id: question.question_id.toString(),
          answer_id: selectedOption ? selectedOption.option_id.toString() : "0"
        }
      })

      const requestBody = {
        gofor: "quizresult",
        user_id: userId,
        queans: queans
      }

      const response = await fetch('https://suggesto.xyz/App/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data.status && data.result) {
        setQuizResult(data.result)
        setScore(data.result.score)
      }
    } catch (error) {
      console.error('Error submitting quiz results:', error)
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchPrizeList()
  }, [])

  // Countdown timer for quiz start
  useEffect(() => {
    if (gameState === "waiting") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameState])

  // Quiz timer
  useEffect(() => {
    if (gameState === "quiz" && quizTimeLeft > 0) {
      const timer = setInterval(() => {
        setQuizTimeLeft((prev) => {
          if (prev <= 1) {
            finishQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameState, quizTimeLeft])

  const formatQuizTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleJoinQuiz = async () => {
    if (!userId || coins < 100) return;

    setIsJoining(true)
    await fetchQuizQuestions()

    setTimeout(() => {
      setCoins((prev) => prev - 100)
      setIsJoining(false)
      setGameState("quiz")
      setQuizTimeLeft(180) // Reset to 180 seconds when starting quiz
    }, 1500)
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      finishQuiz()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const finishQuiz = async () => {
    setGameState("submitting")
    await submitQuizResults()
    setGameState("results")
  }

  const restartQuiz = () => {
    setGameState("waiting")
    setCurrentQuestion(0)
    setSelectedAnswers([])
    setScore(0)
    setQuizResult(null)
    setQuizTimeLeft(180) // Reset to 180 seconds
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRulesVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setRulesVisible]);


  const handleQuizShare = async (
    quizResult: any,
    score: number,
    resultRef: React.RefObject<HTMLDivElement>
  ) => {
    if (!quizResult || !resultRef.current) return;

    // 🎯 selectors to hide (like in PDF function)
    const toHideSelectors = [".skip-block", "noscript"];
    const hidden: { el: HTMLElement; display: string }[] = [];

    toHideSelectors.forEach((sel) => {
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        hidden.push({ el, display: el.style.display });
        el.style.display = "none";
      });
    });

    try {
      // 📸 Capture screenshot of the result card
      const dataUrl = await htmlToImage.toJpeg(resultRef.current, { quality: 0.95 });

      if (Capacitor.isNativePlatform()) {
        // Remove prefix → get base64
        const base64Data = dataUrl.split(",")[1];
        const fileName = `quiz-result-${Date.now()}.jpg`;

        // Save image in cache
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        // Native Share
        await Share.share({
          title: "My Movie Quiz Results",
          text: `🎬 I scored ${score}/${quizResult.total_questions}! 🎉`,
          files: [savedFile.uri],
          url: "https://suggesto.app/quiz",
        });
      } else if (navigator.share) {
        // Web share (can’t share image, only text + link)
        await navigator.share({
          title: "My Movie Quiz Results",
          text: `🎬 I scored ${score}/${quizResult.total_questions}! 🎉`,
          url: "https://suggesto.app/quiz",
        });
      } else {
        // Fallback → copy to clipboard
        await navigator.clipboard.writeText(`🎬 I scored ${score}/${quizResult.total_questions}!`);
        alert("Quiz results copied to clipboard!");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
    } finally {
      // Restore hidden elements
      hidden.forEach(({ el, display }) => (el.style.display = display));
    }
  };

  // Submitting state
  if (gameState === "submitting") {
    return (
      <div className="text-white min-h-screen bg-[#121214] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-400" />
          <h2 className="text-xl font-bold mb-2">Evaluating Your Quiz...</h2>
          <p className="text-gray-400">Please wait while we calculate your results</p>
        </div>
      </div>
    )
  }

  // Quiz state
  if (gameState === "quiz" && quizQuestions.length > 0) {
    const currentQ = quizQuestions[currentQuestion]

    return (
      <div className="text-white min-h-screen bg-[#121214]">
        {/* Mobile Header */}
        <header className="flex justify-between items-center px-4 pt-6">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-[#2b2b2b]" onClick={() => setGameState("waiting")}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Movie Quiz</h1>
              <p className="text-xs text-white/60">Question {currentQuestion + 1}/{quizQuestions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-900/30 px-3 py-1.5 rounded-lg border border-red-500/50">
            <Clock size={14} />
            <span className="font-mono text-sm font-bold text-red-300">{formatQuizTime(quizTimeLeft)}</span>
          </div>
        </header>

        <div className="p-4 pb-safe space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Number Dots */}
          <div className="flex justify-center gap-1.5 py-2 flex-wrap">
            {quizQuestions.map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full text-xs font-bold transition-all duration-300
        flex items-center justify-center leading-none
        ${i === currentQuestion
                    ? "bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white scale-110"
                    : selectedAnswers[i] !== null
                      ? "bg-white text-black"
                      : "bg-[#2b2b2b] text-gray-200"
                  }`}
              >
                <span className="leading-none">{i + 1}</span>
              </div>
            ))}
          </div>


          {/* Question Card */}
          <Card className="bg-[#1f1f21] border-gray-700">
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-white mb-5 leading-6">
                {currentQ.question}
              </h2>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={option.option_id}
                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 active:scale-95 ${selectedAnswers[currentQuestion] === index
                      ? "bg-gradient-to-r from-[#b56bbc]/20 to-[#7a71c4]/20 border-[#b56bbc] text-white shadow-lg shadow-[#b56bbc]/20"
                      : "bg-[#2b2b2b] border-gray-600 text-gray-300 active:bg-gray-700"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${selectedAnswers[currentQuestion] === index
                          ? "border-[#b56bbc] bg-[#b56bbc] shadow-lg shadow-[#b56bbc]/30"
                          : "border-gray-500"
                          }`}
                      >
                        {selectedAnswers[currentQuestion] === index && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="flex-1">{option.option_text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
              className="flex-1 py-3 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <Button
              onClick={currentQuestion === quizQuestions.length - 1 ? finishQuiz : nextQuestion}
              className="flex-1 py-3 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:from-[#a55aab] hover:to-[#6960b3] text-white font-semibold active:scale-95 transition-all duration-200"
            >
              {currentQuestion === quizQuestions.length - 1 ? "Finish Quiz" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Results state
  if (gameState === "results" && quizResult) {

    return (
      <div ref={resultRef} className="min-h-screen text-white" >
        {/* Top Header & Background */}
        <div className="relative min-h-screen">
          <div className="absolute inset-0 z-0 opacity-50 h-60">
            <Image src={BackgroundImageResult} alt="bg" fill className="object-cover" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#121214] opacity-90" />
          </div>

          <div className="relative z-10">
            <header className="flex justify-between items-center p-4 pt-8">
              <div className="flex items-center gap-2">
                <button className="mr-2 p-2 rounded-full bg-[#2b2b2b] skip-block" onClick={() => setGameState("waiting")}>
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-xl font-bold">Movie Quiz Results</h1>
                  <p className="text-sm text-white/60">Your quiz performance</p>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center px-6">
              {/* 3D Trophy */}
              {/* Trophy or BetterLuck image */}
              <div className="relative">
                {score > 5 ? (
                  // Trophy image with user overlay
                  <div className="w-58 h-58 relative">
                    <img
                      src={tropy.src}
                      alt="Trophy"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-16">
                      <div className="w-full h-full bg-gradient-to-br from-[#b56bbc] to-[#7a71c4] rounded-full flex items-center justify-center shadow-xl">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                          <img
                            src={quizResult.reward?.image || "/default-avatar.png"}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // BetterLuck image when score <= 5
                  <div className="w-58 h-58 relative">
                    <img
                      src={BetterLuck.src}
                      alt="Better Luck"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>


              {/* Conditional Message Based on Score */}
              {score > 5 ? (
                <h2
                  className="text-5xl font-bold mb-4 text-center"
                  style={{
                    background: "linear-gradient(45deg, #b56bbc, #7a71c4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow: "0 0 30px rgba(168, 85, 247, 0.5)",
                  }}
                >
                  Congrats!
                </h2>
              ) : (
                <h2
                  className="text-4xl font-bold mb-4 text-center"
                  style={{
                    color: "#ff6b6b",
                    textShadow: "0 0 20px rgba(255, 107, 107, 0.3)",
                  }}
                >
                  Better luck next time
                </h2>
              )}


              {/* Win Message */}
              <p className="text-lg text-gray-200 mb-3 text-center">
                {score > 5
                  ? "You completed the quiz challenge."
                  : "Keep practicing to improve your score!"
                }
              </p>


              {/* Score */}
              <div className="mb-4">
                <p className="text-gray-300 text-center mb-2">You Scored</p>
                <div className="border-2 border-[#b56bbc] rounded-2xl px-8 py-2 bg-black/20 backdrop-blur-sm">
                  <span className="text-2xl font-bold text-white">
                    {score.toString().padStart(2, "0")}/{quizResult.total_questions.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Reward */}
              {quizResult.reward && (
                <div className="mb-8 text-center">
                  <p className="text-gray-300 text-center">You won</p>
                  <div className="bg-[#2b2b2b] rounded-t-2xl px-8 py-1 flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{quizResult.reward.reward_value} Coins</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center border border-gray-600 rounded-b-2xl text-center gap-2 py-1">
                    <span className="text-sm text-gray-400">Total Earnings</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <span className="text-xs">🪙</span>
                      </div>
                      <span className="text-white font-semibold">{quizResult.reward.coins}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 w-full max-w-sm skip-block">
                <Button
                  onClick={() => handleQuizShare(quizResult, score, resultRef)}
                  className="flex-1 bg-white text-gray-800 py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <span>Share</span>
                  <Share2Icon className="w-5 h-5" />
                </Button>
                <Button
                  onClick={restartQuiz}
                  className="flex-1 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <span>Play Again</span>
                  <RefreshCcw className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Waiting state - Mobile optimized
  return (
    <div className="min-h-screen text-white">
      {/* Top Header & Background */}
      <div className="relative h-60">
        <div className="absolute inset-0 z-0 h-60">
          <div className="relative w-full h-full">
            <Image src={BackgroundImage} alt="bg" fill className="object-cover" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#121214] opacity-90" />
          </div>
        </div>

        <div className="relative z-20">
          <header className="flex items-center justify-between pt-8 px-4">
            <div className="flex gap-3 items-start">
              <button onClick={() => router.back()} className="p-2 rounded-full bg-[#2b2b2b]">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">Movie Quiz Battle</h1>
                <p className="text-sm text-white/60">Use coins to play & win real rewards</p>
              </div>
            </div>
          </header>

          {/* Top Info Boxes */}
          <div className="flex gap-2 px-2 mt-4">
            <div className="w-[60%]">
              <div className="relative p-4 h-28 rounded-2xl shadow-lg bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] flex justify-between items-center">
                <div className="z-10 text-white">
                  <div className="flex items-center gap-1 mb-2">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold text-sm">Reward Points</span>
                  </div>
                  <div className="font-extrabold text-xl">{user?.coins || coins} Points</div>
                </div>
                <div className="absolute bottom-0 right-0 w-20 h-20 z-0">
                  <Image src={clock} alt="cup" className="object-contain w-full h-full" />
                </div>
              </div>
            </div>

            <div className="w-[40%]">
              <div className="p-[2px] rounded-3xl bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:scale-105 transition-transform duration-200 shadow-xl">
                <Card
                  onClick={() => setRulesVisible(true)}
                  className="relative rounded-3xl bg-[#2b2b2b] text-white flex flex-col items-center justify-end pt-12 pb-5 px-4 h-28 cursor-pointer"
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <Image src={rulesImage} alt="Quiz Rules" width={50} height={50} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-semibold">Quiz Rules</h3>
                    <p className="text-xs text-white/70 mt-1">Learn the rules</p>
                  </div>
                  <div className="absolute -bottom-3 right-6 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] rounded-full p-1 z-50">
                    <ArrowRight className="h-4 w-4 text-[#b56bbc]" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Enhanced Reward Tiers */}
        <div>
          <h3 className="text-white text-lg font-bold mb-4">Win Quiz & Grab rewards</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
            {prizeList.map((prize) => (
              <div
                key={prize.prize_id}
                className="bg-[#2b2b2b] min-w-[180px] max-w-[160px] shrink-0 transition-colors rounded-xl flex flex-col justify-between shadow border border-white/20"
              >
                {prize.image ? (
                  <img
                    src={prize.image}
                    alt={prize.title}
                    className="w-full h-[100px] object-contain rounded-t-xl"
                  />
                ) : null}

                {/* Fallback div that shows when image fails or doesn't exist */}
                <div
                  className="w-full h-[100px] flex items-center justify-center text-white/50 text-xl rounded-t-xl"
                  style={{ display: prize.image ? 'none' : 'flex' }}
                >
                  🎁
                </div>

                <div className="p-3 flex flex-col justify-between flex-grow text-center">
                  <div className="mb-2">
                    <h4 className="text-white text-sm font-semibold line-clamp-2 leading-snug">
                      {prize.title}
                    </h4>
                    <p className="text-xs text-white/50 mt-1 line-clamp-1">
                      {prize.reward_type} - {prize.reward_value}
                    </p>
                  </div>

                  <span className="text-white px-3 py-1 rounded-full bg-white/20 text-center text-xs mt-1 block">
                    Required Score: {prize.min_score}-{prize.max_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Rules Popup */}
        <AnimatePresence>
          {rulesVisible && (
            <>
              {/* Overlay */}
              <motion.div
                key="overlay"
                className="fixed inset-0 bg-black/90 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRulesVisible(false)}
              />

              {/* Popup */}
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                aria-modal="true"
                role="dialog"
                onClick={() => setRulesVisible(false)} // close when clicking outside inner content
              >
                <div
                  onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                  className="relative w-full max-w-lg bg-[#121214] rounded-2xl shadow-xl overflow-y-auto"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center px-6 py-4 ">
                    <h2 className="text-lg font-semibold text-white">Quiz Rules</h2>
                    <button
                      onClick={() => setRulesVisible(false)}
                      aria-label="Close"
                      className="text-white text-xl leading-none"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">

                    <div className="flex items-center  gap- mb-4">
                      <div className="p-2 w-10 h-10 ">
                        <Image src={rulesImage} alt="Quiz Rules" width={50} height={50} />

                      </div>
                      <h3 className="text-lg font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                        Quiz Rules
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition-all duration-300">
                        <div className="mt-1">
                          <Timer size={16} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                        <span className="text-gray-200 text-sm leading-relaxed">
                          <span className="font-semibold text-blue-300">3-minute timer</span> with challenging movie trivia questions
                        </span>
                      </div>
                      <div className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition-all duration-300">
                        <div className="mt-1">
                          <Zap size={16} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
                        </div>
                        <span className="text-gray-200 text-sm leading-relaxed">
                          Compete with <span className="font-semibold text-purple-300">players worldwide</span> in real-time
                        </span>
                      </div>
                      <div className="flex items-start gap-3 group hover:bg-white/5 p-2 rounded-lg transition-all duration-300">
                        <div className="mt-1">
                          <Target size={16} className="text-green-400 group-hover:text-green-300 transition-colors" />
                        </div>
                        <span className="text-gray-200 text-sm leading-relaxed">
                          Rankings based on <span className="font-semibold text-green-300">speed and accuracy</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>


        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleJoinQuiz}
            disabled={isJoining || Number(user?.coins || coins) < 100 || isLoadingQuestions}
            className="w-full bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] px-4 py-2 rounded-lg text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isJoining || isLoadingQuestions ? (
              <div className="flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                {isLoadingQuestions ? "Loading Questions..." : "Joining Quiz..."}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span>Join Quiz Battle</span>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full">
                  <span className="text-yellow-300">🪙</span>
                  <span className="text-sm">100</span>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}