"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/lib/cart-context";

export function AddToCartSection({
  productId,
  name,
  slug,
  price,
  imagePath,
  isAvailable,
}: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imagePath: string | null;
  isAvailable: boolean;
}) {
  const { addItem, setIsOpen } = useCart();
  const [quantity, setQuantity] = React.useState(1);

  function handleAdd() {
    addItem({ productId, name, slug, price, imagePath }, quantity);
    toast.success(`${name} added to cart`);
    setQuantity(1);
    setIsOpen(true);
  }

  if (!isAvailable) {
    return (
      <Button disabled className="w-fit">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="border-input flex items-center gap-1 rounded-md border">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="hover:bg-muted flex size-9 items-center justify-center rounded-l-md"
          aria-label="Decrease quantity"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-6 text-center text-sm tabular-nums">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="hover:bg-muted flex size-9 items-center justify-center rounded-r-md"
          aria-label="Increase quantity"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <Button onClick={handleAdd}>
        <ShoppingBag />
        Add to cart
      </Button>
    </div>
  );
}
