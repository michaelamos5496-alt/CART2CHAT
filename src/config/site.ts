import { env } from "@/lib/env";

export const siteConfig = {
  name: "Cart-2-Chat",
  tagline: "Turn your WhatsApp into a real storefront",
  description:
    "Cart-2-Chat gives small businesses a beautiful online storefront that sends every order straight to WhatsApp — no commissions, no new app for customers to learn.",
  url: env.NEXT_PUBLIC_SITE_URL,
} as const;
