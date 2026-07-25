"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

// recharts is a meaningfully sized dependency; splitting it into its own
// chunk (rather than importing OrdersBarChart eagerly into server-rendered
// pages) keeps it out of the initial JS payload until this component is
// actually about to render. ssr:false is only valid from a Client
// Component boundary, hence this wrapper — Server Component pages import
// this file instead of orders-bar-chart.tsx directly.
export const OrdersBarChart = dynamic(
  () =>
    import("@/features/analytics/components/orders-bar-chart").then(
      (mod) => mod.OrdersBarChart,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[220px] w-full" />,
  },
);
