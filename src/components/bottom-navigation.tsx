import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Sparkles,
  Clapperboard,
  PlayCircle,
  Users,
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
  { href: "/friends", label: "Friends", icon: Users },
];

// Updated colorMap with gradient colors for labels
const labelColorMap: Record<
  string,
  { from: string; to: string } | string
> = {
  "/home": { from: "#b56bbc", to: "#7a71c4" },
  "/watch-list": { from: "#ff968b", to: "#ff2251" },
  "/watch-room": { from: "#15F5FD ", to: "#036CDA" },
  "/suggest": { from: "#ff7db8", to: "#ee2a7b" },
  "/friends": { from: "#B3EB50", to: "#1ea896" },
};

// "/watch-list": { from: "#FBF362", to: "#F3CE42" },
// "/watch-room": { from: "#ff968b ", to: "#ff2251" },
// "/suggest": { from: "#15F5FD", to: "#036CDA" },
// "/friends": { from: "#ff7db8", to: "#ee2a7b" },
// "/home": { from: "#b56bbc", to: "#7a71c4" },
// "/watch-list": { from: "#d09292", to: "#c82270" },
// "/watch-room": { from: "#ff968b ", to: "#ff2251" },
// "/suggest": { from: "#29f19c", to: "#02a1f9" },
// "/friends": { from: "#facc22", to: "#f83600" },
// "/suggest": { from: "#fedc45", to: "#fb7099" },
// "/friends": { from: "#f2b7a8", to: "#de91d6" },
// "/suggest": { from: "#43b7fe", to: "#0ae9fe" },
// "/watch-room": { from: "#2dffeb", to: "#9bffb7" },
// from-[#b56bbc] to-[#7a71c4]
// Separate solid colors for icons
const iconColorMap: Record<string, string> = {
  "/home": "#b56bbc",
  "/watch-list": "#ff968b",
  "/watch-room": "#15F5FD",
  "/suggest": "#ee2a7b",
  "/friends": "#B3EB50",
};

export function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const router = useRouter();
  const { setDirection } = usePageTransition();
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [animDirection, setAnimDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    if (previousPath && previousPath !== currentPath) {
      const prevIndex = navItems.findIndex((item) => item.href === previousPath);
      const currentIndex = navItems.findIndex((item) => item.href === currentPath);
      if (prevIndex !== -1 && currentIndex !== -1) {
        setAnimDirection(currentIndex > prevIndex ? "right" : "left");
      }
    }
    setPreviousPath(currentPath);
  }, [currentPath, previousPath]);

  const handleNavigation = (href: string, event: React.MouseEvent) => {
    event.preventDefault();

    const currentIndex = navItems.findIndex((item) => item.href === currentPath);
    const targetIndex = navItems.findIndex((item) => item.href === href);

    if (currentIndex !== -1 && targetIndex !== -1) {
      const direction = targetIndex > currentIndex ? "right" : "left";
      setDirection(direction);
    }

    router.push(href);
  };

  const isActive = (path: string) => currentPath === path;

  const getTransitionProps = (isActive: boolean) => {
    if (!isActive) return {};

    const exitX = animDirection === "right" ? -50 : 50;
    const enterX = animDirection === "right" ? 50 : -50;

    return {
      initial: { x: enterX, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: exitX, opacity: 0 },
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    };
  };

  const getGradientStyle = (colorValue: { from: string; to: string } | string) => {
    if (typeof colorValue === "object") {
      return {
        background: `linear-gradient(to right, ${colorValue.from}, ${colorValue.to})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      };
    }
    return { color: colorValue };
  };

  const getIconStyle = (href: string) => {
    return { color: iconColorMap[href] };
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/100 to-black/0 z-50 h-26">
      <div className="flex justify-around items-end h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const labelColorValue = labelColorMap[href];
          const isGradient = typeof labelColorValue === "object";
          const labelGradientStyle = active ? getGradientStyle(labelColorValue) : {};
          const iconStyle = active ? getIconStyle(href) : {};

          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNavigation(href, e)}
              className={`relative flex flex-col items-center p-2 transition-colors duration-200 ${active ? "font-semibold" : "text-white"
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
                        style={iconStyle}
                      >
                        <Icon size={20} />
                      </motion.div>
                      <motion.span
                        className="text-xs mt-1 font-semibold"
                        style={labelGradientStyle}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {label}
                      </motion.span>
                      <motion.div
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{
                          backgroundColor: isGradient
                            ? (labelColorValue as { from: string; to: string }).from
                            : (labelColorValue as string),
                        }}
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