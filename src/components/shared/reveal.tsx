"use client";

import { motion } from "framer-motion";

// Scroll-triggered fade/slide reveal for marketing sections. Deliberately
// separate from the storefront's AnimatedItem (which is index-staggered for
// grid items) — this one is for standalone section/card entrances.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
