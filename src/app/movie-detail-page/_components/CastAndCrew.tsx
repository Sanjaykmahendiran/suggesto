"use client";

import defaultImage from "@/assets/default-user.webp"
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
}

const CastAndCrew = ({ movieData, actorId }: CastAndCrewProps) => {
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
        <div className="w-full mt-6">
            <h3 className="text-xl font-bold text-white mb-4">Cast & Crew</h3>
            <div className="mb-2">
                <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2">
                    {allMembers.map((person, index) => {
                        const isActor = person.role === "Actor";
                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    router.push(`/add-movie?actor_id=${person.actor_id}&actorname=${person.name}`);
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
                                <p className="text-sm text-white font-medium max-w-[68px]">{person.name}</p>
                                <p className="text-xs text-gray-400 max-w-[68px]">{person.role}</p>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default CastAndCrew;