import { Flame } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { PopularProduct } from "@/features/products/lib/queries";

export function PopularProductsCard({
  products,
}: {
  products: PopularProduct[];
}) {
  const maxSold = Math.max(...products.map((p) => p.quantitySold), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Popular products</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No sales data yet"
            description="Your best-selling products will be ranked here once orders come in."
          />
        ) : (
          <div className="grid gap-3">
            {products.map((product, index) => (
              <div key={product.productId} className="grid gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 truncate font-medium">
                    <span className="text-muted-foreground w-4 shrink-0 text-xs">
                      {index + 1}
                    </span>
                    <span className="truncate">{product.name}</span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {product.quantitySold} sold
                  </span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{
                      width: `${(product.quantitySold / maxSold) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
