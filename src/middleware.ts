import { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Nonce-based CSP, following Next.js's documented App Router pattern: the
// nonce goes out on both the request (as x-nonce, so Server Components can
// read it via headers() and Next automatically applies it to its own
// inline bootstrap scripts) and the response (as the actual CSP header).
// style-src keeps 'unsafe-inline' as a pragmatic exception — React sets
// inline style="" attributes (e.g. dynamic progress-bar widths) that a
// nonce can't cover without wrapping every one in a <style> tag.
function buildCsp(nonce: string) {
  // Next's dev server (Fast Refresh / webpack HMR) evaluates module code
  // via eval() — a strict CSP without 'unsafe-eval' blocks it outright,
  // which silently kills all client-side JS in dev (the page still
  // server-renders, but nothing hydrates). Production builds don't need
  // it: next build's output doesn't rely on runtime eval.
  const scriptSrc =
    process.env.NODE_ENV === "development"
      ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
      : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  return `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    connect-src 'self' ${supabaseUrl};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const requestWithNonce = new NextRequest(request, {
    headers: requestHeaders,
  });

  const response = await updateSession(requestWithNonce);
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - files with an extension (e.g. images, fonts)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)",
  ],
};
