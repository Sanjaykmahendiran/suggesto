"use client"

import { Bell, ArrowLeft, Users, Crown, Trophy, ArrowRight, Languages, Drama, Clapperboard, X, Inbox, Lightbulb, MonitorPlay, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { UserData } from "../type"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"
import toast from 'react-hot-toast';
import { motion } from "framer-motion"
import Image from "next/image";
import BackgroundImage from "@/assets/profile-banner.jpg"
import genderIcon from "@/assets/male.png";
import dobIcon from "@/assets/birthday.png";
import locationIcon from "@/assets/location1.png";
import { useUser } from "@/contexts/UserContext"
import Bookmark from "@/assets/bookmark.png";
import Eye from "@/assets/eye.png";
import User from "@/assets/users.png";
import DefaultImage from "@/assets/default-user.webp"
import CoinAnimation from "@/components/coin-animation"

export default function ProfileDetailPage() {
    const { user, setUser } = useUser()
    const [userData, setUserData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [sendingRequest, setSendingRequest] = useState<boolean>(false)
    const [requestSent, setRequestSent] = useState<boolean>(false)
    const [unfriending, setUnfriending] = useState<boolean>(false)
    const router = useRouter()
    const [isAccepted, setIsAccepted] = useState(false);
    const searchParams = useSearchParams()
    const friendType = searchParams.get("type");
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [showSuggestionsPopup, setShowSuggestionsPopup] = useState(false)
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
    const [acceptLoading, setAcceptLoading] = useState<boolean>(false)
    const [rejectLoading, setRejectLoading] = useState<boolean>(false)
    const [showCoinAnimation, setShowCoinAnimation] = useState(false)
    const [coinsEarned, setCoinsEarned] = useState(0)

    const defaultBadges = ["Cine Seed", "Newcomer", "Suggesto Starter", "Fresh Reeler"];
    const fallbackBadge = defaultBadges[(userData?.user_id ?? 0) % defaultBadges.length] || defaultBadges[0];
    const badgeToDisplay = userData?.badge || fallbackBadge;

    const handleSuggestionsClick = () => {
        setShowSuggestionsPopup(true)
    }

    const closeSuggestionsPopup = () => {
        setShowSuggestionsPopup(false)
    }

    // Move fetchUserProfile to component scope so it can be used elsewhere
    const fetchUserProfile = () => {
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
                })
                .catch((err) => {
                    console.error("Failed to fetch user data:", err);
                    toast.error("Failed to load user profile");
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            toast.error("User ID not provided");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [searchParams]);



    const handleSendFriendRequest = async () => {
        const senderId = Cookies.get("userID");
        const receiverId = userData?.user_id;

        if (!senderId || !receiverId) {
            toast.error("Unable to send friend request. Please try again.");
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
            toast.error("Failed to send friend request. Please try again.");
        } finally {
            setSendingRequest(false);
        }
    }

    const handleUnfriend = async () => {
        const senderId = Cookies.get("userID");
        const receiverId = userData?.user_id;

        if (!senderId || !receiverId) {
            toast.error("Unable to unfriend. Please try again.");
            return;
        }

        setUnfriending(true);

        try {

            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "unfriend",
                    friend_id: receiverId,
                    user_id: senderId,
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'Friend Removed Successfully') {
                toast.success("Successfully unfriended!");
                router.back()
            } else {
                throw new Error(result.message || "Failed to unfriend");
            }

        } catch (error) {
            console.error("Failed to unfriend:", error);
            toast.error("Failed to unfriend. Please try again.");
        } finally {
            setUnfriending(false);
        }
    }

    const handleAcceptRequest = async (friendId: number) => {
        const userId = Cookies.get("userID");
        if (!userId) return;

        setAcceptLoading(true);
        try {
            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "acceptrequest",
                    friend_id: friendId.toString(),
                    user_id: userId,
                }),
            });

            const result = await response.json();
            if (result.coins_earned) {
                setCoinsEarned(result.coins_earned)
                setShowCoinAnimation(true)
            }

            if (result.status === "Friend Request Accepted" || response.ok) {
                toast.success("Friend request accepted!");
                setIsAccepted(true); // <-- update state
                // Optional: router.refresh(); // if you want full re-render
            } else {
                console.error("Failed to accept request");
                toast.error("Failed to accept request. Please try again.");
            }
        } catch (error) {
            console.error("Error accepting request:", error);
            toast.error("Failed to accept request. Please try again.");
        } finally {
            setAcceptLoading(false);
        }
    };


    // Update handleRejectRequest function
    const handleRejectRequest = async (friendId: number) => {
        const userId = Cookies.get("userID")
        if (!userId) return

        setRejectLoading(true)
        try {
            const response = await fetch("https://suggesto.xyz/App/api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gofor: "rejectrequest",
                    friend_id: friendId.toString(),
                    user_id: userId,
                }),
            })

            const result = await response.json()
            if (result.status === "Friend Request Rejected" || response.ok) {
                toast.success("Friend request rejected.");
                router.back();
            } else {
                console.error("Failed to reject request")
                toast.error("Failed to reject request. Please try again.");
            }
        } catch (error) {
            console.error("Error rejecting request:", error)
            toast.error("Failed to reject request. Please try again.");
        } finally {
            setRejectLoading(false)
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
                toast.success("Friend request sent successfully!");
            } else {
                console.error("Failed to send request - API response:", result)
                toast.error("Failed to send request. Please try again.");
            }
        } catch (error) {
            console.error("Error sending request:", error)
            toast.error("Failed to send request. Please try again.");
        } finally {
            setActionLoading(null)
        }
    }

    const renderActionButtons = () => {
        if (loading) return null;

        // For friend requests - show Accept/Reject buttons
        if (friendType === "requests") {
            if (isAccepted) {
                return (
                    <div className="text-green-500 text-center font-bold text-lg">Accepted</div>
                );
            }

            return (
                <div className="flex gap-3">
                    <Button
                        onClick={() => handleAcceptRequest(userData?.user_id || 0)}
                        disabled={acceptLoading}
                        className="flex-1 bg-[#2b2b2b] rounded-2xl py-2 border border-green-600 text-lg font-bold text-green-600 flex items-center justify-center gap-3 shadow-[0_4px_10px_rgba(34,197,94,0.4)] hover:shadow-[0_6px_14px_rgba(34,197,94,0.5)] transition-shadow"
                    >
                        <Users className="h-6 w-6" />
                        {acceptLoading ? "Accepting..." : "Accept"}
                    </Button>

                    <Button
                        onClick={() => handleRejectRequest(userData?.user_id || 0)}
                        disabled={rejectLoading}
                        className="flex-1 bg-[#2b2b2b] rounded-2xl py-2 border border-red-600 text-lg font-bold text-red-600 flex items-center justify-center gap-3 shadow-[0_4px_10px_rgba(239,68,68,0.4)] hover:shadow-[0_6px_14px_rgba(239,68,68,0.5)] transition-shadow"
                    >
                        <Users className="h-6 w-6" />
                        {rejectLoading ? "Rejecting..." : "Reject"}
                    </Button>

                </div>
            );
        }

        // For suggested friends - show Add button
        if (friendType === "suggested") {
            const isSending = actionLoading === userData?.user_id;

            return (
                <button
                    onClick={() => handleSendRequestSuggested(userData?.user_id || 0)}
                    disabled={isSending || requestSent}
                    className="flex py-2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-2xl p-4 text-lg font-bold text-white flex items-center justify-center gap-3 shadow-2xl border border-[#2b2b2b]/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Users className="h-6 w-6" />
                    {isSending
                        ? "Sending..."
                        : requestSent
                            ? "Request Sent"
                            : "Add Friend"}
                </button>
            );
        }

        // For existing friends - show Unfriend button
        if (userData?.is_friend) {
            return (
                <Button
                    onClick={handleUnfriend}
                    variant="outline"
                    disabled={unfriending}
                    className="rounded-2xl py-2 text-lg font-bold text-red-500 border-red-500 flex items-center justify-center gap-3 shadow-2xl backdrop-blur-sm transition-all duration-300"
                >
                    <Users className="h-6 w-6" />
                    {unfriending ? "Unfriending..." : "Unfriend"}
                </Button>
            );
        }

        // Default send friend request button
        return userData?.is_pending ? (
            <button
                disabled
                className="flex py-2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-2xl p-4 text-lg font-bold text-white flex items-center justify-center gap-3 shadow-2xl border border-[#2b2b2b]/20 backdrop-blur-sm opacity-50 cursor-not-allowed"
            >
                <Users className="h-6 w-6" />
                Friend Request Sent
            </button>
        ) : (
            <button
                onClick={handleSendFriendRequest}
                disabled={sendingRequest || requestSent}
                className="flex py-2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-2xl p-4 text-lg font-bold text-white flex items-center justify-center gap-3 shadow-2xl border border-[#2b2b2b]/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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


    const handleNotifications = () => router.push("/notifications")
    const handleBack = () => { router.back() }
    const handleViewProfile = (profileId: number) => { router.push(`/friends/friend-profile-detail?profile_id=${profileId}`) }

    return (

        // <PageTransitionWrapper>
        <div className=" min-h-screen text-white">
            {/* Header with ProfilePage styling */}

            <div className="relative h-100">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={BackgroundImage}
                        alt="Profile Background"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Content Container with relative positioning */}
                <div className="relative z-20">
                    {/* Header */}
                    <header className="flex items-center justify-between pt-8 px-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-start gap-3">
                                <button onClick={handleBack} className="p-2.5" aria-label="Go back">
                                    <ArrowLeft size={20} className="text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-0">
                            <button
                                onClick={handleNotifications}
                                className="relative p-2.5"
                                aria-label="Notifications"
                            >
                                <Bell
                                    className={`w-5 h-5 text-white ${(user?.not_count ?? 0) > 0 ? "shake" : ""}`}
                                />
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                                    {user?.not_count}
                                </span>
                            </button>
                        </div>
                    </header>


                    {/* Profile Header */}
                    <div className="flex items-center space-x-4 p-4 px-8 rounded-lg mt-2">
                        {/* Profile Image */}
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                            {loading ? (
                                <div className="w-full h-full bg-[#b56bbc]/20 animate-pulse" />
                            ) : (
                                <img
                                    src={userData?.imgname || "/api/placeholder/128/128"}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>

                        {/* Name & Info */}
                        <div>
                            <h2 className="text-white font-semibold text-lg drop-shadow-lg">{userData?.name}</h2>
                            <p className="text-gray-300 text-sm drop-shadow-lg">{userData?.mobilenumber}</p>
                        </div>
                    </div>

                    {/* Info Box with Gender, DOB, Location */}
                    <div className="relative mt-6 mx-4 rounded-3xl border-2 border-primary bg-transparent">
                        <div className="rounded-3xl bg-transparent p-6 py-10">
                            <div className="flex justify-between text-white text-sm font-medium">
                                <div className="flex flex-col items-center flex-1">
                                    <Image src={genderIcon} alt="Gender" className="w-12 h-12" />
                                    <span className="mt-2">{userData?.gender}</span>
                                </div>
                                <div className="flex flex-col items-center flex-1">
                                    <Image src={dobIcon} alt="DOB" className="w-12 h-12" />
                                    <span className="mt-2"> {new Date(userData?.dob ?? "").toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}</span>
                                </div>
                                <div className="flex flex-col items-center flex-1">
                                    <Image src={locationIcon} alt="Location" className="w-12 h-12" />
                                    <span className="mt-2">{userData?.location}</span>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute left-1/2 -bottom-5 transform -translate-x-1/2 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] p-[1px] rounded-full">
                                <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-xl flex items-center justify-center">
                                        <Crown className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] font-bold text-sm">
                                        {badgeToDisplay}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>


            {/* Stats Section */}
            <div className="mt-12 flex  gap-4 px-4 overflow-x-auto no-scrollbar">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-28 bg-[#2b2b2b]/20 animate-pulse rounded-2xl" />
                    ))
                ) : (
                    <>
                        <div className="bg-[#2b2b2b]  rounded-[80px] px-2 py-3 gap-3  text-center shadow-lg hover:scale-105 transition-all duration-300 flex  items-center justify-center">
                            <div className="p-3 rounded-full bg-white w-12 h-12">
                                <Image src={Bookmark} alt="Bookmark" width={48} height={48} />
                            </div>
                            <div className="text-2xl font-semibold text-white">{(userData?.watchlist_count || 0).toString().padStart(2, '0')}</div>
                            <div className="text-sm text-white font-medium mr-2">Watchlisted</div>
                        </div>

                        <div className="bg-[#2b2b2b]   rounded-[80px] px-2 py-3 gap-3 text-center shadow-lg hover:scale-105 transition-all duration-300 flex  items-center justify-center">
                            <div className="p-3 rounded-full bg-white w-12 h-12">
                                <Image src={Eye} alt="Watched" width={48} height={48} />
                            </div>
                            <div className="text-2xl font-semibold text-white">{(userData?.watched_count || 0).toString().padStart(2, '0')}</div>
                            <div className="text-sm text-white font-medium mr-2">Watched</div>
                        </div>

                        <div className="bg-[#2b2b2b]  rounded-[80px] px-2 py-3 gap-3 text-center shadow-lg hover:scale-105 transition-all duration-300 flex  items-center justify-center">
                            <div className="p-3 rounded-full bg-white w-12 h-12">
                                <Image src={User} alt="Suggested" width={60} height={60} />
                            </div>
                            <div className="text-2xl font-semibold text-white">{(userData?.mutual_friends_count || 0).toString().padStart(2, '0')}</div>
                            <div className="text-sm text-white font-medium mr-2">Friends</div>
                        </div>
                    </>
                )}
            </div>



            <div className="mx-auto p-4">
                {/* Languages */}
                <div className=" mb-8 mt-10">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                            <Languages className="text-xl  text-[#b56bbc]" />
                            Favorite Languages
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="h-8 w-20 bg-[#2b2b2b] animate-pulse rounded-full" />
                            ))
                        ) : userData?.user_languages && userData.user_languages.length > 0 ? (
                            userData.user_languages.map((language: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-[#2b2b2b]  rounded-full text-sm font-medium text-white"
                                >
                                    {language}
                                </span>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400">No Languages </p>
                        )}
                    </div>
                </div>

                {/* Genre Interests */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                            <Drama className="text-xl  text-[#b56bbc]" />
                            Favorite Genres
                        </h3>

                    </div>
                    <div className="flex flex-wrap gap-2">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-8 w-20 bg-[#2b2b2b] animate-pulse rounded-full" />
                            ))
                        ) : userData?.user_interests && userData.user_interests.length > 0 ? (
                            <>
                                {userData.user_interests.slice(0, 4).map((genre, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-[#2b2b2b]  rounded-full text-sm font-medium text-white"                                    >
                                        {genre}
                                    </span>
                                ))}
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">No Languages </p>
                        )}
                    </div>
                </div>

                {/* Friends */}
                {(loading || (userData?.friends_count && userData.friends_count > 0)) && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                                <Users className="text-xl text-[#b56bbc]" />
                                Friends
                            </h3>

                            <button
                                onClick={() => userData && router.push(`/friends?type=profiledetailfriends&friend_id=${userData.user_id}`)}
                                className="text-sm font-medium text-[#b56bbc] hover:underline"
                            >
                                See All
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex gap-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="w-16 h-16 bg-[#2b2b2b] rounded-full animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
                                {(userData?.friends || []).slice(0, 10).map((friend: any, index: number) => (
                                    <div
                                        key={index}
                                        onClick={() =>
                                            router.push(`/friends/friend-profile-detail?profile_id=${friend.user_id}`)
                                        }
                                        className="text-center min-w-16 cursor-pointer"
                                    >
                                        <img
                                            src={friend.image?.replace(/\\/g, "") || "/api/placeholder/64/64"}
                                            alt={friend.name || "Friend"}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-[#b56bbc]/40 shadow"
                                        />
                                        {friend.name && (
                                            <div className="text-xs text-white/80 mt-1 truncate w-16">
                                                {friend.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                <div className="grid grid-cols-2 gap-4 mt-8 mb-10">
                    {/* Suggestions */}
                    <div
                        onClick={handleSuggestionsClick}
                        className="flex items-center justify-between rounded-full px-5 py-3 bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] cursor-pointer shadow-md hover:scale-105 transition-transform duration-200"
                    >
                        <div className="flex items-center gap-2 text-white">
                            <Clapperboard className="w-5 h-5" />
                            <div>
                                <div className="text-sm font-semibold leading-none">Suggestions</div>
                                <div className="text-xs opacity-80 mt-1">by {userData?.name}</div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white bg-white/20 rounded-full p-1" />
                    </div>

                    {/* Top 10 Movie Wall */}
                    <div
                        onClick={() => router.push(`/top-10-wall?friend_id=${userData?.user_id}`)}
                        className="flex items-center justify-between rounded-full px-5 py-3 bg-white cursor-pointer shadow-md hover:scale-105 transition-transform duration-200"
                    >
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-primary" />
                            <div>
                                <div className="text-sm font-semibold leading-none text-primary">Top 10</div>
                                <div className="text-xs opacity-80 mt-1 text-black">Movie Wall</div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#7a71c4] bg-[#f2efff] rounded-full p-1" />
                    </div>
                </div>

            </div>


            <div className="p-4">
                <div className="bg-white rounded-[60px] p-0 text-white max-w-md mx-auto">
                    {/* You & Name */}
                    <div className="text-center">
                        <h2 className="text-2xl p-5 font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text">
                            You & {userData?.name}
                        </h2>
                    </div>

                    <div className="bg-[#1f1f21] p-4 mb-8 rounded-[50px]">
                        {/* Compatibility */}
                        {!loading && userData?.commonality_percent !== undefined && (
                            <div className="flex flex-col items-center mb-10">
                                {/* Heart-shaped compatibility display */}
                                <div className="relative mb-4">
                                    <svg width="120" height="120" viewBox="0 0 200 200" className="w-[150px] h-[150px]">
                                        <defs>
                                            {/* Gradient for the heart fill */}
                                            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#b56bbc" />
                                                <stop offset="100%" stopColor="#7a71c4" />
                                            </linearGradient>


                                            {/* Clip path for the filled portion with big wave animation */}
                                            <clipPath id="fillClip">
                                                <path d={`M0,${200 - (userData.commonality_percent * 200 / 100)} Q25,${200 - (userData.commonality_percent * 200 / 100) - 20} 50,${200 - (userData.commonality_percent * 200 / 100)} T100,${200 - (userData.commonality_percent * 200 / 100)} T150,${200 - (userData.commonality_percent * 200 / 100)} T200,${200 - (userData.commonality_percent * 200 / 100)} V200 H0 Z`}>
                                                    <animateTransform
                                                        attributeName="transform"
                                                        type="translate"
                                                        values="-50,0; 0,0; -50,0"
                                                        dur="4s"
                                                        repeatCount="indefinite"
                                                    />
                                                    <animate
                                                        attributeName="d"
                                                        values={`M0,${200 - (userData.commonality_percent * 200 / 100)} Q25,${200 - (userData.commonality_percent * 200 / 100) - 20} 50,${200 - (userData.commonality_percent * 200 / 100)} T100,${200 - (userData.commonality_percent * 200 / 100)} T150,${200 - (userData.commonality_percent * 200 / 100)} T200,${200 - (userData.commonality_percent * 200 / 100)} V200 H0 Z;
                                                                 M0,${200 - (userData.commonality_percent * 200 / 100)} Q25,${200 - (userData.commonality_percent * 200 / 100) + 25} 50,${200 - (userData.commonality_percent * 200 / 100)} T100,${200 - (userData.commonality_percent * 200 / 100)} T150,${200 - (userData.commonality_percent * 200 / 100)} T200,${200 - (userData.commonality_percent * 200 / 100)} V200 H0 Z;
                                                                 M0,${200 - (userData.commonality_percent * 200 / 100)} Q25,${200 - (userData.commonality_percent * 200 / 100) - 20} 50,${200 - (userData.commonality_percent * 200 / 100)} T100,${200 - (userData.commonality_percent * 200 / 100)} T150,${200 - (userData.commonality_percent * 200 / 100)} T200,${200 - (userData.commonality_percent * 200 / 100)} V200 H0 Z`}
                                                        dur="3s"
                                                        repeatCount="indefinite"
                                                    />
                                                </path>
                                            </clipPath>

                                            {/* Heart shape path */}
                                            <path id="heartPath" d="M100,180 C100,180 30,120 30,85 C30,65 45,50 65,50 C80,50 95,60 100,75 C105,60 120,50 135,50 C155,50 170,65 170,85 C170,120 100,180 100,180 Z" />
                                        </defs>

                                        {/* Background heart (dark) */}
                                        <use href="#heartPath" fill="#737373" />

                                        {/* Filled heart portion with gradient and wave animation */}
                                        <g clipPath="url(#fillClip)">
                                            <use href="#heartPath" fill="url(#heartGradient)" />
                                        </g>

                                        {/* White percentage text */}
                                        <text
                                            x="100"
                                            y="110"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fontFamily="Overpass, sans-serif"
                                            fontWeight="600"
                                            fontSize="35"
                                            fill="white"
                                        >
                                            {userData.commonality_percent}%
                                        </text>
                                    </svg>
                                </div>

                                <p className="text-white font-semibold text-lg tracking-wide">Compatibility</p>
                            </div>
                        )}


                        {/* Loading state */}
                        {loading && (
                            <div className="flex flex-col items-center mb-10">
                                <div className="relative mb-4">
                                    <Heart size={120} className="text-gray-600 fill-current " />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full "></div>
                                    </div>
                                </div>
                                <p className="text-gray-400 font-semibold text-lg">
                                    Calculating...
                                </p>
                            </div>
                        )}

                        {/* Common Languages */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                                <Languages className="text-xl text-[#b56bbc]" />
                                Common Languages
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <div key={index} className="h-8 w-20 bg-[#2b2b2b] animate-pulse rounded-full" />
                                    ))
                                ) : userData?.common_languages && userData.common_languages.length > 0 ? (
                                    userData.common_languages.map((language, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-1 bg-[#a06bff]/20 border border-[#a06bff]/30 rounded-full text-sm font-medium text-white"
                                        >
                                            {language}
                                        </span>
                                    ))
                                ) : (
                                    <span className="px-4 py-2 bg-gray-600/20 rounded-full text-sm font-medium text-white/60">
                                        No common languages
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Common Interests */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                                <Drama className="text-xl text-[#b56bbc]" />
                                Common Interests
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="h-8 w-20 bg-[#2b2b2b] animate-pulse rounded-full" />
                                    ))
                                ) : userData?.common_interests && userData.common_interests.length > 0 ? (
                                    <>
                                        {userData.common_interests.slice(0, 4).map((interest, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-1 bg-[#a06bff]/20 border border-[#a06bff]/30 rounded-full text-sm font-medium text-white"
                                            >
                                                {interest}
                                            </span>
                                        ))}
                                        {userData.common_interests.length > 4 && (
                                            <span className="px-4 py-1 bg-gradient-to-r from-[#a06bff] to-[#7a71c4] rounded-full text-sm font-medium text-white shadow-lg">
                                                +{userData.common_interests.length - 4} more
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="px-4 py-2 bg-gray-600/20 rounded-full text-sm font-medium text-white/60">
                                        No common interests
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Mutual Friends Section */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                                <Users className="text-xl text-[#b56bbc]" />
                                Mutual Friends
                            </h3>

                            {loading ? (
                                <div className="flex gap-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="w-16 h-16 bg-[#2b2b2b] rounded-full animate-pulse" />
                                    ))}
                                </div>
                            ) : userData?.mutual_friends_count && userData.mutual_friends_count > 0 ? (
                                <div
                                    onClick={() => handleViewProfile(userData.mutual_friends?.[0]?.user_id)}
                                    className="flex items-center gap-4 overflow-x-auto pb-2">
                                    {(userData.mutual_friends || []).slice(0, 4).map((friend: any, index: number) => (
                                        <div key={index} className="text-center min-w-16">
                                            <img
                                                src={friend.profile_pic?.replace(/\\/g, "") || DefaultImage}
                                                alt={friend.name || "Friend"}
                                                className="w-16 h-16 rounded-full object-cover border-2 border-[#2b2b2b]/40 shadow"
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

                                <div className="flex flex-col items-center  mt-4 ">
                                    <div className="flex flex-col items-center text-white/60 text-sm mb-2">
                                        <div className=" text-center mb-1">
                                            <Users className="w-10 h-10" />
                                        </div>
                                        <div>
                                            No mutual friends yet.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Watch & Match Better */}
                        {userData?.improve_your_match_by_watching && userData.improve_your_match_by_watching.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text mb-3 flex items-center gap-2">
                                    <MonitorPlay className="text-xl text-[#b56bbc]" />
                                    Watch & Match Better
                                </h3>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                    {userData.improve_your_match_by_watching.map((movie, index) => (
                                        <motion.div
                                            key={movie.movie_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ scale: 1.05 }}
                                            className="relative min-w-[100px] h-[150px] rounded-xl overflow-hidden shadow-md cursor-pointer"
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
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-18 flex items-center justify-center">
                    {/* Send Friend Request Button */}
                    {renderActionButtons()}
                </div>


            </div>

            {/* Suggestions Popup */}
            {showSuggestionsPopup && (
                <div className="fixed inset-0  backdrop-blur-sm z-50 flex items-center justify-center ">
                    <div className="bg-[#181826] p-1 rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden border border-[#2b2b2b]/20">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[#2b2b2b]/20">
                            <h2 className="text-xl font-bold text-white">Suggestions</h2>
                            <button
                                onClick={closeSuggestionsPopup}
                                className="p-2 hover:bg-[#2b2b2b]/20 rounded-full transition-colors"
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
                                    {userData && (userData as any).suggested_to_you?.length > 0 ? (
                                        (userData as any).suggested_to_you.map((movie: any) => (
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
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                <div className="absolute bottom-2 left-2">
                                                    <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-white/60 text-center w-full py-8">
                                            <Inbox className="mx-auto mb-2 w-8 h-8 text-white/70" />
                                            No suggestions received
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                    {userData && (userData as any).suggested_from_you?.length > 0 ? (
                                        (userData as any).suggested_from_you.map((movie: any) => (
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
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                <div className="absolute bottom-2 left-2">
                                                    <h3 className="text-sm font-medium text-white">{movie.title}</h3>
                                                </div>
                                            </div>
                                        ))
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

            <CoinAnimation
                show={showCoinAnimation}
                coinsEarned={coinsEarned}
                message="Coins Earned!"
                onAnimationEnd={() => setShowCoinAnimation(false)}
                duration={3000}
            />

        </div>
        // </PageTransitionWrapper>

    )
}