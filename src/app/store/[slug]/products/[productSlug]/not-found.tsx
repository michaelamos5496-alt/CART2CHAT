import Link from "next/link";
import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <PackageSearch className="text-muted-foreground size-6" />
      </div>
      <h1 className="text-lg font-semibold">Product not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        This product doesn&apos;t exist or is no longer available.
      </p>
      {/* not-found.tsx has no access to route params, so this relative
          path (up from .../products/[productSlug]) is the only way to get
          back to the store root without knowing its slug. */}
      <Button variant="outline" render={<Link href="../.." />}>
        Back to store
      </Button>
    </div>
  );
}
