export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imagePath: string | null;
}

export interface PlaceOrderResult {
  orderId: string;
  orderNumber: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
}
