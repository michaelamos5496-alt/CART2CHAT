import { formatCurrency } from "@/lib/format";
import type { CartItem } from "@/types/cart";

// "• Product A x2" per line, matching the requested message format —
// deliberately no per-item price, just name and quantity.
function formatItemsList(items: CartItem[]): string {
  return items.map((item) => `• ${item.name} x${item.quantity}`).join("\n");
}

export function buildWhatsAppMessage(
  template: string,
  values: {
    businessName: string;
    orderNumber: number;
    customerName: string;
    customerPhone: string;
    address: string;
    notes: string;
    items: CartItem[];
    currency: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
  },
): string {
  const replacements: Record<string, string> = {
    business_name: values.businessName,
    order_number: values.orderNumber.toString(),
    customer_name: values.customerName,
    customer_phone: values.customerPhone,
    items: formatItemsList(values.items),
    subtotal: formatCurrency(values.subtotal, values.currency),
    delivery_fee:
      values.deliveryFee > 0
        ? formatCurrency(values.deliveryFee, values.currency)
        : "Free",
    total: formatCurrency(values.total, values.currency),
    address: values.address || "Not provided",
    notes: values.notes || "None",
  };

  return Object.entries(replacements).reduce(
    (message, [key, value]) => message.replaceAll(`{{${key}}}`, value),
    template,
  );
}

// wa.me expects digits only (no "+", spaces, or punctuation), and the
// message must be URL-encoded exactly once — the template stores literal
// newlines rather than pre-encoded "%0A" so this is the only encoding pass.
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
