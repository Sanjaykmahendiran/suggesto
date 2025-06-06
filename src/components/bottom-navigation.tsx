// components/bottom-navigation.tsx
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Sparkles,
  Clapperboard,
  PlayCircle,
  Mountain,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePageTransition } from "./PageTransition";

interface BottomNavigationProps {
  currentPath: string;
}

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/watch-list", label: "Watch List", icon: PlayCircle },
  { href: "/watch-room", label: "Watch Room", icon: Clapperboard },
  { href: "/suggest", label: "Suggest", icon: Sparkles },
  { href: "/movie-top-wall", label: "Top Wall", icon: Mountain },
];

export function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const router = useRouter();
  const { setDirection } = usePageTransition();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [animDirection, setAnimDirection] = useState<'left' | 'right'>('right');

  // Update direction when currentPath changes
  useEffect(() => {
    if (previousPath && previousPath !== currentPath) {
      const prevIndex = navItems.findIndex(item => item.href === previousPath);
      const currentIndex = navItems.findIndex(item => item.href === currentPath);

      if (prevIndex !== -1 && currentIndex !== -1) {
        setAnimDirection(currentIndex > prevIndex ? 'right' : 'left');
      }
    }
    setPreviousPath(currentPath);
  }, [currentPath, previousPath]);

  const handleNavigation = (href: string, event: React.MouseEvent) => {
    event.preventDefault();

    // Determine direction based on navigation
    const currentIndex = navItems.findIndex(item => item.href === currentPath);
    const targetIndex = navItems.findIndex(item => item.href === href);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const direction = targetIndex > currentIndex ? 'right' : 'left';
      setDirection(direction);
    }

    // Navigate to the new page
    router.push(href);
  };

  const isActive = (path: string) => currentPath === path;

  const getTransitionProps = (isActive: boolean) => {
    if (!isActive) return {};

    const exitX = animDirection === 'right' ? -50 : 50;
    const enterX = animDirection === 'right' ? 50 : -50;

    return {
      initial: { x: enterX, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: exitX, opacity: 0 },
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    };
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 rounded-t-3xl bg-gray-800 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNavigation(href, e)}
              className={`relative flex flex-col items-center p-2 transition-colors duration-200 ${active ? "text-[#6c5ce7]" : "text-white"
                }`}
            >
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {active ? (
                    <motion.div
                      key={`${href}-active`}
                      {...getTransitionProps(true)}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon size={20} />
                      </motion.div>
                      <motion.span
                        className="text-xs mt-1 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {label}
                      </motion.span>
                      {/* Active indicator */}
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#6c5ce7] rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`${href}-inactive`}
                      initial={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon size={20} />
                      </motion.div>
                      <span className="text-xs mt-1">{label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}