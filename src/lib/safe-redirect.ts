// Only ever redirect to a same-origin relative path. A raw `next` query
// param (from ?next=...) is attacker-controlled — without this check
// `next=https://evil.com` or the protocol-relative `next=//evil.com` would
// send a just-authenticated user straight off-site.
export function safeRedirectPath(next: string | null, fallback = "/dashboard") {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
