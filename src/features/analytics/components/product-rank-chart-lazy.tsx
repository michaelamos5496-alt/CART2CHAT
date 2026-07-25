"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import type { RankedProduct } from "@/features/analytics/lib/queries";

// See orders-bar-chart-lazy.tsx for why this wrapper exists.
const LazyProductRankChart = dynamic(
  () =>
    import("@/features/analytics/components/product-rank-chart").then(
      (mod) => mod.ProductRankChart,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-40 w-full" />,
  },
);

export function ProductRankChart(props: {
  data: RankedProduct[];
  valueLabel: string;
}) {
  return <LazyProductRankChart {...props} />;
}
