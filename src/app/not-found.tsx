import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <Compass className="text-muted-foreground size-6" />
      </div>
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Button variant="outline" render={<Link href="/" />}>
        Go home
      </Button>
    </div>
  );
}
