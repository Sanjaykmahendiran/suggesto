import { ArrowRight, Award } from "lucide-react";
import Image from "next/image";
import cup from "@/assets/cup.png";
import { useRouter } from "next/navigation";

interface RewardSectionProps {
    coins: string;
    user?: {
        payment_status?: number;
    };
}

export default function RewardSection({ coins, user }: RewardSectionProps) {
    const router = useRouter();

    return (

        <div
            onClick={() => router.push("/spend-coins")}
            className="relative mx-2 rounded-3xl bg-gradient-to-r from-[#b56bbc]/200 to-[#7a71c4]/100 text-white  h-28 flex flex-row justify-between items-center px-6 py-5 cursor-pointer"
        >
            {/* Left side: text content */}
            <div className="z-10">
                <div className="flex items-center gap-2 mb-2 text-white">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold text-sm">Reward Points</span>
                </div>
                <div className="text-white font-extrabold text-3xl mb-1">
                    {coins} Points
                </div>

                {/* Show only if not a premium user */}
                {user?.payment_status !== 1 && (
                    <div className="text-white text-xs font-medium bg-white/10 px-2 py-1 rounded-full w-fit border border-white/20 backdrop-blur-sm">
                        Earn 2x coins in Pro Mode
                    </div>
                )}
            </div>

            {/* Trophy Image */}
            <div className="absolute bottom-[-10px] right-[-10px] w-32 h-32 z-0 bounce-slow">
                <Image
                    src={cup}
                    alt="Trophy"
                    className="object-contain w-full h-full"
                />
            </div>

            {/* Corrected Arrow Icon Position */}
            <div className="absolute -bottom-4 left-6 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.3)] rounded-full p-2 z-50">
                <ArrowRight className="h-6 w-6 text-[#b56bbc]" />
            </div>

        </div>

    );
}
