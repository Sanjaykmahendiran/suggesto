import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function LoginSuccess() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md bg-slate-800 text-white border-slate-700">
                <CardHeader className="space-y-1 flex flex-col items-center pt-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
                    <CardTitle className="text-2xl font-bold text-center">You have logged in successfully</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <p className="text-center text-slate-400">Congratulations! You have successfully logged into your account.</p>

                    <Link href="/interests">
                        <Button className="w-full text-white bg-[#6c5ce7] hover:bg-[#5b4dd1] h-12 rounded-xl font-medium">Continue</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
