import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"


export default function RoomDetailLoading() {
    const router = useRouter()

    return (
        <div className="flex flex-col min-h-screen text-white fixed inset-0">
            <div className="relative ">
                <div className="p-4 flex items-center justify-center">
                    <button className="absolute left-4 p-2" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <Skeleton className="h-6 w-32 bg-[#2b2b2b]" />
                </div>

                <div className="px-4 pb-4">
                    <Skeleton className="h-32 w-full bg-[#2b2b2b] rounded-lg mb-4" />
                </div>
            </div>

            <div className="px-4 py-6">
                <Skeleton className="h-8 w-48 bg-[#2b2b2b] mb-2" />
                <Skeleton className="h-4 w-32 bg-[#2b2b2b] mb-4" />

                <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-8 w-8 bg-[#2b2b2b] rounded-full" />
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="aspect-[2/3] bg-[#2b2b2b] rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    )
}