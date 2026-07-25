"use client";

import Image from "next/image";
import { ImageIcon, Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/features/cart/lib/cart-context";
import { formatCurrency } from "@/lib/format";
import { BUCKETS, getPublicImageUrl } from "@/lib/storage";
import type { CartItem } from "@/types/cart";

export function CartLineItem({ item }: { item: CartItem }) {
  const { increment, decrement, removeItem, currency } = useCart();

  return (
    <div className="flex gap-3">
      <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-lg border">
        {item.imagePath ? (
          <Image
            src={getPublicImageUrl(BUCKETS.productImages, item.imagePath)}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <ImageIcon className="size-5" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium">{item.name}</span>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="text-muted-foreground hover:text-destructive flex size-7 shrink-0 items-center justify-center"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="border-input flex items-center gap-2 rounded-md border">
            <button
              type="button"
              onClick={() => decrement(item.productId)}
              disabled={item.quantity <= 1}
              className="hover:bg-muted flex size-7 items-center justify-center rounded-l-md disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-4 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => increment(item.productId)}
              className="hover:bg-muted flex size-7 items-center justify-center rounded-r-md"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <span className="text-sm font-medium">
            {formatCurrency(item.price * item.quantity, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
