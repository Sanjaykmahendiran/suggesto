"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Grid, Sparkles } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

interface CategoryType {
    id: number;
    name: string;
    icon: string;
    count: number;
}

type CategoriesProps = {
    isLoading: boolean;
    categories: CategoryType[];
};

const SkeletonCategory = () => (
    <div className="bg-[#2b2b2b] rounded-xl p-4 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full bg-[#181826]" />
        <div>
            <Skeleton className="h-4 w-20 mb-1 bg-[#181826]" />
            <Skeleton className="h-3 w-16 bg-[#181826]" />
        </div>
    </div>
)


export default function Categories({ isLoading, categories }: CategoriesProps) {
    const router = useRouter();

    return (
        <div className="px-4 ">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Grid className="w-5 h-5 text-[#9370ff]" />
                    <h2 className="text-lg font-semibold">Categories</h2>
                </div>
                <a href="#" className="text-sm text-[#9370ff]">
                    See All
                </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {isLoading ? (
                    <SkeletonCategory />
                ) : (
                    categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="bg-[#2b2b2b] rounded-xl p-4 flex items-center gap-3 cursor-pointer"
                            onClick={() => router.push(`/category/${category.name.toLowerCase()}`)}
                        >
                            <div className="w-10 h-10 bg-[#b56bbc]/20 rounded-full flex items-center justify-center text-xl">
                                {category.icon}
                            </div>
                            <div>
                                <h3 className="font-medium">{category.name}</h3>
                                <p className="text-xs text-gray-400">{category.count} movies</p>
                            </div>
                        </motion.div>
                    )))}
            </div>
        </div>
    );
}
