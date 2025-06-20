import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

import { UserProvider } from "@/contexts/UserContext"
import { PageTransitionProvider } from "@/components/PageTransition"


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Suggesto",
  description: "AI-Powered Movie Recommendation System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (

    <html lang="en">
      <body className={`${inter.className} `}>
        <PageTransitionProvider>
          <UserProvider>
            <main className="bg-[#181826] mb-18 pt-6">{children}</main>
          </UserProvider>
        </PageTransitionProvider>
      </body>
    </html >

  )
}
