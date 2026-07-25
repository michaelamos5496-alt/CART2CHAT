import { siteConfig } from "@/config/site";
import type { Business } from "@/types/business";

export function StoreFooter({ business }: { business: Business }) {
  return (
    <footer className="border-border/40 mt-auto border-t py-6">
      <div className="text-muted-foreground mx-auto max-w-6xl px-4 text-center text-sm sm:px-6">
        {business.name} · Powered by {siteConfig.name}
      </div>
    </footer>
  );
}
