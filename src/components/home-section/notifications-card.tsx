"use client"

import { Bell, ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';

interface NotificationCardProps {
    notificationCount: number;
}

export default function NotificationCard({ notificationCount }: NotificationCardProps) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push('/notifications')}
            className="w-full px-2 mb-10"
            data-tour-target="notifications-card"
            >
            <div className="relative rounded-3xl bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] px-3 py-4 text-white shadow-lg ">
                <div className="flex items-center justify-center gap-4 h-full">
                    <div className="h-full flex items-center justify-center">
                        <div className="relative">
                            <Bell className={`h-10 w-10 object-contain ${notificationCount > 0 ? 'shake' : ''}`} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                                    {notificationCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">What's New?</h3>
                        <p className="text-sm text-white">Checkout infromations & messages from your buddies & suggesto</p>
                    </div>
                </div>
                <div className="absolute bottom-0 right-8 translate-y-1/2 bg-white rounded-full p-2">
                    <ArrowRight className="h-6 w-6 text-primary" />
                </div>
            </div>
        </div>
    );
}
