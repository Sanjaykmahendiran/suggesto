"use client"

import { Bell, ArrowRight } from "lucide-react";
import Image from 'next/image';
import notificationImage from "@/assets/Notification.png"
import { useRouter } from 'next/navigation';

export default function NotificationCard() {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push('/notifications')}
            className="w-full max-w-sm px-2 mb-10">
            <div className="relative rounded-3xl border-2 border-primary px-2 py-2 text-white shadow-lg">
                <div className="flex items-center justify-center gap-4 ">
                    <div className="h-full flex items-center justify-center">
                        <div className="relative">
                            <Bell className="h-12 w-12 object-contain shake" />
                            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#6c5ce7] to-[#5a4bd6] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                                {3}
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-1">What's New</h3>
                        <p className="text-sm font-semibold text-primary mb-2">Checkout infromations & messages from your buddies & suggesto</p>
                    </div>
                </div>

                {/* Icon overlay on bottom border - half hidden */}
                <div className="absolute bottom-0 right-8 translate-y-1/2 bg-primary rounded-full p-2">
                    <ArrowRight className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>

    );
}