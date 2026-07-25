import { ShoppingBag } from "lucide-react";

export function CartEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <ShoppingBag className="text-muted-foreground size-6" />
      </div>
      <div>
        <p className="font-medium">Your cart is empty</p>
        <p className="text-muted-foreground text-sm">
          Add products to get started.
        </p>
      </div>
    </div>
  );
}
