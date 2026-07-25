"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { exportOrdersCsv } from "@/features/orders/lib/export";
import type { OrderStatus } from "@/types/order";

export function ExportOrdersButton({
  businessId,
  search,
  status,
}: {
  businessId: string;
  search?: string;
  status?: OrderStatus;
}) {
  const [isExporting, setIsExporting] = React.useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      const count = await exportOrdersCsv(businessId, { search, status });
      if (count === 0) {
        toast.info("No orders to export for the current filters");
      } else {
        toast.success(`Exported ${count} order${count === 1 ? "" : "s"}`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export orders",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
      Export CSV
    </Button>
  );
}
