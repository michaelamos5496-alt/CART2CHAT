"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { Tags } from "lucide-react";
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
import { EmptyState } from "@/components/shared/empty-state";
import { CategoryRow } from "@/features/categories/components/category-row";
import {
  deleteCategory,
  reorderCategories,
} from "@/features/categories/lib/mutations";
import type { CategoryWithProductCount } from "@/types/catalog";

function DraggableRow({
  category,
  onDelete,
  onMove,
  isFirst,
  isLast,
}: {
  category: CategoryWithProductCount;
  onDelete: (category: CategoryWithProductCount) => void;
  onMove: (categoryId: string, direction: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={category}
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
    >
      <CategoryRow
        category={category}
        dragControls={dragControls}
        onDelete={onDelete}
        onMove={onMove}
        isFirst={isFirst}
        isLast={isLast}
      />
    </Reorder.Item>
  );
}

export function CategoriesList({
  categories: initialCategories,
  draggable,
}: {
  categories: CategoryWithProductCount[];
  draggable: boolean;
}) {
  const router = useRouter();
  const [categories, setCategories] = React.useState(initialCategories);
  const [pendingDelete, setPendingDelete] =
    React.useState<CategoryWithProductCount | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  async function persistOrder(newOrder: CategoryWithProductCount[]) {
    const previous = categories;
    setCategories(newOrder);
    try {
      await reorderCategories(
        newOrder.map((category, index) => ({
          id: category.id,
          sortOrder: index,
        })),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save order",
      );
      setCategories(previous);
    }
  }

  // Keyboard/click-accessible alternative to the drag handle — dragging
  // isn't operable for everyone (WCAG 2.5.7 Dragging Movements requires a
  // non-drag path when a gesture is the only way to complete an action).
  function handleMove(categoryId: string, direction: "up" | "down") {
    const index = categories.findIndex((c) => c.id === categoryId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= categories.length) return;

    const newOrder = [...categories];
    [newOrder[index], newOrder[swapWith]] = [
      newOrder[swapWith],
      newOrder[index],
    ];
    void persistOrder(newOrder);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(pendingDelete);
      toast.success("Category deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category",
      );
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Tags}
        title="No categories found"
        description="Try a different search, or add your first category."
      />
    );
  }

  return (
    <>
      {draggable ? (
        <Reorder.Group
          axis="y"
          values={categories}
          onReorder={persistOrder}
          className="grid gap-2"
        >
          {categories.map((category, index) => (
            <DraggableRow
              key={category.id}
              category={category}
              onDelete={setPendingDelete}
              onMove={handleMove}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
            />
          ))}
        </Reorder.Group>
      ) : (
        <div className="grid gap-2">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && pendingDelete.productCount > 0
                ? `${pendingDelete.productCount} product${pendingDelete.productCount === 1 ? "" : "s"} will become uncategorized. `
                : ""}
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
