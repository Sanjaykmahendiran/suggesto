"use client"

import React, { useState, useEffect } from 'react';
import Cookies from "js-cookie"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SuggestionRequestPage = () => {
    const router = useRouter();
    const [requestText, setRequestText] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [numItems, setNumItems] = useState('');
    type Genre = { genre_id: number; name: string };
    const [genres, setGenres] = useState<Genre[]>([]);
    type Friend = { friend_id: number; name?: string; profile_pic?: string };
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userId = Cookies.get("userID")

    useEffect(() => {
        fetchGenres();
        fetchFriends();
    }, []);

    const fetchGenres = async () => {
        try {
            const response = await fetch('https://suggesto.xyz/App/api.php?gofor=genreslist');
            const data = await response.json();
            setGenres(data);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    const fetchFriends = async () => {
        try {
            const response = await fetch(`https://suggesto.xyz/App/api.php?gofor=friendslist&user_id=${userId}`);
            const data = await response.json();
            setFriends(data);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    interface ToggleFriendSelection {
        (friendId: number): void;
    }

    const toggleFriendSelection: ToggleFriendSelection = (friendId) => {
        setSelectedFriends((prev: number[]) =>
            prev.includes(friendId)
                ? prev.filter((id: number) => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleSubmit = async () => {
        if (!requestText.trim() || selectedFriends.length === 0) {
            alert('Please fill in the request text and select at least one friend');
            return;
        }

        setIsSubmitting(true);

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

            const result = await response.json();

            if (response.ok) {
                // Reset form
                setRequestText('');
                setSelectedGenre('');
                setNumItems('');
                setSelectedFriends([]);
            } else {
                console.error('Error submitting request:', result);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => router.back();


    return (
        <div className="min-h-screen ">
            <header className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-2.5 rounded-full bg-[#292938] transition-colors"
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
                        className="w-full h-24 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 resize-none focus:outline-none focus:border-[#6c5ce7] transition-colors"
                    />
                </div>

                {/* Genre and Number Selection */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1">
                        <Label htmlFor="genreSelect" className="text-sm block text-white mb-2">
                            Genre
                        </Label>
                        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                            <SelectTrigger id="genreSelect" className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#6c5ce7] transition-colors">
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
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-[#6c5ce7] transition-colors"
                    />
                </div>

                {/* Select Friends */}
                <div className="mb-8">
                    <Label className=" text-sm block text-white font-medium mb-4">
                        Select Friends
                    </Label>
                    <div className="flex flex-wrap gap-4 p-4 bg-white/10 border border-white/20 rounded-lg max-h-64 overflow-y-auto">
                        {friends.map((friend) => (
                            <div
                                key={friend.friend_id}
                                onClick={() => toggleFriendSelection(friend.friend_id)}
                                className={`text-center min-w-16 cursor-pointer transition-all ${selectedFriends.includes(friend.friend_id)
                                    ? 'transform scale-105'
                                    : 'opacity-80 '
                                    }`}
                            >
                                <div className="relative">
                                    <img
                                        src={friend.profile_pic?.replace(/\\/g, "") || "/api/placeholder/64/64"}
                                        alt={friend.name || "Friend"}
                                        className={`w-16 h-16 rounded-full object-cover border-2 shadow transition-all ${selectedFriends.includes(friend.friend_id)
                                            ? 'border-[#6c5ce7] shadow-lg shadow-[#6c5ce7]/30'
                                            : 'border-[#6c5ce7]/40'
                                            }`}
                                    />
                                    {selectedFriends.includes(friend.friend_id) && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#6c5ce7] rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
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
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${isSubmitting
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-[#6c5ce7] hover:bg-[#5a4fd4] shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                        }`}
                >
                    {isSubmitting ? 'Sending Request...' : 'Send Request'}
                </button>
            </div>
        </div>
    );
};

export default SuggestionRequestPage;