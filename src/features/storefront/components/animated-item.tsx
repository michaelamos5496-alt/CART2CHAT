"use client";

import { motion } from "framer-motion";

export function AnimatedItem({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index, 8) * 0.05,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
