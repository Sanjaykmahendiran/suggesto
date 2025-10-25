"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import PollImage from "@/assets/poll.png";
import { motion } from "framer-motion";
import LoveArrow from "@/assets/lovearrow-poll.png";
import { ArrowRight } from "lucide-react";

export default function PollCard() {
    const router = useRouter();

    return (
        <motion.div
            onClick={() => router.push("/polls")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full  px-2 mb-10  cursor-pointer relative"
            data-tour-target="poll-section"
        >
            {/* Title Section */}
            <div className="flex items-center justify-center mb-6 gap-4">
                <Image src={LoveArrow} alt="Left Arrow" width={60} height={40} className="rotate-180" />
                <h2 className="text-white text-lg font-semibold italic">Pick Your Side</h2>
                <Image src={LoveArrow} alt="Right Arrow" width={60} height={40} />
            </div>

            {/* Poll Card */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative pb-2 rounded-2xl overflow-hidden shadow-md bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] text-white flex items-center justify-between transition-transform"
            >
                <div className="py-4 px-4 flex flex-col z-10 w-2/3">
                    <motion.h3
                        className="text-white text-2xl font-semibold"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        Cast Your Vote
                    </motion.h3>
                    <p className="text-sm text-white/90">
                        Share your opinion by voting in polls
                    </p>
                </div>

                <motion.div
                    className="w-30 h-30 p-4 flex justify-center"
                    initial={{ scale: 0.8, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                >
                    <Image
                        src={PollImage}
                        alt="Poll"
                        className="drop-shadow-md"
                    />
                </motion.div>
            </motion.div>

            {/* Arrow Icon - corrected */}
            <div className="absolute -bottom-4 left-8 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.25)] rounded-full p-2 z-20">
                <ArrowRight className="h-6 w-6 text-[#b56bbc]" />
            </div>
        </motion.div>
    );
}
