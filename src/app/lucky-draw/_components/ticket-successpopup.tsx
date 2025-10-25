import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Trophy, X } from "lucide-react"
import { useEffect } from "react"
import confetti from "canvas-confetti"

interface SuccessPopupProps {
    onClose: () => void;
    purchasedTicketNumber: string | number;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ onClose, purchasedTicketNumber }) => {

    useEffect(() => {
        // Trigger single confetti blast when component mounts
        const timer = setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#b56bbc', '#7a71c4']
            });
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative bg-gradient-to-br from-[#1f1f21] to-[#2b2b2b] rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl border border-[#b56bbc]/30"
            >
                {/* close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-[#2b2b2b]/50 hover:bg-[#3b3b3b]/50 transition-colors"
                    aria-label="Close success popup"
                >
                    <X size={16} className="text-white/70" />
                </button>

                {/* trophy animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mb-6"
                >
                    <div className="w-20 h-20 mx-auto bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] rounded-full flex items-center justify-center">
                        <Trophy size={40} className="text-white" />
                    </div>
                </motion.div>

                {/* text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                >
                    <h3 className="text-2xl font-bold text-white mb-2">🎉 Congratulations! 🎉</h3>
                    <p className="text-white/80 mb-6">
                        Your ticket has been purchased successfully!
                    </p>
                </motion.div>

                {/* ticket number */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-[#b56bbc]/20 to-[#7a71c4]/20 rounded-xl p-6 mb-6 border border-[#b56bbc]/30"
                >
                    <p className="text-sm text-white/70 mb-2">Your Lucky Ticket Number</p>
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text">
                        #{purchasedTicketNumber}
                    </div>
                </motion.div>

                {/* button */}
                <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] hover:from-[#a55aab] hover:to-[#6960b3] text-white py-3 text-lg font-semibold rounded-xl shadow-lg"
                >
                    Awesome! 🚀
                </Button>
            </motion.div>
        </div>
    )
}

export default SuccessPopup