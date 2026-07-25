import type { Metadata } from "next";
import { CheckCircle2, CircleAlert, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSystemHealth } from "@/features/admin/lib/health";
import { cn } from "@/lib/utils";
import type { SystemHealthCheck } from "@/types/admin";

export const metadata: Metadata = {
  title: "System health",
};

// Always fetch live — a cached health page defeats the point.
export const dynamic = "force-dynamic";

const STATUS_META: Record<
  SystemHealthCheck["status"],
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  },
  degraded: {
    label: "Degraded",
    icon: CircleAlert,
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  },
  down: {
    label: "Down",
    icon: XCircle,
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
};

export default async function AdminSystemHealthPage() {
  const checks = await getSystemHealth();
  const allHealthy = checks.every((check) => check.status === "healthy");

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System health</h1>
        <p className="text-muted-foreground text-sm">
          Live checks against every service OrderFlow depends on.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => {
          const meta = STATUS_META[check.status];
          const Icon = meta.icon;
          return (
            <Card key={check.name}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{check.name}</CardTitle>
                <Badge variant="outline" className={cn(meta.className)}>
                  <Icon className="size-3.5" />
                  {meta.label}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-1">
                <p className="text-muted-foreground text-sm">{check.detail}</p>
                {check.latencyMs !== null && (
                  <p className="text-muted-foreground text-xs">
                    {check.latencyMs}ms
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-muted-foreground text-sm">
        {allHealthy
          ? "All systems operational."
          : "One or more services need attention."}
      </p>
    </div>
  );
}
