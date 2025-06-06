// app/ClientWrapper.tsx
"use client";

import useFetchUserDetails from "@/hooks/useFetchUserDetails";
import { motion } from "framer-motion";

const RedirectLoading = () => (
  <motion.div
    className="flex items-center justify-center min-h-screen bg-[#181826]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  />
);

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRedirecting } = useFetchUserDetails();

  if (isRedirecting) {
    return <RedirectLoading />;
  }

  return <main className="bg-[#181826] mb-18 pt-6">{children}</main>;
}
