import { FaFacebookF, FaInstagram, FaTelegramPlane, FaCopy, FaWhatsapp } from 'react-icons/fa';
import React from 'react';
import { X } from 'lucide-react';
import Image from "next/image"
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/clipboard';
import { Toast } from '@capacitor/toast';

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

    // Generate the movie URL in the specified format
    const generateMovieLink = () => {
        const baseUrl = 'https://suggesto.top/movie-detail-page';
        const id = movieId;
        return id ? `${baseUrl}?movie_id=${id}` : '';
    };

    // Generate share text with the specific format
    const generateShareText = () => {
        const movieLink = generateMovieLink();
        return `Check out this movie: ${movieTitle} on Suggesto\n${movieLink}`;
    };

    // Copy to clipboard function
    const handleCopy = async () => {
        try {
            await Clipboard.write({
                string: generateShareText()
            });

            await Toast.show({
                text: 'Movie link copied to clipboard!',
                duration: 'short'
            });
        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback for web
            if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(generateShareText());
                    alert('Copied to clipboard!');
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                }
            }
        }
    };

    // Generic share function using Capacitor Share
    const handleNativeShare = async () => {
        try {
            const movieLink = generateMovieLink();
            await Share.share({
                title: `${movieTitle} - Movie Recommendation`,
                text: `Check out this movie: ${movieTitle} on Suggesto`,
                url: movieLink,
                dialogTitle: 'Share Movie'
            });
        } catch (error) {
            console.error('Failed to share:', error);
            // Fallback to web share API
            if (navigator.share) {
                try {
                    const movieLink = generateMovieLink();
                    await navigator.share({
                        title: `${movieTitle} - Movie Recommendation`,
                        text: `Check out this movie: ${movieTitle} on Suggesto`,
                        url: movieLink
                    });
                } catch (err) {
                    console.error('Web share failed:', err);
                }
            }
        }
    };

    // Facebook share
    const handleFacebookShare = () => {
        const movieLink = generateMovieLink();
        const text = encodeURIComponent(`Check out this movie: ${movieTitle} on Suggesto`);
        const url = encodeURIComponent(movieLink);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        window.open(facebookUrl, '_blank');
    };

    // Instagram share (Note: Instagram doesn't support direct URL sharing)
    const handleInstagramShare = async () => {
        try {
            // Try native share first (will show Instagram as an option on mobile)
            await handleNativeShare();
        } catch (error) {
            await Toast.show({
                text: 'Instagram sharing works best through the native share menu',
                duration: 'long'
            });
        }
    };

    // WhatsApp share
    const handleWhatsAppShare = () => {
        const shareText = generateShareText();
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Telegram share
    const handleTelegramShare = () => {
        const movieLink = generateMovieLink();
        const text = encodeURIComponent(`Check out this movie: ${movieTitle} on Suggesto`);
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(movieLink)}&text=${text}`;
        window.open(telegramUrl, '_blank');
    };

    return (
        <div className="bg-[#1f1f21] text-white w-96 rounded-t-2xl p-5 shadow-xl space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Share Movie to</h2>
                <button className="text-gray-400 hover:text-white text-xl" aria-label="Close">
                    <X className="h-5 w-5" onClick={onClick} />
                </button>
            </div>

            <div className="flex items-start gap-4">
                <Image
                    src={movieImage}
                    alt={movieTitle}
                    className="w-22 h-32 object-cover rounded-md"
                    width={88}
                    height={128}
                />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{movieTitle}</h3>
                    </div>
                    <div className="flex flex-wrap justify-start gap-2 mt-2">
                        {genresArray.map((genre, index) => (
                            <span key={index} className="px-3 py-1 text-sm bg-[#2b2b2b] rounded-full">
                                {genre}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center text-yellow-400 text-sm mt-2">
                        ⭐ {ratings}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        {releaseDate}
                    </p>
                </div>
            </div>

            <div className="flex justify-between text-center pt-2">
                <ShareButton
                    icon={<FaCopy />}
                    label="Copy"
                    onClick={handleCopy}
                />
                <ShareButton
                    icon={<FaWhatsapp />}
                    label="WhatsApp"
                    onClick={handleWhatsAppShare}
                />
                <ShareButton
                    icon={<FaInstagram />}
                    label="Instagram"
                    onClick={handleInstagramShare}
                />
                <ShareButton
                    icon={<FaFacebookF />}
                    label="Facebook"
                    onClick={handleFacebookShare}
                />
                <ShareButton
                    icon={<FaTelegramPlane />}
                    label="Telegram"
                    onClick={handleTelegramShare}
                />
            </div>
        </div>
    );
};

export default MovieShareCard;