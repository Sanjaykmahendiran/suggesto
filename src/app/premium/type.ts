import topWallImg from "@/assets/Smart AI Movie Genie.png"
import suggestoAIImg from "@/assets/Top Feed Boost.png"
import autoListsImg from "@/assets/Watchroom Highlight.png"
import cineCardImg from "@/assets/Faster Coin Earnings.png"
import streakRoomImg from "@/assets/Suggest Power.png"
import influencerWallImg from "@/assets/Top Movie Matcher.png"
import { Clock, Heart, Star, TrendingUp, Users, Zap } from "lucide-react"

export const features = [
    {
        img: topWallImg,
        title: "Smart AI Movie Genie",
        description: "Personalized one-tap movie pick using your tastes and history.",
    },
    {
        img: suggestoAIImg,
        title: "Top Feed Boost",
        description: "Move your suggestion to the top of your friend's feed instantly.",
    },
    {
        img: autoListsImg,
        title: "Watchroom Highlight",
        description: "Get noticed first with bold highlights in group watchrooms.",
    },
    {
        img: cineCardImg,
        title: "Faster Coin Earnings",
        description: "Earn 2x coins for key actions, and accelerate rewards faster.",
    },
    {
        img: streakRoomImg,
        title: "Suggest Power",
        description: "Suggest more movies to more friends, with viewer insights.",
    },
    {
        img: influencerWallImg,
        title: "Top Movie Matcher",
        description: "Discover which friend best matches your movie taste score.",
    }
]

export const statsMessages = [
    { icon: Users, text: "287 users upgraded to Pro in the last 7 days", color: "text-green-400" },
    { icon: Zap, text: "13,423 suggestions sent by Pro users this week!", color: "text-blue-400" },
    { icon: Clock, text: "1,239 Pro users found the perfect movie in under 10 seconds!", color: "text-purple-400" },
    { icon: Heart, text: "Over 3,000 Pro users made meaningful movie connections!", color: "text-pink-400" },
    { icon: TrendingUp, text: "800 users boosted their suggestions and got noticed by close friends!", color: "text-yellow-400" },
    { icon: Star, text: "Pro users are 3x more likely to get their movie picked in Watch rooms!", color: "text-orange-400" }
]

export interface UserData {
    payment_status: string;
    paid_upto: string;
    name?: string;
    email?: string;
    phone?: string;
    coins: number;
}

export interface Package {
    packageId: number
    pid: number
    package_id: number
    cost: string
    amount: string
    package_description: string
    package_name: string
    id: number;
    name: string;
    description: string;
    price: string;
    duration_days: number;
    features: string;
    status: number;
    created_date: string;
}

export interface PaymentOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
        name: string;
        email: string;
        contact: string;
    };
    theme: {
        color: string;
    };
}