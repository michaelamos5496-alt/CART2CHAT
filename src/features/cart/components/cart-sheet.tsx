"use client";

import * as React from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartCheckoutForm } from "@/features/cart/components/cart-checkout-form";
import { CartEmptyState } from "@/features/cart/components/cart-empty-state";
import { CartSuccessView } from "@/features/cart/components/cart-success-view";
import { CartTriggerButton } from "@/features/cart/components/cart-trigger-button";
import { useCart } from "@/features/cart/lib/cart-context";
import { placeOrder } from "@/features/cart/lib/place-order";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/features/cart/lib/whatsapp";
import type { CheckoutInput } from "@/lib/validations/cart";
import type { PlaceOrderResult } from "@/types/cart";

// How long the success screen is shown before we hand off to WhatsApp, so
// the confirmation isn't skipped entirely by an instant redirect.
const AUTO_REDIRECT_DELAY_MS = 1200;

export function CartSheet() {
  const cart = useCart();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [completedOrder, setCompletedOrder] =
    React.useState<PlaceOrderResult | null>(null);
  const [whatsappUrl, setWhatsappUrl] = React.useState<string | null>(null);
  const redirectTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  function clearScheduledRedirect() {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
  }

  function handleOpenChange(open: boolean) {
    cart.setIsOpen(open);
    if (!open) {
      clearScheduledRedirect();
      // Wait for the close animation before resetting back to the cart
      // view, so the success screen doesn't visibly flash away mid-close.
      setTimeout(() => {
        setCompletedOrder(null);
        setWhatsappUrl(null);
        setFormError(null);
      }, 300);
    }
  }

  async function handleSubmit(values: CheckoutInput) {
    setFormError(null);
    setIsSubmitting(true);

    try {
      const order = await placeOrder(cart.businessId, cart.items, values);

      const message = buildWhatsAppMessage(cart.whatsappMessageTemplate, {
        businessName: cart.businessName,
        orderNumber: order.orderNumber,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        address: values.customerAddress ?? "",
        notes: values.notes ?? "",
        items: cart.items,
        currency: cart.currency,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.totalAmount,
      });

      const url = buildWhatsAppUrl(cart.whatsappNumber, message);
      setWhatsappUrl(url);
      setCompletedOrder(order);
      cart.clear();

      // Open WhatsApp automatically after a brief pause so the success
      // state is still visible. A same-tab location change (rather than
      // window.open) so it isn't treated as a blocked popup — and the
      // success view keeps a manual button as a fallback either way.
      redirectTimeoutRef.current = setTimeout(() => {
        window.location.href = url;
      }, AUTO_REDIRECT_DELAY_MS);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to place order",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={cart.isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<CartTriggerButton />} />
      <SheetContent className="flex flex-col gap-0 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>
            {completedOrder ? "Order placed" : "Your cart"}
          </SheetTitle>
        </SheetHeader>

        {completedOrder && whatsappUrl ? (
          <CartSuccessView
            order={completedOrder}
            currency={cart.currency}
            whatsappUrl={whatsappUrl}
            onContinue={() => {
              clearScheduledRedirect();
              handleOpenChange(false);
            }}
          />
        ) : cart.items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <CartCheckoutForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            formError={formError}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
