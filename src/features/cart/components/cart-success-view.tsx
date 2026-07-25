"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { PlaceOrderResult } from "@/types/cart";

export function CartSuccessView({
  order,
  currency,
  whatsappUrl,
  onContinue,
}: {
  order: PlaceOrderResult;
  currency: string;
  whatsappUrl: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
      >
        <CheckCircle2 className="size-8" />
      </motion.div>

      <div>
        <p className="text-lg font-semibold">
          Order #{order.orderNumber} placed
        </p>
        <p className="text-muted-foreground text-sm">
          Total: {formatCurrency(order.totalAmount, currency)}
        </p>
      </div>

      <p className="text-muted-foreground max-w-xs text-sm">
        Opening WhatsApp to confirm your order with the seller…
      </p>

      <Button
        className="w-full"
        render={
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" />
        }
      >
        <MessageCircle />
        Open WhatsApp now
      </Button>

      <Button variant="ghost" onClick={onContinue}>
        Continue shopping
      </Button>
    </div>
  );
}
