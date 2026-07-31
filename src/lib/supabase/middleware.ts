import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/lib/env";
import { requiresSubscription } from "@/features/subscription/lib/paywall";

const PROTECTED_PATHS = ["/dashboard", "/admin"];
const ADMIN_PATHS = ["/admin"];

// Paths that must stay reachable even when locked out for some other
// reason, so an owner can see *why* rather than bouncing in a loop.
// A cancelled/past-due subscription deliberately does NOT lock the whole
// dashboard the way suspension does — it only hides the storefront and
// blocks new products (enforced at the database layer). The pre-payment
// gate below (requiresSubscription) is the exception: a business that has
// never completed a checkout at all gets locked to /dashboard/billing.
const SUSPENSION_LOCK_EXEMPT_PATHS = ["/dashboard/suspended"];
const PENDING_LOCK_EXEMPT_PATHS = ["/dashboard/pending"];
const SUBSCRIPTION_LOCK_EXEMPT_PATHS = ["/dashboard/billing"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run any logic between createServerClient and getUser.
  // A simple mistake could make it very hard to debug issues with
  // users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (isProtectedPath && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Defense in depth alongside requireSuperAdmin() in the admin pages
  // themselves: a non-admin never even sees an admin route render.
  if (isAdminPath && user) {
    const { data: isAdmin } = await supabase.rpc("is_super_admin");
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  const isSuspensionLockExempt = SUSPENSION_LOCK_EXEMPT_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isPendingLockExempt = PENDING_LOCK_EXEMPT_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const isSubscriptionLockExempt = SUBSCRIPTION_LOCK_EXEMPT_PATHS.some(
    (path) => pathname.startsWith(path),
  );

  if (pathname.startsWith("/dashboard") && user) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id, slug, is_suspended")
      .eq("owner_id", user.id)
      .maybeSingle();

    // The public dashboard demo (shared login, see marketing homepage) is
    // permanently exempt from the pre-payment gate below — it's meant to
    // be explored without ever subscribing.
    const isDemoBusiness = business?.slug === "demo";

    // A confirmed user with no business row at all — auto-provisioning
    // either hasn't run yet or failed outright. Without this check every
    // dashboard subpage would silently render blank (getOwnBusiness()
    // returning null with nothing downstream noticing).
    if (!business && !isPendingLockExempt) {
      return NextResponse.redirect(new URL("/dashboard/pending", request.url));
    }

    if (business?.is_suspended && !isSuspensionLockExempt) {
      return NextResponse.redirect(
        new URL("/dashboard/suspended", request.url),
      );
    }

    if (business && !isDemoBusiness && !isSubscriptionLockExempt) {
      const { data: subscription } = await supabase
        .from("business_subscriptions")
        .select("provider, created_at")
        .eq("business_id", business.id)
        .maybeSingle();

      // Fails open on missing/errored data, same as the checks above —
      // never lock someone out of their own dashboard over a query hiccup.
      if (subscription && requiresSubscription(subscription)) {
        const { data: isAdmin } = await supabase.rpc("is_super_admin");
        if (!isAdmin) {
          return NextResponse.redirect(
            new URL("/dashboard/billing", request.url),
          );
        }
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object, make sure to:
  // 1. Pass the request in it
  // 2. Copy over the cookies
  // 3. Change the myNewResponse object, not the supabaseResponse object
  return supabaseResponse;
}
