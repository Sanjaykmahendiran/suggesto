import { FaFacebookF, FaInstagram, FaTelegramPlane, FaCopy } from 'react-icons/fa';
import { BsMessenger } from 'react-icons/bs';
import React from 'react';
import { X } from 'lucide-react';
import home1 from "@/assets/home-1.jpg"
import Image from "next/image"

interface ShareButtonProps {
    icon: React.ReactNode;
    label: string;
}

interface ShareCardProps {
    onClick: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ icon, label }) => (
    <button className="flex flex-col items-center text-sm text-white hover:text-purple-400 focus:outline-none">
        <div className="bg-[#6c5ce7] p-3 rounded-full text-xl mb-1">
            {icon}
        </div>
        {label}
    </button>
);

const MovieShareCard: React.FC<ShareCardProps> = ({ onClick }) => {
    return (
        <div className="bg-[#1a1a24] w-full text-white w-96 rounded-t-2xl p-5 shadow-xl space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Share Movie to</h2>
                <button className="text-gray-400 hover:text-white text-xl" aria-label="Close">
                    <X className="h-5 w-5" onClick={onClick} />
                </button>
            </div>

            <div className="flex items-start gap-4">
                <Image
                    src={home1}
                    alt="Ratatouille"
                    className="w-22 h-32 object-cover rounded-md"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Ratatouille</h3>
                        <span className="text-xs text-white bg-[#6c5ce7] px-2 py-0.5 rounded-full">NEW</span>
                    </div>
                    <p className="text-sm text-gray-300">Animation, Adventure, Family</p>
                    <div className="flex items-center text-yellow-400 text-sm mt-1">
                        ⭐ 4.4 <span className="text-gray-400 ml-1">(532)</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                        2 hrs 15 mins · English · 1400mp
                    </p>
                </div>
            </div>

            <div className="flex justify-between text-center pt-2">
                <ShareButton icon={<FaCopy />} label="Copy" />
                <ShareButton icon={<FaFacebookF />} label="Facebook" />
                <ShareButton icon={<FaInstagram />} label="Instagram" />
                <ShareButton icon={<BsMessenger />} label="Meesage" />
                <ShareButton icon={<FaTelegramPlane />} label="Telegram" />
            </div>
        </div>
    );
};

export default MovieShareCard;