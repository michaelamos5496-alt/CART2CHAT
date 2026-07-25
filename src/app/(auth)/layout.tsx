"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-svh flex-1 items-center justify-center overflow-hidden p-4 sm:p-6">
      <div
        aria-hidden
        className="from-primary/10 pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,var(--tw-gradient-from),transparent)]"
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold"
        >
          {siteConfig.name}
        </Link>
        {children}
      </motion.div>
    </div>
  );
}
