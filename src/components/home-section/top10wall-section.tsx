"use client"

import { ArrowRight, Trophy } from "lucide-react"
import { useRouter } from 'next/navigation'
import { Card } from "../ui/card"
import Top10WallImage from "@/assets/top-10.png";
import Image from "next/image";

export default function Top10Wall() {
    const router = useRouter()

    return (
        <div className="px-2 mb-10" data-tour-target="top10-wall">
            {/* Top 10 Movie Wall */}
            <div className="p-[2px] rounded-3xl bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:scale-105 transition-transform duration-200 shadow-xl ">
                <div
                    onClick={() => router.push(`/top-10-wall`)}
                    className="relative  rounded-3xl bg-[#121214]  text-white flex flex-row justify-between items-center px-6 py-5 cursor-pointer"
                >
                    <div className="flex flex-col">
                        <h3 className="text-base font-semibold leading-tight">
                            Explore the Top 10 Wall
                        </h3>
                        <p className="text-xs text-white/70">
                            Discover what’s trending in real-time.
                        </p>
                    </div>

                    <div className="flex-shrink-0 ml-4">
                        <Image
                            src={Top10WallImage}
                            alt="Top 10"
                            width={60}
                            height={60}
                            className="object-contain w-16 h-16"
                        />
                    </div>

                    {/* Arrow Icon */}
                    <div className="absolute bottom-0 left-6 translate-y-1/2 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] rounded-full p-2">
                        <ArrowRight className="h-6 w-6 text-[#b56bbc]" />
                    </div>
                </div>
            </div>
        </div>
    )
}

