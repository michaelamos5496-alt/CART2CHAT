"use client";

import {
  AtSign,
  Camera,
  Globe,
  Music2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Control } from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { StoreSettingsInput } from "@/lib/validations/store-settings";

const PLATFORMS: {
  key: keyof StoreSettingsInput["socialLinks"];
  label: string;
  placeholder: string;
  icon: LucideIcon;
}[] = [
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourstore",
    icon: Camera,
  },
  {
    key: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourstore",
    icon: Users,
  },
  {
    key: "tiktok",
    label: "TikTok",
    placeholder: "https://tiktok.com/@yourstore",
    icon: Music2,
  },
  {
    key: "twitter",
    label: "X / Twitter",
    placeholder: "https://x.com/yourstore",
    icon: AtSign,
  },
  {
    key: "website",
    label: "Website",
    placeholder: "https://yourstore.com",
    icon: Globe,
  },
];

export function SocialLinksEditor({
  control,
  disabled,
}: {
  control: Control<StoreSettingsInput>;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-3">
      {PLATFORMS.map(({ key, label, placeholder, icon: Icon }) => (
        <FormField
          key={key}
          control={control}
          name={`socialLinks.${key}`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Icon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                  <Input
                    placeholder={placeholder}
                    aria-label={label}
                    disabled={disabled}
                    className="pl-8"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
