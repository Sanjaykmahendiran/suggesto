import { FaFacebookF, FaInstagram, FaTelegramPlane, FaCopy, FaWhatsapp } from 'react-icons/fa';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Image from "next/image"
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useRouter } from 'next/navigation';

interface ShareButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

interface ShareCardProps {
    onClick: () => void;
    movieTitle: string;
    genresArray: string[];
    ratings: number | string;
    releaseDate: string;
    movieImage: string | any;
    movieId?: string | number;
}

const APP_URL = "https://play.google.com/store/apps/details?id=com.suggesto.app";

const ShareButton: React.FC<ShareButtonProps> = ({ icon, label, onClick }) => (
    <button
        className="flex flex-col items-center text-sm text-white hover:text-purple-400 focus:outline-none"
        onClick={onClick}
    >
        <div className="bg-gradient-to-r from-[#b56bbc] to-[#7a71c4] p-3 rounded-full text-xl mb-1">
            {icon}
        </div>
        {label}
    </button>
);

const MovieShareCard: React.FC<ShareCardProps> = ({
    onClick,
    movieTitle,
    genresArray,
    ratings,
    releaseDate,
    movieImage,
    movieId,
}) => {
    const router = useRouter();

    // Handle deep links
    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            App.addListener('appUrlOpen', (event) => {
                const url = new URL(event.url);
                const movieId = url.searchParams.get('movie_id');
                if (movieId) {
                    router.push(`/movie-detail-page?movie_id=${movieId}`);
                }
            });
        }
        return () => {
            if (Capacitor.isNativePlatform()) {
                App.removeAllListeners();
            }
        };
    }, [router]);

    // Generate deep link
    const generateMovieLink = () => {
        if (!movieId) return APP_URL; // fallback to app store
        return `https://suggesto.app/open/movie/${movieId}`;
    };

    // Share text
    const generateShareText = () => {
        const movieLink = generateMovieLink();
        const genresText = genresArray.slice(0, 3).join(', ');

        return `🎬 Check out this amazing movie: ${movieTitle}

        ⭐ Rating: ${ratings}
        🎭 Genres: ${genresText}

        👉 Open in app: ${movieLink}
        📲 Download the app: ${APP_URL}

        #Movie #Suggesto #MovieRecommendation`;
    };


    // Image URL (for sharing)
    const getImageUrl = () => {
        if (!movieImage) return '';
        if (typeof movieImage === "string" && movieImage.startsWith('http')) return movieImage;
        return `https://suggesto.xyz/App/${movieImage}`;
    };

    // Save image for sharing
    const saveImageToDevice = async (): Promise<string> => {
        const imageUrl = getImageUrl();
        if (!imageUrl) throw new Error('No image URL available');

        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Convert to base64 (strip prefix)
        const base64Data: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(",")[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        const fileName = `movie_${movieId}_${Date.now()}.jpg`;
        await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
        });

        const { uri } = await Filesystem.getUri({
            path: fileName,
            directory: Directory.Cache,
        });

        return uri;
    };

    // Copy movie details
    const handleCopy = async () => {
        try {
            await Clipboard.write({ string: generateShareText() });
            await Toast.show({
                text: 'Movie details copied!',
                duration: 'short',
                position: 'bottom',
            });
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    // ✅ Generic share handler (all platforms, with image if possible)
    const shareWithImage = async (extraText?: string, fallbackUrl?: string) => {
        try {
            const text = extraText || generateShareText();
            const imageUri = await saveImageToDevice();

            await Share.share({
                title: movieTitle,
                text,
                url: fallbackUrl || generateMovieLink(),
                files: [imageUri],
            });
        } catch (err) {
            console.error("Image share failed, falling back:", err);
            await handleCopy();
        }
    };

    // WhatsApp share
    const handleWhatsAppShare = () => shareWithImage();

    // Instagram share
    const handleInstagramShare = () =>
        shareWithImage(`🎬 ${movieTitle} - Check it out on Suggesto! ${generateMovieLink()}`);

    // Facebook share
    const handleFacebookShare = () =>
        shareWithImage(`🎬 ${movieTitle} - Check it out on Suggesto!`, generateMovieLink());

    // Telegram share
    const handleTelegramShare = () => {
        const text = generateShareText();
        const movieLink = generateMovieLink();
        window.open(
            `tg://msg_url?url=${encodeURIComponent(movieLink)}&text=${encodeURIComponent(text)}`,
            "_system"
        );
    };

    return (
        <div className="bg-[#1f1f21] text-white w-full rounded-t-2xl px-3 py-4 shadow-xl space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Share Movie to</h2>
                <button className="text-gray-400 hover:text-white text-xl" aria-label="Close">
                    <X className="h-5 w-5" onClick={onClick} />
                </button>
            </div>

            <div className="flex items-start gap-4">
                <Image
                    src={getImageUrl()}
                    alt={movieTitle}
                    className="w-22 h-32 object-cover rounded-md"
                    width={88}
                    height={128}
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold line-clamp-2">{movieTitle}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {genresArray.slice(0, 3).map((genre, i) => (
                            <span key={i} className="px-3 py-1 text-sm bg-[#2b2b2b] rounded-full">{genre}</span>
                        ))}
                        {genresArray.length > 3 && (
                            <span className="px-3 py-1 text-sm bg-[#2b2b2b] rounded-full">+{genresArray.length - 3} more</span>
                        )}
                    </div>
                    <div className="text-yellow-400 text-sm mt-2">⭐ {ratings}</div>
                    <p className="text-sm text-gray-400 mt-2">{releaseDate}</p>
                </div>
            </div>

            <div className="flex justify-between text-center pt-2">
                <ShareButton icon={<FaCopy />} label="Copy" onClick={handleCopy} />
                <ShareButton icon={<FaWhatsapp />} label="WhatsApp" onClick={handleWhatsAppShare} />
                <ShareButton icon={<FaInstagram />} label="Instagram" onClick={handleInstagramShare} />
                <ShareButton icon={<FaFacebookF />} label="Facebook" onClick={handleFacebookShare} />
                <ShareButton icon={<FaTelegramPlane />} label="Telegram" onClick={handleTelegramShare} />
            </div>
        </div>
    );
};

export default MovieShareCard;
