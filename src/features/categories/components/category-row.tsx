"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImageIcon,
  MoreHorizontal,
} from "lucide-react";
import type { DragControls } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCategoryImageUrl } from "@/features/categories/lib/mutations";
import type { CategoryWithProductCount } from "@/types/catalog";

export function CategoryRow({
  category,
  dragControls,
  onDelete,
  onMove,
  isFirst,
  isLast,
}: {
  category: CategoryWithProductCount;
  dragControls?: DragControls;
  onDelete: (category: CategoryWithProductCount) => void;
  onMove?: (categoryId: string, direction: "up" | "down") => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
      {dragControls && (
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onPointerDown={(e) => dragControls.start(e)}
            className="text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </button>
          {/* Non-drag alternative for reordering (WCAG 2.5.7) — a drag
              gesture is never the *only* way to move a row. */}
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onMove?.(category.id, "up")}
              disabled={isFirst}
              className="text-muted-foreground hover:text-foreground flex size-6 items-center justify-center disabled:pointer-events-none disabled:opacity-30"
              aria-label={`Move ${category.name} up`}
            >
              <ChevronUp className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onMove?.(category.id, "down")}
              disabled={isLast}
              className="text-muted-foreground hover:text-foreground flex size-6 items-center justify-center disabled:pointer-events-none disabled:opacity-30"
              aria-label={`Move ${category.name} down`}
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-md border">
        {category.image_path ? (
          <Image
            src={getCategoryImageUrl(category.image_path)}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center">
            <ImageIcon className="size-4" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{category.name}</span>
          <Badge variant={category.is_active ? "secondary" : "outline"}>
            {category.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {category.productCount} product
          {category.productCount === 1 ? "" : "s"}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
              <span className="sr-only">Category actions</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/dashboard/categories/${category.id}/edit`} />}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(category)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
