"use client"

import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie"
import toast, { Toaster } from 'react-hot-toast';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DefaultImage from "@/assets/default-user.webp"
import CoinAnimation from '@/components/coin-animation';

const SuggestionRequestPage = () => {
    const router = useRouter();
    const [requestText, setRequestText] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [numItems, setNumItems] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    type Genre = { genre_id: number; name: string };
    const [genres, setGenres] = useState<Genre[]>([]);
    type Friend = { friend_id: number; name?: string; profile_pic?: string };
    const [friends, setFriends] = useState<Friend[]>([]);
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCoinAnimation, setShowCoinAnimation] = useState(false)
    const [coinsEarned, setCoinsEarned] = useState(0)

    const userId = Cookies.get("userID")

    useEffect(() => {
        fetchGenres();
        fetchFriends();
    }, []);

    // Filter friends based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredFriends(friends);
        } else {
            const filtered = friends.filter(friend =>
                friend.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFriends(filtered);
        }
    }, [searchTerm, friends]);

    const fetchGenres = async () => {
        try {
            const response = await fetch('https://suggesto.xyz/App/api.php?gofor=genreslist');
            const data = await response.json();
            setGenres(data);
        } catch (error) {
            console.error('Error fetching genres:', error);
            toast.error('Failed to load genres');
        }
    };

    const fetchFriends = async () => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${userId}`)
            if (!response.ok) throw new Error('Failed to fetch friends')
            const result = await response.json()

            // Extract the data array from the paginated response
            const friendsData: Friend[] = result.data || []
            setFriends(friendsData)
        } catch (error) {
            console.error('Error fetching friends:', error)
            toast.error('Failed to load friends list')
        }
    }

    interface ToggleFriendSelection {
        (friendId: number): void;
    }

    const toggleFriendSelection: ToggleFriendSelection = (friendId) => {
        setSelectedFriends((prev: number[]) => {
            const isSelected = prev.includes(friendId);
            const friend = friends.find(f => f.friend_id === friendId);

            if (isSelected) {
                return prev.filter((id: number) => id !== friendId);
            } else {
                return [...prev, friendId];
            }
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleSubmit = async () => {
        if (!requestText.trim()) {
            toast.error('Please enter your request text');
            return;
        }

        if (selectedFriends.length === 0) {
            toast.error('Please select at least one friend');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Sending your request...');

        try {
            const requestData = {
                gofor: "createSuggestionRequest",
                user_id: parseInt(userId || ""),
                request_text: requestText,
                genre: selectedGenre,
                num_of_items: parseInt(numItems) || 0,
                receiver_ids: selectedFriends
            };

            const response = await fetch('https://suggesto.xyz/App/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json()
            if (result.coins_earned) {
                setCoinsEarned(result.coins_earned)
                setShowCoinAnimation(true)
            }

            if (response.ok) {
                toast.dismiss(loadingToast);
                toast.success('Request sent successfully! 🎉');

                // Reset form
                setRequestText('');
                setSelectedGenre('');
                setNumItems('');
                setSelectedFriends([]);
                setSearchTerm('');
            } else {
                toast.dismiss(loadingToast);
                toast.error(result.message || 'Failed to send request');
                console.error('Error submitting request:', result);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Network error. Please try again.');
            console.error('Error submitting request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleBack = () => router.back();

    return (
        <div className="min-h-screen ">
            <header className="flex items-center justify-between p-4 pt-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-2.5 rounded-full bg-[#2b2b2b] transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} className="text-white" />
                    </button>

                    <h1 className="text-xl font-bold">Ask for Suggestions</h1>
                </div>
            </header>

            <div className="max-w-md mx-auto p-4">

                {/* Request Text Input */}
                <div className="mb-2">
                    <Label htmlFor="requestText" className="text-sm block text-white mb-2">
                        What do you want us to suggest?
                    </Label>
                    <textarea
                        id="requestText"
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                        placeholder="E.g. Suggest me 5 good thrillers to binge this weekend..."
                        className="w-full h-24 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 resize-none focus:outline-none focus:border-[#ff7db8] transition-colors"
                    />

                </div>

                {/* Genre and Number Selection */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1">
                        <Label htmlFor="genreSelect" className="text-sm block text-white mb-2">
                            Genre
                        </Label>
                        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                            <SelectTrigger id="genreSelect" className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#ff7db8] transition-colors">
                                <SelectValue placeholder="Genre " />
                            </SelectTrigger>
                            <SelectContent className="bg-[#181826] text-white max-h-60 overflow-y-auto">
                                {genres.map((genre) => (
                                    <SelectItem
                                        key={genre.genre_id}
                                        value={genre.name}
                                        className="bg-[#181826] text-white hover:bg-white/10"
                                    >
                                        {genre.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Number of Items Input */}
                <div className="flex-1 mb-6">
                    <Label htmlFor="numItems" className="text-sm block text-white mb-2">
                        Number of Suggestions
                    </Label>
                    <Input
                        id="numItems"
                        type="number"
                        value={numItems}
                        onChange={(e) => setNumItems(e.target.value)}
                        placeholder="How many? (e.g. 3)"
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-[#ff7db8] transition-colors"
                    />
                </div>

                {/* Select Friends */}
                <div className="mb-8">
                    <Label className=" text-sm block text-white font-medium mb-4">
                        Select Friends
                    </Label>
                    {/* Friends List */}
                    <div className="flex flex-col gap-4 p-4 bg-white/10 border border-white/20 rounded-lg max-h-64 overflow-y-auto">

                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-white/60" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Search friends..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 bg-[#2b2b2b] border border-white/20 text-white placeholder-white/60 rounded-md focus:outline-none focus:border-[#ff7db8]"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Selected Friends Count */}
                        {selectedFriends.length > 0 && (
                            <div className="text-sm text-[#ff7db8]">
                                {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
                            </div>
                        )}

                        {/* Friends List */}
                        <div className="flex flex-wrap gap-4">
                            {filteredFriends.length > 0 ? (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend.friend_id}
                                        onClick={() => toggleFriendSelection(friend.friend_id)}
                                        className={`text-center min-w-16 cursor-pointer transition-all duration-200 ${selectedFriends.includes(friend.friend_id)
                                            ? 'transform scale-105'
                                            : 'opacity-80 hover:opacity-100'
                                            }`}
                                    >
                                        <div className="relative">
                                            <img
                                                src={
                                                    friend.profile_pic?.replace(/\\/g, '') || (typeof DefaultImage === 'string' ? DefaultImage : DefaultImage.src)
                                                }
                                                alt={friend.name || 'Friend'}
                                                className={`w-16 h-16 rounded-full object-cover border-2 transition-all ${selectedFriends.includes(friend.friend_id)
                                                    ? 'border-[#ff7db8] shadow-lg shadow-[#ff7db8]/30'
                                                    : 'border-[#ff7db8]/40'
                                                    }`}
                                            />
                                            {selectedFriends.includes(friend.friend_id) && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff7db8] rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-3 h-3 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        {friend.name && (
                                            <div className="text-xs text-white mt-1 truncate w-16">
                                                {friend.name}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="w-full text-center text-white/60 py-8">
                                    {searchTerm ? 'No friends found matching your search' : 'No friends available'}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${isSubmitting
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#ff7db8] to-[#ee2a7b] shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                        }`}
                >
                    {isSubmitting ? 'Sending Request...' : 'Send Request'}
                </button>
            </div>

            <CoinAnimation
                show={showCoinAnimation}
                coinsEarned={coinsEarned}
                message="Coins Earned!"
                onAnimationEnd={() => setShowCoinAnimation(false)}
                duration={3000}
            />

        </div>
    );
};

export default SuggestionRequestPage;