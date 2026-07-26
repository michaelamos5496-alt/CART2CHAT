"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/lib/cart-context";
import type { ProductOptionWithValues } from "@/types/catalog";

export function AddToCartSection({
  productId,
  name,
  slug,
  price,
  imagePath,
  isAvailable,
  options,
}: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imagePath: string | null;
  isAvailable: boolean;
  options: ProductOptionWithValues[];
}) {
  const { addItem, setIsOpen } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  // option_id -> chosen value. Nothing pre-selected: the customer must
  // make an active choice for every option before adding to cart, rather
  // than silently defaulting to (and possibly ordering) the wrong variant.
  const [selectedValues, setSelectedValues] = React.useState<
    Record<string, string>
  >({});

  const allOptionsSelected = options.every(
    (option) => selectedValues[option.id],
  );

  function handleAdd() {
    const selectedOptions = options.map((option) => ({
      name: option.name,
      value: selectedValues[option.id],
    }));

    addItem(
      { productId, name, slug, price, imagePath, selectedOptions },
      quantity,
    );
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
    <div className="grid gap-4">
      {options.map((option) => (
        <div key={option.id} className="grid gap-2">
          <span className="text-sm font-medium">{option.name}</span>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedValues[option.id] === value.value;
              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() =>
                    setSelectedValues((prev) => ({
                      ...prev,
                      [option.id]: value.value,
                    }))
                  }
                  aria-pressed={isSelected}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-muted"
                  }`}
                >
                  {value.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

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
        <Button onClick={handleAdd} disabled={!allOptionsSelected}>
          <ShoppingBag />
          Add to cart
        </Button>
      </div>
      {options.length > 0 && !allOptionsSelected && (
        <p className="text-muted-foreground -mt-2 text-xs">
          Choose an option above to add this to your cart.
        </p>
      )}
    </div>
  );
}
