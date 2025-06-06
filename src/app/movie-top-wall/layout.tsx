import type React from "react";
import { Inter } from "next/font/google";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={`${inter.className} bg-[#181826]`}>
        <Suspense fallback={<div className="text-white p-4"></div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
