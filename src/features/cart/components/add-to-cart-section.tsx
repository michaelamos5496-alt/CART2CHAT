"use client";

import * as React from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/lib/cart-context";
import { resolveCssColor } from "@/lib/css-color";
import { cn } from "@/lib/utils";
import type { ProductOptionWithValues } from "@/types/catalog";

// Shopify-style variant pickers: an option renders as color swatches only
// when its own values are actually recognizable CSS colors (not by
// hardcoding "this category gets swatches") — so it adapts to whatever an
// individual product's options happen to be, whether that's Color/Size on
// a fashion item or Flavor/Spice level on a bakery item, with no per-shop
// configuration needed.
function OptionValueButton({
  value,
  isSelected,
  onSelect,
}: {
  value: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const swatchColor = resolveCssColor(value);

  if (swatchColor) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        aria-label={value}
        title={value}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-full border-2 transition-colors",
          isSelected
            ? "border-primary"
            : "border-transparent hover:border-muted-foreground/30",
        )}
      >
        <span
          className="ring-border size-7 rounded-full ring-1 ring-inset"
          style={{ backgroundColor: swatchColor }}
        />
        {isSelected && (
          <Check
            className={cn(
              "absolute size-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]",
              swatchColor === "white" || swatchColor === "#fff" || swatchColor === "#ffffff"
                ? "text-black"
                : "text-white",
            )}
          />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        "min-w-10 rounded-md border px-3 py-1.5 text-center text-sm font-medium transition-colors",
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input hover:border-muted-foreground/50 hover:bg-muted",
      )}
    >
      {value}
    </button>
  );
}

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
          <span className="text-sm font-medium">
            {option.name}
            {selectedValues[option.id] && (
              <span className="text-muted-foreground font-normal">
                {" — "}
                {selectedValues[option.id]}
              </span>
            )}
          </span>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => (
              <OptionValueButton
                key={value.id}
                value={value.value}
                isSelected={selectedValues[option.id] === value.value}
                onSelect={() =>
                  setSelectedValues((prev) => ({
                    ...prev,
                    [option.id]: value.value,
                  }))
                }
              />
            ))}
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
