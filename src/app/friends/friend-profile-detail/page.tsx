"use client"

import { Bell, ArrowLeft, Users, Music, Globe, Crown, Phone, Calendar, Settings, Venus, Mars, User, Bookmark, Eye, TrendingUp, Trophy, ArrowRight, Film, VenusAndMars, CalendarDays, Languages, Drama, Clapperboard, X, Inbox, Lightbulb } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { UserData } from "../type"
import FloatingDots from "@/components/flotingdots"
import { Card } from "@/components/ui/card"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"

export default function ProfileDetailPage() {
    const [userData, setUserData] = useState<UserData | null>(null)
    const [notificationCount, setNotificationCount] = useState(3)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [sendingRequest, setSendingRequest] = useState<boolean>(false)
    const [requestSent, setRequestSent] = useState<boolean>(false)
    const [unfriending, setUnfriending] = useState<boolean>(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [showSuggestionsPopup, setShowSuggestionsPopup] = useState(false)
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
    const friendType = searchParams.get("type");

    const defaultBadges = ["Cine Seed", "Newcomer", "Suggesto Starter", "Fresh Reeler"];
    const fallbackBadge = defaultBadges[(userData?.user_id ?? 0) % defaultBadges.length] || defaultBadges[0];
    const badgeToDisplay = userData?.badge || fallbackBadge;

    const handleSuggestionsClick = () => {
        setShowSuggestionsPopup(true)
    }

    const closeSuggestionsPopup = () => {
        setShowSuggestionsPopup(false)
    }

    useEffect(() => {
        const profileId = searchParams.get("profile_id");
        const userId = Cookies.get("userID");

        if (profileId) {
            fetch(`https://suggesto.xyz/App/api.php?gofor=profiledetail&user_id=${userId}&profile_id=${profileId}`)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data: UserData) => {
                    setUserData(data);
                    setError(null);
                })
                .catch((err) => {
                    console.error("Failed to fetch user data:", err);
                    setError("Failed to load user profile");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setError("User ID not provided");
            setLoading(false);
        }
    }, [searchParams]);

    const handleSendFriendRequest = async () => {
        const senderId = Cookies.get("userID");
        const receiverId = userData?.user_id;

        if (!senderId || !receiverId) {
            alert("Unable to send friend request. Please try again.");
            return;
        }

        setSendingRequest(true);

        try {
            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gofor: "sendrequest",
                    sender_id: senderId,
                    receiver_id: receiverId.toString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setRequestSent(true);

        } catch (error) {
            console.error("Failed to send friend request:", error);
            alert("Failed to send friend request. Please try again.");
        } finally {
            setSendingRequest(false);
        }
    }

    const handleUnfriend = async () => {
        const senderId = Cookies.get("userID");
        const receiverId = userData?.user_id;

        if (!senderId || !receiverId) {
            alert("Unable to unfriend. Please try again.");
            return;
        }

        setUnfriending(true);

        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=unfriend&sender_id=${senderId}&receiver_id=${receiverId}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success || result.status === 'success') {
                // Update the user data to reflect unfriend status
                setUserData(prev => prev ? { ...prev, is_friend: false } : null);
                alert("Successfully unfriended!");
            } else {
                throw new Error(result.message || "Failed to unfriend");
            }

        } catch (error) {
            console.error("Failed to unfriend:", error);
            alert("Failed to unfriend. Please try again.");
        } finally {
            setUnfriending(false);
        }
    }

    const handleAcceptRequest = async (friendId: number) => {
        const userId = Cookies.get("userID")
        if (!userId) return

        setActionLoading(friendId)
        try {
            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "acceptrequest",
                    sender_id: friendId.toString(),
                    receiver_id: userId,
                }),
            })

            const result = await response.json()
            if (result.status === "Friend Request Accepted" || response.ok) {
                // Update user data to reflect accepted status
                setUserData(prev => prev ? { ...prev, is_friend: true } : null);
                alert("Friend request accepted!");
            } else {
                console.error("Failed to accept request")
                alert("Failed to accept request. Please try again.");
            }
        } catch (error) {
            console.error("Error accepting request:", error)
            alert("Failed to accept request. Please try again.");
        } finally {
            setActionLoading(null)
        }
    }

    const handleRejectRequest = async (friendId: number) => {
        const userId = Cookies.get("userID")
        if (!userId) return

        setActionLoading(friendId)
        try {
            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "rejectrequest",
                    sender_id: friendId.toString(),
                    receiver_id: userId,
                }),
            })

            const result = await response.json()
            if (result.status === "Friend Request Rejected" || response.ok) {
                alert("Friend request rejected.");
                router.back();
            } else {
                console.error("Failed to reject request")
                alert("Failed to reject request. Please try again.");
            }
        } catch (error) {
            console.error("Error rejecting request:", error)
            alert("Failed to reject request. Please try again.");
        } finally {
            setActionLoading(null)
        }
    }

    const handleSendRequestSuggested = async (friendId: number) => {
        const userId = Cookies.get("userID")
        if (!userId) {
            console.error("No user ID found in cookies")
            return
        }

        setActionLoading(friendId)
        try {
            const requestBody = {
                gofor: "sendrequest",
                sender_id: userId,
                receiver_id: friendId.toString(),
            }

            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            const result = await response.json()

            if (result.status === "Friend Request Sent!" || response.ok) {
                setRequestSent(true);
                alert("Friend request sent successfully!");
            } else {
                console.error("Failed to send request - API response:", result)
                alert("Failed to send request. Please try again.");
            }
        } catch (error) {
            console.error("Error sending request:", error)
            alert("Failed to send request. Please try again.");
        } finally {
            setActionLoading(null)
        }
    }

    const renderActionButtons = () => {
        if (loading) return null;

        // For friend requests - show Accept/Reject buttons
        if (friendType === "requests") {
            return (
                <div className="flex gap-3 mt-6">
                    <Button
                        onClick={() => handleAcceptRequest(userData?.user_id || 0)}
                        disabled={actionLoading === userData?.user_id}
                        className="flex-1 bg-[#292938] rounded-2xl py-2 border-1 border-green-600  text-lg font-bold text-green-600 flex items-center justify-center gap-3 "
                    >
                        <Users className="h-6 w-6" />
                        {actionLoading === userData?.user_id ? "Accepting..." : "Accept"}
                    </Button>
                    <Button
                        onClick={() => handleRejectRequest(userData?.user_id || 0)}
                        disabled={actionLoading === userData?.user_id}
                        className="flex-1 bg-[#292938] rounded-2xl py-2 border-1 border-red-600  text-lg font-bold text-red-600  flex items-center justify-center gap-3 "
                    >
                        <Users className="h-6 w-6" />
                        {actionLoading === userData?.user_id ? "Rejecting..." : "Reject"}
                    </Button>
                </div>
            );
        }

        // For suggested friends - show Add button
        if (friendType === "suggested") {
            return (
                <Button
                    onClick={() => handleSendRequestSuggested(userData?.user_id || 0)}
                    disabled={actionLoading === userData?.user_id || requestSent}
                    className="mt-6 w-full rounded-2xl p-4 text-lg font-bold text-white flex items-center justify-center gap-3 shadow-2xl border border-[#6c5ce7]/20 backdrop-blur-sm transition-all duration-300 "
                >
                    <Users className="h-6 w-6" />
                    {actionLoading === userData?.user_id
                        ? "Sending..."
                        : requestSent
                            ? "Request Sent"
                            : "Add Friend"}
                </Button>
            );
        }

        // Default behavior for existing friends or regular profile view
        if (userData?.is_friend) {
            return (
                <div className="flex flex-col items-center">
                    <Button
                        onClick={handleUnfriend}
                        variant="outline"
                        disabled={unfriending}
                        className="mt-6  rounded-2xl px-4 text-lg font-bold text-red-500 border-red-500  flex items-center justify-center gap-3 shadow-2xl backdrop-blur-sm transition-all duration-300"
                    >
                        <Users className="h-6 w-6" />
                        {unfriending ? "Unfriending..." : "Unfriend"}
                    </Button>
                </div>
            );
        }

        // Default send friend request button
        return (
            <button
                onClick={handleSendFriendRequest}
                disabled={sendingRequest || requestSent}
                className="mt-6 w-full bg-gradient-to-r from-[#6c5ce7] to-[#5a4bd6] hover:from-[#5a4bd6] hover:to-[#4c42c7] rounded-2xl p-4 text-lg font-bold text-white flex items-center justify-center gap-3 shadow-2xl border border-[#6c5ce7]/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <Users className="h-6 w-6" />
                {sendingRequest
                    ? "Sending Request..."
                    : requestSent
                        ? "Friend Request Sent"
                        : "Send Friend Request"}
            </button>
        );
    };


    const handleBack = () => {
        router.back()
    }

    const handleNotifications = () => {
        router.push("/notifications")
    }

    const handleViewProfile = (profileId: number) => {
        router.push(`/friends/friend-profile-detail?profile_id=${profileId}`)
    }

    if (error) {
        return (
            <div className="bg-[#181826] min-h-screen text-white flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="text-red-400 text-lg mb-4">{error}</div>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-[#6c5ce7] hover:bg-[#5a4bd6] rounded-xl text-white font-semibold transition-all duration-300 shadow-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (

        // <PageTransitionWrapper>
            <div className=" min-h-screen text-white">
                {/* Header with ProfilePage styling */}
                <div className="relative bg-primary backdrop-blur-sm border border-[#6c5ce7]/20 rounded-b-4xl pb-4">
                    <header className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <button onClick={handleBack} className="p-2.5" aria-label="Go back">
                                <ArrowLeft size={20} className="text-white" />
                            </button>
                            <h1 className="text-xl font-bold">
                                {loading ? "Profile" : userData?.name || "Profile"}
                            </h1>
                        </div>
                        {/* <div className="flex items-center gap-3">
                            <button onClick={handleNotifications} className="relative p-2.5" aria-label="Notifications">
                                <Bell className="w-5 h-5 text-white" />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-white text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                        </div> */}
                    </header>

                    {/* Profile Card with ProfilePage styling */}
                    <div className="px-4 pb-8">
                        <div className="mt-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                                <div className="relative flex flex-col items-center">
                                    <div className="flex items-center justify-center mb-3 ">
                                        <div className="relative w-40 h-40">
                                            {/* Floating Dots */}
                                            <FloatingDots />

                                            {/* Black background circle */}
                                            <div className="absolute inset-0 rounded-full bg-black shadow-xl z-10" />

                                            {/* Neon gradient ring */}
                                            <svg className="absolute inset-0 w-full h-full z-20" viewBox="0 0 100 100">
                                                <defs>
                                                    <linearGradient id="gradRing" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#ff00f7" />
                                                        <stop offset="50%" stopColor="#a85aff" />
                                                        <stop offset="100%" stopColor="#00e0ff" />
                                                    </linearGradient>
                                                </defs>
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke="url(#gradRing)"
                                                    strokeWidth="4"
                                                    strokeDasharray="282.6"
                                                    strokeDashoffset="56.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>

                                            {/* Profile Image */}
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full overflow-hidden border-4 border-black shadow-lg z-30">
                                                {loading ? (
                                                    <div className="w-full h-full bg-[#6c5ce7]/20 animate-pulse" />
                                                ) : (
                                                    <img
                                                        src={userData?.imgname || "/api/placeholder/128/128"}
                                                        alt="Profile"
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h2 className="font-bold text-2xl text-white mb-2">{userData?.name}</h2>
                                        <div className="inline-flex items-center gap-2  mb-2 text-sm bg-black/20 text-white px-3 py-1 rounded-full">
                                            {/* <Phone className="w-4 h-4" /> */}
                                            <span>{userData?.mobilenumber}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info Section with ProfilePage styling */}
                                <div className="flex-1 mt-4">
                                    {loading ? (
                                        <div className="flex items-center justify-between gap-6 text-center">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className="space-y-1">
                                                    <div className="h-7 w-10 bg-white/20 animate-pulse rounded-lg mx-auto" />
                                                    <div className="h-4 w-10 bg-white/20 animate-pulse rounded-md mx-auto" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-10 text-white/80 text-sm text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <VenusAndMars className="w-10 h-10 text-white/80" />
                                                <span className="font-semibold  text-sm text-white">{userData?.gender}</span>
                                            </div>

                                            <div className="flex flex-col items-center gap-3">
                                                <CalendarDays className="w-10 h-10 text-white/80" />
                                                <span className="font-semibold  text-sm text-white">
                                                    {new Date(userData?.dob ?? "").toLocaleDateString("en-GB", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex flex-col items-center gap-3">
                                                <Globe className="w-10 h-10 text-white/80" />
                                                <span className="font-semibold  text-sm text-white">{userData?.location}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {/* Stats Cards with ProfilePage styling */}
                            <div className="grid grid-cols-3 gap-4  z-50">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="h-28 bg-[#6c5ce7]/20 animate-pulse rounded-2xl" />
                                    ))
                                ) : (
                                    <>
                                        <div className="bg-[#181826] backdrop-blur-sm border-1 border-[#6c5ce7]/80 rounded-2xl p-4 text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center">
                                            <Bookmark className="text-[#6c5ce7] mb-2" size={28} />
                                            <div className="text-sm text-white/80 font-medium">Movies Matched</div>
                                            <div className="text-2xl font-bold text-[#6c5ce7]">{(userData?.common_watchlist_count || 0).toString().padStart(2, '0')}</div>
                                        </div>

                                        <div className="bg-[#181826] backdrop-blur-sm border-1 border-[#6c5ce7]/80 rounded-2xl p-4 text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center">

                                            <Eye className="text-[#6c5ce7] mb-2" size={28} />
                                            <div className="text-sm text-white/80 font-medium">Common Interests</div>
                                            <div className="text-2xl font-bold text-[#6c5ce7]">{(userData?.common_interests_count || 0).toString().padStart(2, '0')}</div>
                                        </div>

                                        <div className="bg-[#181826] backdrop-blur-sm border-1 border-[#6c5ce7]/80 rounded-2xl p-4 text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center">

                                            <Users className="text-[#6c5ce7] mb-2" size={28} />
                                            <div className="text-sm text-white/80 font-medium">Mutual Friends</div>
                                            <div className="text-2xl font-bold text-[#6c5ce7]">{(userData?.mutual_friends_count || 0).toString().padStart(2, '0')}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Badge with ProfilePage styling */}
                    <div className="absolute bottom-[-24px] left-1/2 transform -translate-x-1/2 bg-white backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center justify-center gap-3 border border-white/30 shadow-lg">
                        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                            <Crown className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-primary font-bold text-sm">{badgeToDisplay}</span>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto p-4 text-center mt-10">
                    <p className="text-xl font-bold">You & {userData?.name}</p>
                </div>

                <div className="p-4 ">
                    {/* Compatibility Section */}
                    {!loading && userData?.commonality_percent !== undefined && (
                        <div className=" mb-10 p-4 bg-gradient-to-br from-[#6c5ce7]/15 to-[#6c5ce7]/5 backdrop-blur-sm border border-[#6c5ce7]/20 rounded-4xl shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Crown className="w-7 h-7 text-white bg-primary border-1 border-white p-1 rounded-full" />
                                Compatibility
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-[#292938] rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-[#6c5ce7] to-[#5a4bd6] h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${userData.commonality_percent}%` }}
                                    />
                                </div>
                                <span className="text-[#6c5ce7] font-bold text-lg">{userData.commonality_percent}%</span>
                            </div>
                        </div>
                    )}

                    {/* Common Languages with ProfilePage styling */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Languages className="w-5 h-5 text-[#6c5ce7]" />
                            Common Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="h-8 w-20 bg-[#6c5ce7]/20 animate-pulse rounded-full" />
                                ))
                            ) : userData?.common_languages && userData.common_languages.length > 0 ? (
                                userData.common_languages.map((language, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-[#6c5ce7]/20 backdrop-blur-sm border border-[#6c5ce7]/30 rounded-full text-sm font-medium text-white hover:bg-[#6c5ce7]/30 transition-all duration-300"
                                    >
                                        {language}
                                    </span>
                                ))
                            ) : (
                                <span className="px-4 py-2 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full text-sm font-medium text-white/60">
                                    No common languages
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Common Interests with ProfilePage styling */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Drama className="w-5 h-5 text-[#6c5ce7]" />
                            Common Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="h-8 w-20 bg-[#6c5ce7]/20 animate-pulse rounded-full" />
                                ))
                            ) : userData?.common_interests && userData.common_interests.length > 0 ? (
                                <>
                                    {userData.common_interests.slice(0, 4).map((interest, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-[#6c5ce7]/20 backdrop-blur-sm border border-[#6c5ce7]/30 rounded-full text-sm font-medium text-white hover:bg-[#6c5ce7]/30 transition-all duration-300"
                                        >
                                            {interest}
                                        </span>
                                    ))}
                                    {userData.common_interests.length > 4 && (
                                        <span className="px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#5a4bd6] rounded-full text-sm font-medium text-white shadow-lg">
                                            +{userData.common_interests.length - 4} more
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="px-4 py-2 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full text-sm font-medium text-white/60">
                                    No common interests
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8 mb-10">
                        {/* Suggestions */}
                        <Card
                            onClick={handleSuggestionsClick}
                            className="rounded-3xl bg-gradient-to-br from-[#6c5ce7] to-[#4834d4] text-white border-0 shadow-xl flex flex-col justify-between transition-transform hover:scale-105 duration-200 group cursor-pointer">
                            <div className="text-center">
                                <Clapperboard className="w-10 h-10 mx-auto mb-3 text-white/80" strokeWidth={2.5} />
                                <div className="font-bold text-lg">Suggestions</div>
                                <div className="text-sm text-white/80">by {userData?.name}</div>
                                <div className="mt-2 flex justify-center items-center">
                                    <ArrowRight className="bg-white text-[#6c5ce7] rounded-full p-1 w-7 h-7 shadow-md transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Card>

                        {/* Top 10 Movie Wall */}
                        <Card
                            onClick={() => router.push(`/movie-top-wall?friend_id=${userData?.user_id}`)}
                            className="rounded-3xl bg-gradient-to-br from-[#a29bfe] to-[#6c5ce7] text-white border-0 shadow-xl flex flex-col justify-between transition-transform hover:scale-105 duration-200 group">
                            <div className="text-center">
                                <Trophy className="w-10 h-10 mx-auto mb-3 text-white/80" strokeWidth={2.5} />
                                <div className="font-bold text-lg">Top 10</div>
                                <div className="text-sm text-white/80">Movie Wall </div>
                                <div className="mt-2 flex justify-center items-center">
                                    <ArrowRight className="bg-white text-[#6c5ce7] rounded-full p-1 w-7 h-7 shadow-md transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Mutual Friends Section */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#6c5ce7]" />
                            Mutual Friends
                        </h3>
                        {loading ? (
                            <div className="flex gap-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="w-16 h-16 bg-[#6c5ce7]/20 rounded-full animate-pulse" />
                                ))}
                            </div>
                        ) : userData?.mutual_friends_count && userData.mutual_friends_count > 0 ? (
                            <div
                                onClick={() => handleViewProfile(userData.mutual_friends[0]?.user_id)}
                                className="flex items-center gap-4 overflow-x-auto pb-2">
                                {(userData.mutual_friends || []).slice(0, 4).map((friend: any, index: number) => (
                                    <div key={index} className="text-center min-w-16">
                                        <img
                                            src={friend.profile_pic?.replace(/\\/g, "") || "/api/placeholder/64/64"}
                                            alt={friend.name || "Friend"}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-[#6c5ce7]/40 shadow"
                                        />
                                        {friend.name && (
                                            <div className="text-xs text-white/80 mt-1 truncate w-16">
                                                {friend.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                        ) : (
                            <div className="text-center mt-4">
                                <div className="text-white/60 text-sm mb-2">
                                    No mutual friends yet.
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Send Friend Request Button */}
                    {renderActionButtons()}

                </div>

                {/* Suggestions Popup */}
                {showSuggestionsPopup && (
                    <div className="fixed inset-0  backdrop-blur-sm z-50 flex items-center justify-center ">
                        <div className="bg-[#181826] p-1 rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden border border-[#6c5ce7]/20">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-[#6c5ce7]/20">
                                <h2 className="text-xl font-bold text-white">Suggestions</h2>
                                <button
                                    onClick={closeSuggestionsPopup}
                                    className="p-2 hover:bg-[#6c5ce7]/20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex ">
                                <button
                                    onClick={() => setActiveTab('received')}
                                    className={`px-4 py-2 w-full rounded-full text-sm font-medium transition-colors
                                     ${activeTab === "received" ? "bg-primary text-white" : " text-white"
                                        }`}
                                >
                                    Received
                                </button>
                                <button
                                    onClick={() => setActiveTab('sent')}
                                    className={`px-4 py-2 w-full rounded-full text-sm font-medium transition-colors 
                                           ${activeTab === "sent" ? "bg-primary text-white" : " text-white"
                                        }`}
                                >
                                    Sent
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 overflow-y-auto max-h-[50vh]">
                                {activeTab === 'received' ? (
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                        {userData && (userData as any).suggested_to_you ? (
                                            // Handle single object case
                                            (() => {
                                                const movie = (userData as any).suggested_to_you;
                                                return (
                                                    <div
                                                        key={movie.movie_id}
                                                        className="relative min-w-[120px] h-[180px] rounded-lg border-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => router.push(`/movie-detail-page?movie_id=${movie.movie_id}`)}
                                                    >
                                                        <img
                                                            src={`https://suggesto.xyz/App/${movie.poster}`}
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                        <div className="absolute bottom-2 left-2">
                                                            <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="text-white/60 text-center w-full py-8">
                                                <Inbox className="mx-auto mb-2 w-8 h-8 text-white/70" />
                                                No suggestions received
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                        {userData && (userData as any).suggested_from_you ? (
                                            // Handle single object case
                                            (() => {
                                                const movie = (userData as any).suggested_from_you;
                                                return (
                                                    <div
                                                        key={movie.movie_id}
                                                        className="relative min-w-[120px] h-[180px] rounded-lg border-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => router.push(`/movie-detail-page?movie_id=${movie.movie_id}`)}
                                                    >
                                                        <img
                                                            src={`https://suggesto.xyz/App/${movie.poster}`}
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                        <div className="absolute bottom-2 left-2">
                                                            <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="text-white/60 text-center w-full py-8">
                                                <Lightbulb className="mx-auto mb-3 w-8 h-8 text-white/70" />
                                                No suggestions sent
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        // </PageTransitionWrapper>

    )
}