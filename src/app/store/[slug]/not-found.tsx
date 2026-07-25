import Link from "next/link";
import { Store } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function StoreNotFound() {
  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <Store className="text-muted-foreground size-6" />
      </div>
      <h1 className="text-lg font-semibold">Store not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        This storefront doesn&apos;t exist or isn&apos;t currently available.
      </p>
      <Button variant="outline" render={<Link href="/" />}>
        Go home
      </Button>
    </div>
  );
}
