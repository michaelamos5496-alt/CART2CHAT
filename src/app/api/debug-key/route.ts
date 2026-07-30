import { NextResponse } from "next/server";

import { env } from "@/lib/env";

// Temporary diagnostic route — reveals only the key's mode prefix, never
// the secret itself. Delete once the live/test env var mismatch is found.
export async function GET() {
  return NextResponse.json({
    secretKeyPrefix: env.PAYSTACK_SECRET_KEY?.slice(0, 8) ?? "unset",
    publicKeyPrefix: env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.slice(0, 8) ?? "unset",
  });
}
