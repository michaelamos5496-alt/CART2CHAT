import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCategories } from "@/features/categories/lib/queries";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductImageManager } from "@/features/products/components/product-image-manager";
import { getProductWithImages } from "@/features/products/lib/queries";

export const metadata: Metadata = {
  title: "Edit product",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getOwnBusiness();
  if (!business) return null;

  const [result, categories] = await Promise.all([
    getProductWithImages(business.id, id),
    getCategories(business.id),
  ]);

  if (!result) {
    notFound();
  }

  const { product, images } = result;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit product</h1>
        <p className="text-muted-foreground text-sm">{product.name}</p>
      </div>

      <div className="grid gap-4 lg:max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Images</CardTitle>
            <CardDescription>
              The first image is used as the storefront thumbnail.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageManager
              businessId={business.id}
              productId={product.id}
              initialImages={images}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              businessId={business.id}
              categories={categories}
              product={product}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
