"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Store } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteBusinessDialog } from "@/features/admin/components/delete-business-dialog";
import { SuspendBusinessDialog } from "@/features/admin/components/suspend-business-dialog";
import { unsuspendBusiness } from "@/features/admin/lib/mutations";
import { PLAN_META } from "@/features/subscription/lib/plan-meta";
import { formatDate } from "@/lib/format";
import type { AdminBusinessRow } from "@/types/admin";

export function BusinessesTable({
  businesses,
}: {
  businesses: AdminBusinessRow[];
}) {
  const router = useRouter();
  const [suspendTarget, setSuspendTarget] =
    React.useState<AdminBusinessRow | null>(null);
  const [deleteTarget, setDeleteTarget] =
    React.useState<AdminBusinessRow | null>(null);

  async function handleUnsuspend(business: AdminBusinessRow) {
    try {
      await unsuspendBusiness(business.id);
      toast.success(`${business.name} unsuspended`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unsuspend",
      );
    }
  }

  if (businesses.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="No businesses found"
        description="Try a different search."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead className="hidden sm:table-cell">Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Products
              </TableHead>
              <TableHead className="hidden text-right md:table-cell">
                Orders
              </TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {businesses.map((business) => (
              <TableRow key={business.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/businesses/${business.id}`}
                    className="hover:underline"
                  >
                    {business.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell">
                  {business.owner_email}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {PLAN_META[business.plan].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      business.is_suspended ? "destructive" : "secondary"
                    }
                  >
                    {business.is_suspended ? "Suspended" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-right md:table-cell">
                  {business.product_count}
                </TableCell>
                <TableCell className="hidden text-right md:table-cell">
                  {business.order_count}
                </TableCell>
                <TableCell className="text-muted-foreground hidden lg:table-cell">
                  {formatDate(business.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal />
                          <span className="sr-only">Business actions</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        render={
                          <Link href={`/admin/businesses/${business.id}`} />
                        }
                      >
                        View details
                      </DropdownMenuItem>
                      {business.is_suspended ? (
                        <DropdownMenuItem
                          onClick={() => handleUnsuspend(business)}
                        >
                          Unsuspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => setSuspendTarget(business)}
                        >
                          Suspend
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget(business)}
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

      {suspendTarget && (
        <SuspendBusinessDialog
          businessId={suspendTarget.id}
          businessName={suspendTarget.name}
          open={Boolean(suspendTarget)}
          onOpenChange={(open) => !open && setSuspendTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteBusinessDialog
          businessId={deleteTarget.id}
          businessName={deleteTarget.name}
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        />
      )}
    </>
  );
}
