"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/lib/cart-context";
import { cn } from "@/lib/utils";

// SheetTrigger (base-ui Dialog.Trigger) merges its click handler and ARIA
// attributes onto whatever element its `render` prop points at — that only
// reaches the real <button> if this component actually forwards the props
// it's given. Dropping them (as a bare `function CartTriggerButton()` with
// no props does) makes the trigger visually present but inert: the click
// handler that opens the sheet never gets attached.
export function CartTriggerButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { itemCount } = useCart();

  return (
    <Button variant="ghost" size="icon" className={cn("relative", className)} {...props}>
      <ShoppingBag />
      <span className="sr-only">Open cart</span>
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full text-[10px] font-medium"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
