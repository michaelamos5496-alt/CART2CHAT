"use client";

import * as React from "react";
import { Check, Copy, ExternalLink, Store } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function StorefrontLinkButton({ storeUrl }: { storeUrl: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast.success("Storefront link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link — copy it manually instead");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <Store />
            Storefront
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Your storefront link</DropdownMenuLabel>
        <div className="px-1.5 pb-1.5">
          <p className="bg-muted text-muted-foreground truncate rounded-md px-2 py-1.5 text-xs">
            {storeUrl}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy link"}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<a href={storeUrl} target="_blank" rel="noopener noreferrer" />}
        >
          <ExternalLink />
          Visit storefront
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
