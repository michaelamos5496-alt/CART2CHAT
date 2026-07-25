import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOwnBusiness } from "@/features/business/lib/queries";
import { CategoryForm } from "@/features/categories/components/category-form";
import { CategoryImageUpload } from "@/features/categories/components/category-image-upload";
import { getCategory } from "@/features/categories/lib/queries";

export const metadata: Metadata = {
  title: "Edit category",
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getOwnBusiness();
  if (!business) return null;

  const category = await getCategory(business.id, id);
  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit category</h1>
        <p className="text-muted-foreground text-sm">{category.name}</p>
      </div>

      <div className="grid gap-4 lg:max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Image</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryImageUpload
              businessId={business.id}
              categoryId={category.id}
              initialImagePath={category.image_path}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category details</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm businessId={business.id} category={category} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
