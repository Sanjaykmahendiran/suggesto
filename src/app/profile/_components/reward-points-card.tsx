import { Award } from "lucide-react";
import Image from "next/image";
import cup from "@/assets/cup.png";

interface RewardSectionProps {
    coins: string;
}

export default function RewardSection({ coins }: RewardSectionProps) {
    return (
        <div className="px-2">
            <div className="bg-gradient-to-r from-[#b56bbc]/200 to-[#7a71c4]/100 rounded-2xl p-6 w-full relative overflow-hidden shadow-lg flex items-center justify-between">
                {/* Left side: text content */}
                <div className="z-10">
                    <div className="flex items-center gap-2 mb-2 text-white">
                        <Award className="w-5 h-5" />
                        <span className="font-semibold text-sm">Reward Points</span>
                    </div>
                    <div className="text-white font-extrabold text-3xl">
                        {coins} Points
                    </div>
                </div>

              <style jsx>{`
                @keyframes bounceSlow {
                  0%, 100% {
                    transform: translateY(0);
                  }
                  50% {
                    transform: translateY(-10px);
                  }
                }

                .bounce-slow {
                  animation: bounceSlow 2s infinite; 
                }
              `}</style>

                {/* Trophy Image - positioned like your screenshot */}
                <div className="absolute bottom-[-10px] right-[-10px] w-32 h-32 md:w-32 md:h-32 z-0 bounce-slow">
                    <Image
                        src={cup}
                        alt="Trophy"
                        className="object-contain w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
}
