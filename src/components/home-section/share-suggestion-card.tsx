"use client"
import { ArrowRight, Share2 } from "lucide-react"
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

export default function ShareSuggestionCard() {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push('/invite-friend')}
            className="w-full px-2 mb-10 cursor-pointer">
            <div className="relative rounded-3xl bg-white px-3 py-4 text-white shadow-lg ">
                <div className="flex items-center justify-center gap-4 h-full">
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                        className="h-full flex items-center justify-center"
                    >
                        <div className="relative">
                            <Share2 className="h-10 w-10 object-contain text-primary" />
                        </div>
                    </motion.div>

                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                            Invite your friends
                        </h3>
                        <p className="text-sm text-black">Experience suggesto better</p>
                    </div>
                </div>
                <div className="absolute bottom-0 right-8 translate-y-1/2 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] rounded-full p-2">
                    <ArrowRight className="h-6 w-6 text-primary" />
                </div>
            </div>
        </div>
    );
}