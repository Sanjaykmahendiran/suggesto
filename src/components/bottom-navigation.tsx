import Link from "next/link"

interface BottomNavigationProps {
  currentPath: string
}

export function BottomNavigation({ currentPath }: BottomNavigationProps) {
  const isActive = (path: string) => currentPath === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 py-2">
      <div className="flex justify-around items-center">
        <Link
          href="/home"
          className={`flex flex-col items-center p-2 ${isActive("/home") ? "text-[#6c5ce7]" : "text-slate-400"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-home"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          href="/playlist"
          className={`flex flex-col items-center p-2 ${isActive("/playlist") ? "text-[#6c5ce7]" : "text-slate-400"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-list"
          >
            <line x1="8" x2="21" y1="6" y2="6" />
            <line x1="8" x2="21" y1="12" y2="12" />
            <line x1="8" x2="21" y1="18" y2="18" />
            <line x1="3" x2="3.01" y1="6" y2="6" />
            <line x1="3" x2="3.01" y1="12" y2="12" />
            <line x1="3" x2="3.01" y1="18" y2="18" />
          </svg>
          <span className="text-xs mt-1">Play List</span>
        </Link>

        <Link
          href="/add-movie"
          className={`flex flex-col items-center p-2 ${isActive("/add-movie") ? "text-[#6c5ce7]" : "text-slate-400"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-film"
          >
            <path d="M2 3h20v18H2z" />
            <line x1="2" x2="22" y1="10" y2="10" />
            <line x1="2" x2="2" y1="3" y2="21" />
            <line x1="22" x2="22" y1="3" y2="21" />
          </svg>
          <span className="text-xs mt-1">Add Movie</span>
        </Link>


        <Link
          href="/discover"
          className={`flex flex-col items-center p-2 ${isActive("/discover") ? "text-[#6c5ce7]" : "text-slate-400"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-compass"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16 8 12 12 8 16 10 10 14 8" />
          </svg>
          <span className="text-xs mt-1">Discover</span>
        </Link>

        <Link
          href="/profile"
          className={`flex flex-col items-center p-2 ${isActive("/profile") ? "text-[#6c5ce7]" : "text-slate-400"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-user"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-xs mt-1">My Profile</span>
        </Link>
      </div>
    </div>
  )
}
