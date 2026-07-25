"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteProductImage,
  getProductImageUrl,
  uploadProductImage,
} from "@/features/products/lib/mutations";
import { MAX_IMAGE_FILE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/catalog";

const MAX_IMAGES = 8;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function ProductImageManager({
  businessId,
  productId,
  initialImages,
}: {
  businessId: string;
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = React.useState(initialImages);
  const [isUploading, setIsUploading] = React.useState(false);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const remainingSlots = MAX_IMAGES - images.length;

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).slice(0, remainingSlots);
    if (fileList.length > remainingSlots) {
      toast.error(
        `You can only add ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}.`,
      );
    }

    const validFiles = files.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} isn't a supported image type.`);
        return false;
      }
      if (file.size > MAX_IMAGE_FILE_SIZE) {
        toast.error(`${file.name} is larger than 15MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    let uploaded = 0;
    let nextSortOrder = images.length;

    for (const file of validFiles) {
      try {
        const image = await uploadProductImage(
          businessId,
          productId,
          file,
          nextSortOrder,
        );
        setImages((prev) => [...prev, image]);
        nextSortOrder += 1;
        uploaded += 1;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to upload ${file.name}`,
        );
      }
    }

    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (uploaded > 0) {
      toast.success(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded`);
    }
  }

  async function handleConfirmDelete() {
    const image = images.find((img) => img.id === pendingDeleteId);
    if (!image) return;

    setDeletingId(image.id);
    setPendingDeleteId(null);

    try {
      await deleteProductImage(image);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      toast.success("Image removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove image",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="bg-muted relative aspect-square overflow-hidden rounded-lg border"
          >
            <Image
              src={getProductImageUrl(image.storage_path)}
              alt={`Product image ${index + 1}`}
              fill
              sizes="200px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setPendingDeleteId(image.id)}
              disabled={deletingId === image.id}
              className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-50"
              aria-label="Remove image"
            >
              {deletingId === image.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <X className="size-3.5" />
              )}
            </button>
          </div>
        ))}

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "border-input text-muted-foreground hover:bg-muted hover:text-foreground flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-xs transition-colors disabled:opacity-50",
            )}
          >
            {isUploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImagePlus className="size-5" />
            )}
            {isUploading ? "Uploading..." : "Add image"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      <p className="text-muted-foreground text-xs">
        {images.length}/{MAX_IMAGES} images · PNG, JPEG or WebP, up to 15MB
        each.
      </p>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this image?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. The image will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
