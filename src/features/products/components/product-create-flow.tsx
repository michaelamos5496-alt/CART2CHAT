"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductImageManager } from "@/features/products/components/product-image-manager";
import { ProductOptionsManager } from "@/features/products/components/product-options-manager";
import type { Category } from "@/types/catalog";
import type { BusinessCategory } from "@/types/business";

// Two phases on one page/URL, no navigation in between: fill in the
// product's details, then (now that a product row — and therefore a valid
// product_id for images/options to attach to — exists) add photos and
// options immediately, rather than redirecting away to a separate edit
// screen.
export function ProductCreateFlow({
  businessId,
  businessCategory,
  categories,
}: {
  businessId: string;
  businessCategory: BusinessCategory;
  categories: Category[];
}) {
  const router = useRouter();
  const [created, setCreated] = React.useState<{ id: string } | null>(null);

  if (created) {
    return (
      <div className="grid gap-4 lg:max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add photos</CardTitle>
            <CardDescription>
              The first image is used as the storefront thumbnail. You can
              skip this and add photos later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductImageManager
              businessId={businessId}
              productId={created.id}
              initialImages={[]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Options</CardTitle>
            <CardDescription>
              Sizes, colors, or anything else customers need to choose before
              ordering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductOptionsManager
              businessId={businessId}
              productId={created.id}
              initialOptions={[]}
              businessCategory={businessCategory}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={() =>
                router.push(`/dashboard/products/${created.id}/edit`)
              }
            >
              Done
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Card className="lg:max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Product details</CardTitle>
        <CardDescription>
          Required to list this product on your storefront.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProductForm
          businessId={businessId}
          categories={categories}
          onCreated={setCreated}
        />
      </CardContent>
    </Card>
  );
}
