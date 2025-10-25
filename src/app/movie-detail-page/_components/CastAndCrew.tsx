"use client";

import defaultImage from "@/assets/default-user.webp"
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Actor = {
    actor_id: number;
    name: string;
    image: string;
};

type CrewMember = {
    actor_id: number;
    name: string;
    image: string;
};

type MovieData = {
    actors: {
        actor1?: Actor;
        actor2?: Actor;
        actor3?: Actor;
        actor4?: Actor;
    };
    director?: CrewMember;
    music_director?: CrewMember;
    cinematographer?: CrewMember;
    editor?: CrewMember;
};

interface CastAndCrewProps {
    movieData?: MovieData;
    actorId: string;
    movieId: number;
    showSuggestButton?: boolean; // New prop to control button visibility
}

const CastAndCrew = ({ movieData, movieId, showSuggestButton = true }: CastAndCrewProps) => {
    const router = useRouter();
    
    if (!movieData) {
        return null;
    }

    // Extract and combine all cast and crew members
    const allMembers: Array<{ actor_id: number; name: string; role: string; image: string }> = [];
    // Add actors
    if (movieData.actors) {
        Object.values(movieData.actors).forEach((actor) => {
            if (actor) {
                allMembers.push({
                    actor_id: actor.actor_id,
                    name: actor.name,
                    role: "Actor",
                    image: actor.image
                });
            }
        });
    }

    // Add crew members
    if (movieData.director) {
        allMembers.push({
            actor_id: movieData.director.actor_id,
            name: movieData.director.name,
            role: "Director",
            image: movieData.director.image
        });
    }

    if (movieData.music_director) {
        allMembers.push({
            actor_id: movieData.music_director.actor_id,
            name: movieData.music_director.name,
            role: "Music Director",
            image: movieData.music_director.image
        });
    }

    if (movieData.cinematographer) {
        allMembers.push({
            actor_id: movieData.cinematographer.actor_id,
            name: movieData.cinematographer.name,
            role: "Cinematographer",
            image: movieData.cinematographer.image
        });
    }

    if (movieData.editor) {
        allMembers.push({
            actor_id: movieData.editor.actor_id,
            name: movieData.editor.name,
            role: "Editor",
            image: movieData.editor.image
        });
    }

    if (allMembers.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-6 bg-[#2b2b2b] p-3 rounded-lg mb-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Cast & Crew</h3>
            </div>
            <div className="mb-2">
                <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
                    {allMembers.map((person, index) => {
                        const isActor = person.role === "Actor";
                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    router.push(
                                        `/add-movie?actor_id=${person.actor_id}&actorname=${person.name}`
                                    );
                                }}
                                className="flex-shrink-0 text-center cursor-pointer"
                            >
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#2b2b2b] mb-2">
                                    <img
                                        src={person.image || defaultImage.src}
                                        alt={person.name}
                                        className="w-full h-full object-cover flex items-center"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = defaultImage.src;
                                        }}
                                    />
                                </div>

                                {/* Name with truncate */}
                                <p
                                    className="text-sm text-white font-medium max-w-[68px] truncate"
                                    title={person.name}
                                >
                                    {person.name}
                                </p>

                                {/* Role with truncate */}
                                <p
                                    className="text-xs text-gray-400 max-w-[68px] truncate"
                                    title={person.role}
                                >
                                    {person.role}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Conditionally render the Suggest a Cast & Vote button */}
            {showSuggestButton && (
                <Button
                    className="w-full flex items-center justify-center"
                    onClick={() => {
                        router.push(`/submit-cast-suggestion?movie_id=${movieId}`);
                    }}
                >
                    Suggest a Cast & Vote
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            )}
        </div>
    );
};

export default CastAndCrew;