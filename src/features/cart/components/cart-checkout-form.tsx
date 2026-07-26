"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthErrorAlert } from "@/features/auth/components/auth-error-alert";
import { CartLineItem } from "@/features/cart/components/cart-line-item";
import { useCart } from "@/features/cart/lib/cart-context";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/cart";
import { formatCurrency } from "@/lib/format";
import type { BusinessCategory } from "@/types/business";

// Since there's no structured per-product option picker, this note is the
// only place a customer can specify a variant — so its placeholder nudges
// them toward what actually matters for the kind of shop it is. Fashion
// shops need type/size/color specified most often, so they get a more
// pointed example; other categories get a lighter, generic nudge.
const NOTES_PLACEHOLDER: Record<BusinessCategory, string> = {
  fashion_apparel:
    "e.g. Type: dress, Size: M, Color: black. Anything else the seller should know.",
  food_beverage: "e.g. Spice level, flavor, or allergy notes",
  beauty_cosmetics: "e.g. Shade or scent preference",
  electronics: "e.g. Color or storage size preference",
  home_living: "e.g. Size, color, or material preference",
  jewelry_accessories: "e.g. Size or metal preference",
  health_wellness: "e.g. Strength or size preference",
  other: "Anything the seller should know",
};

export function CartCheckoutForm({
  onSubmit,
  isSubmitting,
  formError,
}: {
  onSubmit: (values: CheckoutInput) => void;
  isSubmitting: boolean;
  formError: string | null;
}) {
  const { items, subtotal, deliveryFee, total, currency, businessCategory } =
    useCart();

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid gap-4 py-2">
            {items.map((item) => (
              <CartLineItem key={item.productId} item={item} />
            ))}
          </div>

          <div className="my-4 grid gap-1.5 border-t pt-4 text-sm">
            <div className="text-muted-foreground flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Delivery</span>
              <span>
                {deliveryFee > 0
                  ? formatCurrency(deliveryFee, currency)
                  : "Free"}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>

          <div className="grid gap-4 border-t pt-4 pb-4">
            <AuthErrorAlert message={formError} />
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+15551234567"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery address (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Leave blank for pickup"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder={NOTES_PLACEHOLDER[businessCategory]}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="border-t p-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting
              ? "Placing order..."
              : `Place order · ${formatCurrency(total, currency)}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
