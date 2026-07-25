// A single seam for error reporting. Right now it writes structured JSON
// to the console — on Vercel that lands in the function logs / log drain
// automatically, no extra setup required. If Sentry (or similar) gets
// added later, this is the one place that needs to change: swap the
// console.error body for `Sentry.captureException(error, { extra: context })`
// and every call site below keeps working unmodified.
// Supabase's PostgrestError extends Error but attaches the actually useful
// bits (code, details, hint) as extra own properties — an instanceof-only
// branch that returns just {message, stack} silently drops them. Spreading
// the object's own properties first, then layering message/stack on top,
// keeps both the Postgrest-specific fields and a readable message for
// plain non-Error objects (which would otherwise stringify to
// "[object Object]").
function describeError(error: unknown) {
  if (error && typeof error === "object") {
    return {
      ...error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }
  return { message: String(error) };
}

export function logError(error: unknown, context?: Record<string, unknown>) {
  const payload = {
    level: "error",
    ...describeError(error),
    ...context,
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(payload));
}
