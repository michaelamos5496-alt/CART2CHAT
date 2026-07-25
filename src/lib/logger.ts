// A single seam for error reporting. Right now it writes structured JSON
// to the console — on Vercel that lands in the function logs / log drain
// automatically, no extra setup required. If Sentry (or similar) gets
// added later, this is the one place that needs to change: swap the
// console.error body for `Sentry.captureException(error, { extra: context })`
// and every call site below keeps working unmodified.
export function logError(error: unknown, context?: Record<string, unknown>) {
  const payload = {
    level: "error",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
    timestamp: new Date().toISOString(),
  };

  console.error(JSON.stringify(payload));
}
