export interface SelectedOption {
  name: string;
  value: string;
}

export interface CartItem {
  // Unique per product+selected-options combination, so two variants of
  // the same product (e.g. Size M vs Size L) are separate line items
  // instead of merging into one. Equal to productId when there are no
  // selected options.
  cartItemKey: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  imagePath: string | null;
  selectedOptions: SelectedOption[];
}

export interface PlaceOrderResult {
  orderId: string;
  orderNumber: number;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
}
