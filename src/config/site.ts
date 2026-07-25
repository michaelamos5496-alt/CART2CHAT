import { env } from "@/lib/env";

export const siteConfig = {
  name: "OrderFlow",
  tagline: "Turn your WhatsApp into a real storefront",
  description:
    "OrderFlow gives small businesses a beautiful online storefront that sends every order straight to WhatsApp — no commissions, no new app for customers to learn.",
  url: env.NEXT_PUBLIC_SITE_URL,
} as const;
