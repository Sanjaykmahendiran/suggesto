import type React from "react";
import { Overpass } from "next/font/google";
import { Suspense } from "react";

const overpass = Overpass({ subsets: ["latin"] });

export const metadata = {
  title: "Suggesto",
  description: "AI-Powered Movie Recommendation System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="no-scrollbar">
      <body className={`${overpass.className} `}>
        <Suspense fallback={<div className="text-white"></div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
