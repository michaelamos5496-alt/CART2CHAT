import Link from "next/link";
import {
  BarChart3,
  ChevronRight,
  Package,
  Settings,
  ShoppingCart,
  Tags,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ACTIONS = [
  {
    title: "View products",
    description: "Manage your catalog",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "View categories",
    description: "Organize your catalog",
    href: "/dashboard/categories",
    icon: Tags,
  },
  {
    title: "View orders",
    description: "Track incoming orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "View analytics",
    description: "See how you're doing",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Store settings",
    description: "Update your storefront",
    href: "/dashboard/settings",
    icon: Settings,
  },
] as const;

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="hover:bg-muted -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors"
          >
            <div className="bg-muted flex size-8 shrink-0 items-center justify-center rounded-md">
              <action.icon className="size-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{action.title}</div>
              <div className="text-muted-foreground text-xs">
                {action.description}
              </div>
            </div>
            <ChevronRight className="text-muted-foreground size-4" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
