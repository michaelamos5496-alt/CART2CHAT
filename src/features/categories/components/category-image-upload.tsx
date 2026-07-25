"use client";

import * as React from "react";

import { ImageUpload } from "@/components/shared/image-upload";
import {
  getCategoryImageUrl,
  removeCategoryImage,
  uploadCategoryImage,
} from "@/features/categories/lib/mutations";

export function CategoryImageUpload({
  businessId,
  categoryId,
  initialImagePath,
}: {
  businessId: string;
  categoryId: string;
  initialImagePath: string | null;
}) {
  const [imagePath, setImagePath] = React.useState(initialImagePath);

  return (
    <ImageUpload
      imageUrl={imagePath ? getCategoryImageUrl(imagePath) : null}
      onUpload={async (file) => {
        const path = await uploadCategoryImage(
          businessId,
          categoryId,
          file,
          imagePath,
        );
        setImagePath(path);
      }}
      onRemove={async () => {
        if (!imagePath) return;
        await removeCategoryImage(categoryId, imagePath);
        setImagePath(null);
      }}
    />
  );
}
