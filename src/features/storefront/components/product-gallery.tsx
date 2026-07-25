"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center rounded-xl">
        <ImageIcon className="size-10" />
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={productName}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              priority
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${productName} photo ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === activeIndex ? "border-primary" : "border-transparent",
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
