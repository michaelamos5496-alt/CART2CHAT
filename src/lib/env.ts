import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // Used for metadataBase, canonical URLs, OG tags, and the sitemap.
  // Falls back to localhost so local dev doesn't require setting it.
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  // Server-only. Never expose to the client. Used to call Paystack's API
  // and to verify the x-paystack-signature webhook HMAC. Optional like
  // SUPABASE_SERVICE_ROLE_KEY above, so environments without Paystack
  // configured yet can still build; callers guard at the point of use.
  PAYSTACK_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${parsed.error.issues
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n")}`,
  );
}

export const env = parsed.data;
