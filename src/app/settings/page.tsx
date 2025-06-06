"use client"

import {
    Bell, ChevronRight, LogOut,
    Settings, HelpCircle, Shield, Info,
    ArrowLeft, Contact, Globe, Music, Crown, Users,
    CreditCard, Star, Trash2, Film, Lock,
    Share2, X, AlertTriangle
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BottomNavigation } from "@/components/bottom-navigation"
import AvatarImg from "@/assets/avatar.jpg"
import Cookies from "js-cookie"
import MovieRequestDialog from "@/components/MovieRequestDialog"
import { motion } from "framer-motion"
import logo from "@/assets/suggesto-name-logo.png"
import { PageTransitionProvider, PageTransitionWrapper } from "@/components/PageTransition"


export default function ProfilePage() {
    const [isMovieDialogOpen, setIsMovieDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notificationCount, setNotificationCount] = useState(3)
    const [userData, setUserData] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const router = useRouter()

    useEffect(() => {
        const userId = Cookies.get("userID")

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

    const handleShare = () => {
        if (navigator.canShare?.()) {
            navigator.share({
                title: "Suggesto",
                text: "Check out Suggesto – your personalized movie and show recommendations!",
                url: "https://suggesto.top",
            }).catch((error) => console.error("Error sharing:", error));
        } else {
            alert("Sharing is not supported on this device.");
        }
    };

    const handleLogout = () => {
        Cookies.remove("userID");
        router.push("/auth/create-account");
    };

    const handleDeleteAccount = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteAccount = async () => {
        if (!userData?.mobilenumber) {
            alert("Unable to delete account: Mobile number not found");
            return;
        }

        setIsDeleting(true);
        
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=deleteuser&mobilenumber=${userData.mobilenumber}`);
            const result = await response.json();
            
            if (response.ok) {
                Cookies.remove("userID");
                router.push("/");
            } else {
                alert("Failed to delete account. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("An error occurred while deleting your account. Please try again.");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleRateApp = () => {
        if (typeof window !== 'undefined') {
            window.open('https://play.google.com/store/apps/details?id=com.yourapp.package', '_blank');
        }
    };


    // Show loading state with skeleton
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen text-white mb-18">
                {/* Header Skeleton */}
                <header className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <div className="mr-4 p-2 rounded-full bg-[#292938] w-10 h-10"></div>
                        <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                </header>

                {/* Profile Info Skeleton */}
                <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                            <div className="h-7 w-24 bg-gray-700 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-32 bg-gray-700 rounded animate-pulse mb-2"></div>
                            <div className="flex gap-4">
                                <div className="h-3 w-16 bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-3 w-20 bg-gray-700 rounded animate-pulse"></div>
                                <div className="h-3 w-18 bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Items Skeleton */}
                <main className="flex-1 px-6 py-4">
                    <div className="space-y-1">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between py-4 border-b border-gray-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 bg-gray-700 rounded-lg animate-pulse"></div>
                                    <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
                                </div>
                                <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>

                    {/* Share Button Skeleton */}
                    <div className="mt-8 w-full h-14 bg-gray-700 rounded-full animate-pulse"></div>
                </main>

                {/* Bottom Navigation */}
                <BottomNavigation currentPath="/profile" />
            </div>
        );
    }

    // Show error state if no user data and not loading
    if (!userData && !loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Failed to load user data</p>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (

//   <PageTransitionWrapper>
        <div className="flex flex-col min-h-screen text-white mb-18">
            {/* Header */}
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    <button className="mr-2 p-2 rounded-full bg-[#292938]" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-white">Settings</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/pro" className="border bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center">
                        <Crown className="w-5 h-5" />
                    </Link>
                    <button
                        aria-label="Notifications"
                        className="text-gray-300 relative"
                        onClick={() => router.push("/notifications")}
                    >
                        <Bell className="w-5 h-5" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {notificationCount}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* Profile Info */}
            <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-primary">
                        <Image
                            src={userData?.imgname || AvatarImg}
                            alt="Profile"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="font-semibold text-2xl">{userData?.name || 'User'}</h2>
                        <p className="text-sm text-gray-400">{userData?.mobilenumber || 'No phone number'}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                            <span>Friends: {userData?.friends_count || 0}</span>
                            <span>Watchlist: {userData?.watchlist_count || 0}</span>
                            <span>Interests: {userData?.interests_count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overview Content */}
            <main className="flex-1 px-6 py-4">
                <div className="flex flex-col">
                    <div className="space-y-1">
                        {/* Account & Services */}
                        <MenuItem
                            icon={<Film className="h-5 w-5 text-blue-400" />}
                            label="Request a Movie"
                            onClick={() => setIsMovieDialogOpen(true)}
                            iconBg="bg-blue-500/20"
                        />
                        <MenuItem
                            icon={<Bell className="h-5 w-5 text-purple-400" />}
                            label="Notifications"
                            link="/notifications"
                            iconBg="bg-purple-500/20"
                        />

                        {/* Support & Info */}
                        <MenuItem
                            icon={<HelpCircle className="h-5 w-5 text-orange-400" />}
                            label="FAQs"
                            link="/faq"
                            iconBg="bg-orange-500/20"
                        />
                        <MenuItem
                            icon={<Contact className="h-5 w-5 text-cyan-400" />}
                            label="Support"
                            link="/contactus"
                            iconBg="bg-cyan-500/20"
                        />

                        {/* Policies & Privacy */}
                        <MenuItem
                            icon={<Shield className="h-5 w-5 text-indigo-400" />}
                            label="Policies"
                            link="/policies"
                            iconBg="bg-indigo-500/20"
                        />
                        <MenuItem
                            icon={<Lock className="h-5 w-5 text-gray-400" />}
                            label="Privacy"
                            link="/privacy"
                            iconBg="bg-gray-500/20"
                        />
                        <MenuItem
                            icon={<Info className="h-5 w-5 text-teal-400" />}
                            label="About"
                            link="/aboutus"
                            iconBg="bg-teal-500/20"
                        />

                        {/* App Actions */}
                        <MenuItem
                            icon={<Star className="h-5 w-5 text-yellow-400" />}
                            label="Rate the App"
                            onClick={handleRateApp}
                            iconBg="bg-yellow-500/20"
                        />

                        {/* Danger Zone */}
                        <MenuItem
                            icon={<Trash2 className="h-5 w-5 text-red-400" />}
                            label="Delete Account"
                            onClick={handleDeleteAccount}
                            danger
                            iconBg="bg-red-500/20"
                        />
                        <MenuItem
                            icon={<LogOut className="h-5 w-5 text-red-400" />}
                            label="Log out"
                            onClick={handleLogout}
                            danger
                            iconBg="bg-red-500/20"
                        />
                    </div>
                </div>
                {/* Footer */}
                <div className="mt-8 text-left">
                    <div className="">
                        <Image
                            src={logo || '/placeholder.svg?height=32&width=32'}
                            alt="Suggesto Logo"
                            width={120}
                            height={24}
                            className="object-contain"
                        />
                    </div>
                    <p className="text-sm text-white/60">V1.0.0</p>
                </div>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation currentPath="/profile" />
            <MovieRequestDialog isOpen={isMovieDialogOpen} onClose={() => setIsMovieDialogOpen(false)} />

            {/* Delete Account Confirmation Dialog */}
            {isDeleteDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div 
                        className="bg-[#1a1a2e] rounded-xl p-6 w-full max-w-md border border-gray-700"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-red-500/20">
                                    <AlertTriangle className="h-6 w-6 text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                            </div>
                            <button 
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-700 text-gray-400"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-300 mb-3">
                                Are you sure you want to delete your account? This action cannot be undone.
                            </p>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-red-400 text-sm">
                                    ⚠️ This will permanently delete:
                                </p>
                                <ul className="text-red-400 text-sm mt-2 ml-4 list-disc">
                                    <li>Your profile and personal data</li>
                                    <li>Your watchlist and preferences</li>
                                    <li>Your friends and connections</li>
                                    <li>All your activity history</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsDeleteDialogOpen(false)}
                                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={confirmDeleteAccount}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Deleting...
                                    </div>
                                ) : (
                                    'Delete Account'
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Floating Action Button */}
            <motion.button
                className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-[#6c5ce7] flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
            >
                <Share2 className="h-6 w-6" />
            </motion.button>
        </div>
        // {/* </PageTransitionWrapper> */}
           
    )
}

function MenuItem({
    icon,
    label,
    link,
    onClick,
    danger = false,
    iconBg = "bg-gray-600/20"
}: {
    icon: React.ReactNode;
    label: string;
    link?: string;
    onClick?: () => void;
    danger?: boolean;
    iconBg?: string;
}) {
    const className = `flex items-center justify-between py-4 border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors duration-200 ${danger ? 'text-red-400' : 'text-white'}`;

    if (onClick) {
        return (
            <button onClick={onClick} className={`${className} w-full text-left rounded-lg px-2`}>
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${iconBg}`}>
                        {icon}
                    </div>
                    <span className="font-medium">{label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
        );
    }

    return (
        <Link href={link!} className={`${className} rounded-lg px-2`}>
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${iconBg}`}>
                    {icon}
                </div>
                <span className="font-medium">{label}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-500" />
        </Link>
    );
}