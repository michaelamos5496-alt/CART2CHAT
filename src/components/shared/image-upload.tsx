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
import { MAX_IMAGE_FILE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

// A self-contained, reusable single-image upload tile: preview, replace,
// and remove (with confirm), all driven by two async functions the caller
// supplies. Used for category images and business logo/banner — the only
// difference between those is sizing/shape and what onUpload/onRemove do.
export function ImageUpload({
  imageUrl,
  imageAlt = "Uploaded image preview",
  onUpload,
  onRemove,
  className,
  imageClassName,
  maxFileSize = MAX_IMAGE_FILE_SIZE,
  emptyLabel = "Upload image",
  replaceLabel = "Replace image",
  layout = "row",
}: {
  imageUrl: string | null;
  imageAlt?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  className?: string;
  imageClassName?: string;
  maxFileSize?: number;
  emptyLabel?: string;
  replaceLabel?: string;
  layout?: "row" | "column";
}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFileSelected(file: File | undefined) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`${file.name} isn't a supported image type.`);
      return;
    }
    if (file.size > maxFileSize) {
      toast.error(
        `${file.name} is larger than ${Math.round(maxFileSize / 1024 / 1024)}MB.`,
      );
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      toast.success("Image updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleConfirmRemove() {
    setConfirmRemove(false);
    setIsRemoving(true);
    try {
      await onRemove();
      toast.success("Image removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove image",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div
      className={cn(
        layout === "row"
          ? "flex items-center gap-4"
          : "flex flex-col items-start gap-3",
        className,
      )}
    >
      <div
        className={cn(
          "bg-muted relative size-24 shrink-0 overflow-hidden rounded-lg border",
          imageClassName,
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="200px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <ImagePlus className="size-6" />
          </div>
        )}
        {(isUploading || isRemoving) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="size-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading || isRemoving}
            className="border-input hover:bg-muted rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
          >
            {imageUrl ? replaceLabel : emptyLabel}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              disabled={isUploading || isRemoving}
              className="text-destructive hover:bg-destructive/10 rounded-md px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
            >
              <X className="mr-1 inline size-3.5" />
              Remove
            </button>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          PNG, JPEG or WebP, up to {Math.round(maxFileSize / 1024 / 1024)}MB.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this image?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. The image will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
