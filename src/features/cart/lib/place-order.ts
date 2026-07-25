import { createClient } from "@/lib/supabase/client";
import type { CheckoutInput } from "@/lib/validations/cart";
import type { CartItem, PlaceOrderResult } from "@/types/cart";

export async function placeOrder(
  businessId: string,
  items: CartItem[],
  values: CheckoutInput,
): Promise<PlaceOrderResult> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("place_order", {
    p_business_id: businessId,
    p_customer_name: values.customerName,
    p_customer_phone: values.customerPhone,
    p_customer_address: values.customerAddress || null,
    p_notes: values.notes || null,
    p_items: items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = (
    data as
      | {
          order_id: string;
          order_number: number;
          subtotal: number;
          delivery_fee: number;
          total_amount: number;
        }[]
      | null
  )?.[0];

  if (!row) {
    throw new Error("Failed to place order");
  }

  return {
    orderId: row.order_id,
    orderNumber: row.order_number,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    totalAmount: row.total_amount,
  };
}
