"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AtSign,
  Camera,
  ExternalLink,
  Globe,
  Music2,
  Store,
  Users,
} from "lucide-react";

import { dayLabel, formatDayHours, todayKey } from "@/lib/hours";
import type { StoreSettingsInput } from "@/lib/validations/store-settings";

const SOCIAL_ICONS = {
  instagram: Camera,
  facebook: Users,
  tiktok: Music2,
  twitter: AtSign,
  website: Globe,
} as const;

export function StorePreview({
  storeSlug,
  logoUrl,
  bannerUrl,
  values,
}: {
  storeSlug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  values: Pick<
    StoreSettingsInput,
    "name" | "description" | "themeColor" | "businessHours" | "socialLinks"
  >;
}) {
  const today = todayKey();
  const todayHours = values.businessHours[today];
  const socialEntries = Object.entries(values.socialLinks).filter(
    ([, url]) => url,
  ) as [keyof typeof SOCIAL_ICONS, string][];

  return (
    <div className="sticky top-20 grid gap-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">
          Live preview
        </p>
        <Link
          href={`/store/${storeSlug}`}
          target="_blank"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
        >
          View live store
          <ExternalLink className="size-3" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div
          className="relative aspect-[3/1] w-full overflow-hidden"
          style={
            !bannerUrl
              ? { backgroundColor: values.themeColor, opacity: 0.15 }
              : undefined
          }
        >
          {bannerUrl && (
            <Image
              src={bannerUrl}
              alt=""
              fill
              sizes="400px"
              className="object-cover"
            />
          )}
        </div>

        <div className="bg-card px-4 pt-0 pb-4">
          <div className="-mt-6 flex items-end gap-3">
            <div className="border-background bg-background relative size-14 shrink-0 overflow-hidden rounded-xl border-4 shadow-sm">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center text-white"
                  style={{ backgroundColor: values.themeColor }}
                >
                  {values.name ? (
                    values.name.charAt(0).toUpperCase()
                  ) : (
                    <Store className="size-5" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 grid gap-1">
            <p className="truncate font-semibold">
              {values.name || "Your business name"}
            </p>
            {values.description && (
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {values.description}
              </p>
            )}
          </div>

          {todayHours && (
            <p className="text-muted-foreground mt-2 text-xs">
              {dayLabel(today)}: {formatDayHours(todayHours)}
            </p>
          )}

          {socialEntries.length > 0 && (
            <div className="mt-3 flex gap-2">
              {socialEntries.map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <span
                    key={key}
                    title={url}
                    className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-full"
                  >
                    <Icon className="size-3.5" />
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
