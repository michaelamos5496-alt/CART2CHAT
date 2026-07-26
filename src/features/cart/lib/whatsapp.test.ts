import { describe, expect, it } from "vitest";

import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/features/cart/lib/whatsapp";
import type { CartItem } from "@/types/cart";

const items: CartItem[] = [
  {
    cartItemKey: "p1",
    productId: "p1",
    name: "Widget",
    slug: "widget",
    price: 10,
    quantity: 2,
    imagePath: null,
    selectedOptions: [],
  },
  {
    cartItemKey: "p2::Color=Blue",
    productId: "p2",
    name: "Gadget",
    slug: "gadget",
    price: 5,
    quantity: 1,
    imagePath: null,
    selectedOptions: [{ name: "Color", value: "Blue" }],
  },
];

const TEMPLATE =
  "New order from {{customer_name}}:\n{{items}}\n\nSubtotal: {{subtotal}}\nDelivery: {{delivery_fee}}\nTotal: {{total}}\nAddress: {{address}}\nNotes: {{notes}}";

describe("buildWhatsAppMessage", () => {
  it("substitutes every template placeholder", () => {
    const message = buildWhatsAppMessage(TEMPLATE, {
      businessName: "Cart-2-Chat Test Store",
      orderNumber: 42,
      customerName: "Ada Lovelace",
      customerPhone: "+15551234567",
      address: "123 Main St",
      notes: "Ring the bell",
      items,
      currency: "USD",
      subtotal: 25,
      deliveryFee: 5,
      total: 30,
    });

    expect(message).toContain("Ada Lovelace");
    expect(message).toContain("• Widget x2");
    expect(message).toContain("• Gadget (Color: Blue) x1");
    expect(message).toContain("123 Main St");
    expect(message).toContain("Ring the bell");
    expect(message).not.toContain("{{");
  });

  it("falls back to 'Free' for a zero delivery fee", () => {
    const message = buildWhatsAppMessage("{{delivery_fee}}", {
      businessName: "Store",
      orderNumber: 1,
      customerName: "Test",
      customerPhone: "123",
      address: "",
      notes: "",
      items,
      currency: "USD",
      subtotal: 10,
      deliveryFee: 0,
      total: 10,
    });

    expect(message).toBe("Free");
  });

  it("falls back to placeholder text for empty address/notes", () => {
    const message = buildWhatsAppMessage("{{address}} / {{notes}}", {
      businessName: "Store",
      orderNumber: 1,
      customerName: "Test",
      customerPhone: "123",
      address: "",
      notes: "",
      items,
      currency: "USD",
      subtotal: 10,
      deliveryFee: 0,
      total: 10,
    });

    expect(message).toBe("Not provided / None");
  });
});

describe("buildWhatsAppUrl", () => {
  it("strips non-digit characters from the phone number", () => {
    const url = buildWhatsAppUrl("+1 (555) 123-4567", "hello");
    expect(url).toBe("https://wa.me/15551234567?text=hello");
  });

  it("URL-encodes the message exactly once", () => {
    const url = buildWhatsAppUrl("15551234567", "line one\nline two & more");
    expect(url).toBe(
      "https://wa.me/15551234567?text=" +
        encodeURIComponent("line one\nline two & more"),
    );
  });
});
