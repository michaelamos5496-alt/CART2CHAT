import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/types/order";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    throw new Error(error.message);
  }
}
