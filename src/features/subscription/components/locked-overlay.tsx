import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LockedOverlay({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none blur-[3px] select-none">
        {children}
      </div>
      <div className="bg-background/60 absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg text-center backdrop-blur-[1px]">
        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
          <Lock className="size-5" />
        </div>
        <p className="max-w-xs px-4 text-sm font-medium text-balance">
          {message}
        </p>
        <Button size="sm" render={<Link href="/dashboard/billing" />}>
          Upgrade plan
        </Button>
      </div>
    </div>
  );
}
