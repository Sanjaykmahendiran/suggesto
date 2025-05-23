import Link from "next/link"
import {
  Home,
  Sparkles,
  Clapperboard,
  UserCircle,
  PlayCircle,
} from "lucide-react";

interface BottomNavigationProps {
  currentPath: string
}

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/watch-now", label: "Watch Now", icon: PlayCircle },
  { href: "/watch-room", label: "Watch Room", icon: Clapperboard },
  { href: "/suggest", label: "Suggest", icon: Sparkles },
  { href: "/profile", label: "My Profile", icon: UserCircle },
];

export function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const isActive = (path: string) => currentPath === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center p-2 ${isActive(href) ? "text-[#6c5ce7]" : "text-slate-400"
              }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
