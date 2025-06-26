"use client"
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoadingSkeleton() {
    const router = useRouter();
    return (
        <div className="flex flex-col min-h-screen text-white">
            <div className="relative">
                <div className="p-4 flex items-center">
                    <button className="p-2" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold ml-4">Movies</h1>
                </div>
                <Skeleton className="h-[400px] w-full bg-[#2b2b2b]" />
            </div>

            <div className="px-4 py-6">
                <Skeleton className="h-8 w-36 bg-[#2b2b2b] mb-2" />
                <Skeleton className="h-4 w-48 bg-[#2b2b2b] mb-4" />

                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-6 w-16 bg-[#2b2b2b] rounded-full" />
                    <Skeleton className="h-6 w-16 bg-[#2b2b2b] rounded-full" />
                    <Skeleton className="h-6 w-16 bg-[#2b2b2b] rounded-full" />
                </div>

                <div className="flex justify-between mt-6">
                    <Skeleton className="h-10 w-10 bg-[#2b2b2b] rounded-full" />
                    <Skeleton className="h-10 w-32 bg-[#2b2b2b] rounded-full" />
                    <Skeleton className="h-10 w-10 bg-[#2b2b2b] rounded-full" />
                </div>
            </div>
        </div>
    )
}