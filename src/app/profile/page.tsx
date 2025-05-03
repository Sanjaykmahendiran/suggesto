import { BottomNavigation } from "@/components/bottom-navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 pb-22">
      <header className="p-4">
        <h1 className="text-xl font-bold">Setting</h1>
      </header>

      <main className="flex-1 px-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden">
            <img src="/placeholder.svg?height=64&width=64" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-semibold">Andy Lexsian</h2>
            <p className="text-sm text-slate-400">@Andy1999</p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-medium mb-2">Personal Info</h3>
            <div className="space-y-1">
              <Link href="/profile/edit" className="flex items-center justify-between p-3 ">
                <span>Profile</span>
                <ChevronRight />
              </Link>
              <Link href="/profile/wishlist" className="flex items-center justify-between p-3 ">
                <span>Wishlist</span>
                <ChevronRight />
              </Link>
              <Link href="/profile/payment" className="flex items-center justify-between p-3 ">
                <span>Payment Method</span>
                <ChevronRight />
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">Security</h3>
            <div className="space-y-1">
              <Link
                href="/profile/change-password"
                className="flex items-center justify-between p-3 "
              >
                <span>Change Password</span>
                <ChevronRight />
              </Link>
              <Link
                href="/profile/forgot-password"
                className="flex items-center justify-between p-3 "
              >
                <span>Forgot Password</span>
                <ChevronRight />
              </Link>
              <Link href="/profile/security" className="flex items-center justify-between p-3 ">
                <span>Security</span>
                <ChevronRight />
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">General</h3>
            <div className="space-y-1">
              <Link href="/profile/language" className="flex items-center justify-between p-3 ">
                <span>Language</span>
                <ChevronRight />
              </Link>
              <Link href="pricing" className="flex items-center justify-between p-3 ">
                <span>Pricing</span>
                <ChevronRight />
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-2">About</h3>
            <div className="space-y-1">
              <Link
                href="/profile/clear-cache"
                className="flex items-center justify-between p-3 "
              >
                <span>Clear Cache</span>
                <ChevronRight />
              </Link>
              <Link href="/profile/legal" className="flex items-center justify-between p-3 ">
                <span>Legal and Policies</span>
                <ChevronRight />
              </Link>
              <Link href="/profile/help" className="flex items-center justify-between p-3 ">
                <span>Help & Support</span>
                <ChevronRight />
              </Link>
            </div>
          </section>

          <div className="flex items-center justify-between p-3 ">
            <span>Dark Mode</span>
            <Switch defaultChecked />
          </div>

          <Button variant="destructive" className="w-full">
            Log Out
          </Button>
        </div>
      </main>

      <BottomNavigation currentPath="/profile" />
    </div>
  )
}
