import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { SearchInput } from "@/components/shared/search-input";
import { CartSheet } from "@/features/cart/components/cart-sheet";
import { BUCKETS, getPublicImageUrl } from "@/lib/storage";
import type { Business } from "@/types/business";

export function StoreTopBar({
  business,
  showSearch,
}: {
  business: Business;
  showSearch: boolean;
}) {
  return (
    <header className="border-border/40 bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link
          href={`/store/${business.slug}`}
          className="flex min-w-0 items-center gap-2"
        >
          <div className="bg-muted relative size-8 shrink-0 overflow-hidden rounded-md">
            {business.logo_path ? (
              <Image
                src={getPublicImageUrl(BUCKETS.logos, business.logo_path)}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: business.theme_color }}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="truncate text-sm font-semibold">
            {business.name}
          </span>
        </Link>

        {showSearch && (
          <div className="ml-auto min-w-0">
            <Suspense>
              <SearchInput placeholder="Search products..." />
            </Suspense>
          </div>
        )}
        <CartSheet />
      </div>
    </header>
  );
}
