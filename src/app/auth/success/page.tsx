'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect } from "react"
import confetti from "canvas-confetti"
import { useRouter } from "next/navigation"

export default function LoginSuccess() {
    const router = useRouter()

    useEffect(() => {
        // Fire confetti with gradient-matching colors
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#b56bbc', '#7a71c4'],
        });

        // Redirect after 3 seconds
        const timer = setTimeout(() => {
            router.push("/genres-interests");
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);



    return (
        <div className="fixed inset-0 flex min-h-screen flex-col items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <Card className="w-full max-w-md bg-[#1f1f21] text-white border-slate-700 shadow-2xl">
                    <CardHeader className="space-y-1 flex flex-col items-center pt-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        >
                            <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
                        </motion.div>
                        <CardTitle className="text-2xl font-bold text-center">
                            You have logged in successfully
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <p className="text-center bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] bg-clip-text text-transparent">
                            Congratulations! You have successfully logged into your account.
                        </p>

                        <Link href="/genres-interests">
                            <Button
                                variant="default"
                                className="w-full">
                                Continue
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
