"use client"

import { ArrowRight, Share2 } from "lucide-react"
import Image from 'next/image';
import shareImage from "@/assets/Invite-share.png"
import { useRouter } from 'next/navigation';

export default function ShareSuggestionCard() {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push('/invite-friend')}
            className="w-full max-w-sm px-2 mb-10">
            <div className="relative rounded-3xl bg-primary px-2 py-1 text-white shadow-lg">
                <div className="flex items-center justify-center gap-5 ">
                    <div className="h-full flex items-start justify-between">
                        <div className="relative p-2 rounded-full overflow-hidden border-2 border-white shadow-lg">
                            <Share2 className="h-10 w-10 object-contain" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold mb-1 mt-1">Invite your friends</h3>
                        <p className="text-lg font-semibold text-black mb-2">Exprience suggesto better</p>
                    </div>
                    <div className="border border-white bg-primary rounded-full p-2 shadow-lg">
                        <ArrowRight className="h-6 w-6 text-white" />
                    </div>
                </div>

                {/* Icon overlay on bottom border - half hidden */}
                {/* <div className="border border-white bg-primary rounded-full p-2 shadow-lg">
                    <ArrowRight className="h-6 w-6 text-white" />
                </div> */}

            </div>
        </div>
    )
}
