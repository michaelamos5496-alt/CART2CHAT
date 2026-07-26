"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { useCart } from "@/features/cart/lib/cart-context";
import { formatCurrency } from "@/lib/format";
import { BUCKETS, getPublicImageUrl } from "@/lib/storage";
import type { StorefrontProduct } from "@/types/catalog";

export function ProductCard({
  product,
  storeSlug,
  currency,
}: {
  product: StorefrontProduct;
  storeSlug: string;
  currency: string;
}) {
  const { addItem } = useCart();

  function handleQuickAdd(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imagePath: product.primaryImagePath,
    });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <Link
      href={`/store/${storeSlug}/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
    >
      <div className="bg-muted relative aspect-square overflow-hidden">
        {product.primaryImagePath ? (
          <Image
            src={getPublicImageUrl(
              BUCKETS.productImages,
              product.primaryImagePath,
            )}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <ImageIcon className="size-8" />
          </div>
        )}
        {product.is_featured && (
          <Badge className="absolute top-2 left-2">Featured</Badge>
        )}
        {!product.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="outline" className="border-white text-white">
              Out of stock
            </Badge>
          </div>
        )}
        {product.is_available && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="bg-background text-foreground hover:bg-primary hover:text-primary-foreground absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full border shadow-sm transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
      <div className="grid gap-0.5 p-3">
        <span className="truncate text-sm font-medium">{product.name}</span>
        <span className="text-muted-foreground text-sm">
          {formatCurrency(product.price, currency)}
        </span>
      </div>
    </Link>
  );
}
