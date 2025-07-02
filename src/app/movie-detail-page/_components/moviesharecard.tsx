import { FaFacebookF, FaInstagram, FaTelegramPlane, FaCopy, FaWhatsapp } from 'react-icons/fa';
import React from 'react';
import { X } from 'lucide-react';
import Image from "next/image"
import { Share } from '@capacitor/share';
import { Clipboard } from '@capacitor/Clipboard';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

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

    // Generate comprehensive share text with movie details
    const generateShareText = () => {
        const movieLink = generateMovieLink();
        const genresText = genresArray.slice(0, 3).join(', '); // Limit to 3 genres
        return `🎬 Check out this amazing movie: ${movieTitle}

⭐ Rating: ${ratings}
🎭 Genres: ${genresText}

Watch it on Suggesto: ${movieLink}

#Movie #Suggesto #MovieRecommendation`;
    };

    // Copy to clipboard function
    const handleCopy = async () => {
        try {
            await Clipboard.write({
                string: generateShareText()
            });

            await Toast.show({
                text: 'Movie details copied to clipboard!',
                duration: 'short',
                position: 'bottom'
            });
        } catch (error) {
            console.error('Failed to copy:', error);
            await Toast.show({
                text: 'Failed to copy. Please try again.',
                duration: 'short',
                position: 'bottom'
            });
        }
    };

    // Get the correct image URL - handle both full URLs and relative paths
    const getImageUrl = () => {
        if (!movieImage) return '';

        // If it's already a full URL, return as is
        if (movieImage.startsWith('http')) {
            return movieImage;
        }

        // If it's a relative path, prepend the base URL
        return `https://suggesto.xyz/App/${movieImage}`;
    };

    // Convert image URL to Base64 for mobile sharing
    const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
        try {
            const response = await fetch(imageUrl, {
                mode: 'cors'
            });
            if (!response.ok) throw new Error('Failed to fetch image');

            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            throw error;
        }
    };

    // Save image to device and get file URI
    const saveImageToDevice = async (): Promise<string> => {
        try {
            const imageUrl = getImageUrl();
            if (!imageUrl) throw new Error('No image URL available');

            const base64Image = await convertImageToBase64(imageUrl);
            const fileName = `suggesto_movie_${movieId || Date.now()}.jpg`;

            const savedFile = await Filesystem.writeFile({
                path: fileName,
                data: base64Image,
                directory: Directory.Cache,
                encoding: Encoding.UTF8
            });

            return savedFile.uri;
        } catch (error) {
            console.error('Error saving image:', error);
            throw error;
        }
    };

    // Enhanced WhatsApp specific sharing
    const handleWhatsAppShare = async () => {
        try {
            // Check if we're on mobile
            if (Capacitor.isNativePlatform()) {
                // Try to share with image first
                try {
                    const imageUri = await saveImageToDevice();
                    const shareText = generateShareText();

                    await Share.share({
                        title: `${movieTitle} - Movie Recommendation`,
                        text: shareText,
                        url: imageUri,
                        dialogTitle: `Share ${movieTitle} via WhatsApp`
                    });

                    await Toast.show({
                        text: 'Shared to WhatsApp successfully!',
                        duration: 'short',
                        position: 'bottom'
                    });
                } catch (imageError) {
                    console.error('Image sharing failed, trying text only:', imageError);

                    // Fallback to text-only sharing
                    await Share.share({
                        title: `${movieTitle} - Movie Recommendation`,
                        text: generateShareText(),
                        dialogTitle: `Share ${movieTitle} via WhatsApp`
                    });
                }
            } else {
                // Web fallback - open WhatsApp Web with text
                const encodedText = encodeURIComponent(generateShareText());
                const whatsappUrl = `https://wa.me/?text=${encodedText}`;
                window.open(whatsappUrl, '_blank');
            }
        } catch (error) {
            console.error('WhatsApp share failed:', error);
            await Toast.show({
                text: 'Failed to share via WhatsApp. Link copied to clipboard.',
                duration: 'long',
                position: 'bottom'
            });
            await handleCopy();
        }
    };

    // Enhanced Instagram specific sharing
    const handleInstagramShare = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                // For Instagram, we need to save the image and share it
                const imageUri = await saveImageToDevice();

                // Instagram Stories sharing works best with just the image
                await Share.share({
                    title: `${movieTitle} - Movie Recommendation`,
                    text: `🎬 ${movieTitle} - Check it out on Suggesto!`,
                    url: imageUri,
                    dialogTitle: `Share ${movieTitle} to Instagram`
                });

                await Toast.show({
                    text: 'Image prepared for Instagram sharing!',
                    duration: 'short',
                    position: 'bottom'
                });
            } else {
                // Web fallback - just copy the content
                await handleCopy();
                await Toast.show({
                    text: 'Content copied! Paste it in Instagram along with the movie image.',
                    duration: 'long',
                    position: 'bottom'
                });
            }
        } catch (error) {
            console.error('Instagram share failed:', error);
            await Toast.show({
                text: 'Failed to prepare for Instagram. Please save the image manually and copy the text.',
                duration: 'long',
                position: 'bottom'
            });
            await handleCopy();
        }
    };

    // Enhanced Facebook specific sharing
    const handleFacebookShare = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                const imageUri = await saveImageToDevice();

                await Share.share({
                    title: `${movieTitle} - Movie Recommendation`,
                    text: generateShareText(),
                    url: imageUri,
                    dialogTitle: `Share ${movieTitle} on Facebook`
                });

                await Toast.show({
                    text: 'Shared to Facebook successfully!',
                    duration: 'short',
                    position: 'bottom'
                });
            } else {
                // Web fallback - open Facebook share dialog
                const encodedUrl = encodeURIComponent(generateMovieLink());
                const encodedText = encodeURIComponent(`🎬 ${movieTitle} - Check it out on Suggesto!`);
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
                window.open(facebookUrl, '_blank', 'width=600,height=400');
            }
        } catch (error) {
            console.error('Facebook share failed:', error);
            await Toast.show({
                text: 'Failed to share on Facebook. Link copied to clipboard.',
                duration: 'short',
                position: 'bottom'
            });
            await handleCopy();
        }
    };

    // Enhanced Telegram specific sharing
    const handleTelegramShare = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                const imageUri = await saveImageToDevice();

                await Share.share({
                    title: `${movieTitle} - Movie Recommendation`,
                    text: generateShareText(),
                    url: imageUri,
                    dialogTitle: `Share ${movieTitle} via Telegram`
                });

                await Toast.show({
                    text: 'Shared to Telegram successfully!',
                    duration: 'short',
                    position: 'bottom'
                });
            } else {
                // Web fallback - open Telegram Web with text
                const encodedText = encodeURIComponent(generateShareText());
                const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(generateMovieLink())}&text=${encodedText}`;
                window.open(telegramUrl, '_blank');
            }
        } catch (error) {
            console.error('Telegram share failed:', error);
            await Toast.show({
                text: 'Failed to share via Telegram. Link copied to clipboard.',
                duration: 'short',
                position: 'bottom'
            });
            await handleCopy();
        }
    };

    // General native share with both image and text
    const handleNativeShare = async () => {
        try {
            const imageUri = await saveImageToDevice();
            const shareText = generateShareText();

            await Share.share({
                title: `${movieTitle} - Movie Recommendation`,
                text: shareText,
                url: imageUri,
                dialogTitle: `Share ${movieTitle}`
            });

            await Toast.show({
                text: 'Shared successfully!',
                duration: 'short',
                position: 'bottom'
            });

        } catch (error) {
            console.error('Native share failed:', error);

            // Fallback to text-only sharing
            try {
                await Share.share({
                    title: `${movieTitle} - Movie Recommendation`,
                    text: generateShareText(),
                    dialogTitle: `Share ${movieTitle}`
                });
            } catch (fallbackError) {
                console.error('Fallback share failed:', fallbackError);
                await Toast.show({
                    text: 'Sharing failed. Link copied to clipboard instead.',
                    duration: 'long',
                    position: 'bottom'
                });
                await handleCopy();
            }
        }
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
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold line-clamp-2">{movieTitle}</h3>
                    </div>
                    <div className="flex flex-wrap justify-start gap-2 mt-2">
                        {genresArray.slice(0, 3).map((genre, index) => (
                            <span key={index} className="px-3 py-1 text-sm bg-[#2b2b2b] rounded-full">
                                {genre}
                            </span>
                        ))}
                        {genresArray.length > 3 && (
                            <span className="px-3 py-1 text-sm bg-[#2b2b2b] rounded-full">
                                +{genresArray.length - 3} more
                            </span>
                        )}
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