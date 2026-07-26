"use client";

import * as React from "react";

import type { CartItem, SelectedOption } from "@/types/cart";

interface CartBusinessContext {
  businessId: string;
  businessName: string;
  storeSlug: string;
  whatsappNumber: string;
  currency: string;
  deliveryFee: number;
  whatsappMessageTemplate: string;
}

// Two lines are the "same" cart item only if both the product AND every
// selected option match — Size M and Size L of the same product are
// different lines. Order-independent (sorted by name) so selecting
// Color-then-Size vs Size-then-Color still dedupes correctly.
function buildCartItemKey(
  productId: string,
  selectedOptions: SelectedOption[],
): string {
  if (selectedOptions.length === 0) return productId;
  const sorted = [...selectedOptions].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return `${productId}::${sorted.map((o) => `${o.name}=${o.value}`).join("|")}`;
}

type NewCartItem = Omit<CartItem, "cartItemKey" | "quantity" | "selectedOptions"> & {
  selectedOptions?: SelectedOption[];
};

interface CartContextValue extends CartBusinessContext {
  items: CartItem[];
  isHydrated: boolean;
  addItem: (item: NewCartItem, quantity?: number) => void;
  removeItem: (cartItemKey: string) => void;
  increment: (cartItemKey: string) => void;
  decrement: (cartItemKey: string) => void;
  clear: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

function readStoredCart(storageKey: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
  ...business
}: CartBusinessContext & { children: React.ReactNode }) {
  const storageKey = `orderflow:cart:${business.businessId}`;
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setItems(readStoredCart(storageKey));
    setIsHydrated(true);
  }, [storageKey]);

  React.useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, isHydrated, storageKey]);

  const addItem = React.useCallback(
    (item: NewCartItem, quantity = 1) => {
      const selectedOptions = item.selectedOptions ?? [];
      const cartItemKey = buildCartItemKey(item.productId, selectedOptions);

      setItems((prev) => {
        const existing = prev.find((i) => i.cartItemKey === cartItemKey);
        if (existing) {
          return prev.map((i) =>
            i.cartItemKey === cartItemKey
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, { ...item, selectedOptions, cartItemKey, quantity }];
      });
    },
    [],
  );

  const removeItem = React.useCallback((cartItemKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemKey !== cartItemKey));
  }, []);

  const increment = React.useCallback((cartItemKey: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.cartItemKey === cartItemKey ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );
  }, []);

  const decrement = React.useCallback((cartItemKey: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.cartItemKey === cartItemKey
          ? { ...i, quantity: Math.max(1, i.quantity - 1) }
          : i,
      ),
    );
  }, []);

  const clear = React.useCallback(() => setItems([]), []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + business.deliveryFee;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const value: CartContextValue = {
    ...business,
    items,
    isHydrated,
    addItem,
    removeItem,
    increment,
    decrement,
    clear,
    subtotal,
    total,
    itemCount,
    isOpen,
    setIsOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
