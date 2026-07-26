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
import type { Category } from "@/types/catalog";

// Two phases on one page/URL, no navigation in between: fill in the
// product's details, then (now that a product row — and therefore a valid
// product_id for images to attach to — exists) add photos immediately,
// rather than redirecting away to a separate edit screen.
export function ProductCreateFlow({
  businessId,
  categories,
}: {
  businessId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [created, setCreated] = React.useState<{ id: string } | null>(null);

  if (created) {
    return (
      <Card className="lg:max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Add photos</CardTitle>
          <CardDescription>
            The first image is used as the storefront thumbnail. You can skip
            this and add photos later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductImageManager
            businessId={businessId}
            productId={created.id}
            initialImages={[]}
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => router.push(`/dashboard/products/${created.id}/edit`)}
          >
            Done
          </Button>
        </CardFooter>
      </Card>
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
