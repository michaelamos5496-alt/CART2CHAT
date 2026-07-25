import Image from "next/image";

import { BUCKETS, getPublicImageUrl } from "@/lib/storage";
import type { Business } from "@/types/business";

export function StoreHero({ business }: { business: Business }) {
  return (
    <div>
      <div
        className="bg-muted relative aspect-[3/1] w-full overflow-hidden sm:aspect-[4/1]"
        style={
          !business.banner_path
            ? { backgroundColor: business.theme_color, opacity: 0.15 }
            : undefined
        }
      >
        {business.banner_path && (
          <Image
            src={getPublicImageUrl(BUCKETS.logos, business.banner_path)}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
          <div className="border-background bg-background relative size-20 shrink-0 overflow-hidden rounded-2xl border-4 shadow-sm sm:size-24">
            {business.logo_path ? (
              <Image
                src={getPublicImageUrl(BUCKETS.logos, business.logo_path)}
                alt={business.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center text-2xl font-semibold text-white"
                style={{ backgroundColor: business.theme_color }}
              >
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {business.name}
            </h1>
          </div>
        </div>

        {business.description && (
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base">
            {business.description}
          </p>
        )}
      </div>
    </div>
  );
}
