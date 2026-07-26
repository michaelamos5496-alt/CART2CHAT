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
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryImageUpload } from "@/features/categories/components/category-image-upload";

// Same two-phase pattern as ProductCreateFlow: create the category first
// (an image needs a real category_id to attach to), then reveal the image
// upload inline on the same page instead of redirecting to /edit.
export function CategoryCreateFlow({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [created, setCreated] = React.useState<{ id: string } | null>(null);

  if (created) {
    return (
      <Card className="lg:max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Add an image</CardTitle>
          <CardDescription>
            Shown next to this category on your storefront. You can skip this
            and add one later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryImageUpload
            businessId={businessId}
            categoryId={created.id}
            initialImagePath={null}
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={() =>
              router.push(`/dashboard/categories/${created.id}/edit`)
            }
          >
            Done
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="lg:max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">Category details</CardTitle>
        <CardDescription>
          You can rename or hide this category later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CategoryForm businessId={businessId} onCreated={setCreated} />
      </CardContent>
    </Card>
  );
}
