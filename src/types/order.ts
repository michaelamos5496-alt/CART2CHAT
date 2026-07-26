export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export interface Order {
  id: string;
  order_number: number;
  business_id: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  notes: string | null;
  currency: string;
  delivery_fee: number;
  total_amount: number;
  whatsapp_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  business_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  selected_options: { name: string; value: string }[];
  created_at: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  business_id: string;
  status: OrderStatus;
  changed_at: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  history: OrderStatusHistoryEntry[];
}
