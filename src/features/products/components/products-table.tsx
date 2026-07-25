"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Package } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteProduct } from "@/features/products/lib/mutations";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ProductWithCategory } from "@/types/catalog";

const STATUS_VARIANT: Record<
  ProductWithCategory["status"],
  "secondary" | "outline"
> = {
  active: "secondary",
  draft: "outline",
  archived: "outline",
};

const STATUS_LABEL: Record<ProductWithCategory["status"], string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

export function ProductsTable({
  businessId,
  currency,
  products,
}: {
  businessId: string;
  currency: string;
  products: ProductWithCategory[];
}) {
  const router = useRouter();
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;

    setIsDeleting(true);
    try {
      await deleteProduct(businessId, pendingDeleteId);
      toast.success("Product deleted");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Try a different search, or add your first product."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Availability
              </TableHead>
              <TableHead className="hidden text-right lg:table-cell">
                Updated
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {product.name}
                    {product.is_featured && (
                      <Badge variant="outline" className="text-amber-600">
                        Featured
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">
                  {product.category?.name ?? "Uncategorized"}
                </TableCell>
                <TableCell>{formatCurrency(product.price, currency)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[product.status]}>
                    {STATUS_LABEL[product.status]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge
                    variant={product.is_available ? "secondary" : "outline"}
                  >
                    {product.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground hidden text-right lg:table-cell">
                  {formatDate(product.updated_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                          <span className="sr-only">Product actions</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                          />
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setPendingDeleteId(product.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product and all of its images.
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
