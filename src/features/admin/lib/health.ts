import { createClient } from "@/lib/supabase/server";
import type { SystemHealthCheck } from "@/types/admin";

async function timed<T>(
  fn: () => PromiseLike<T>,
): Promise<{ result: T; ms: number }> {
  const start = performance.now();
  const result = await fn();
  return { result, ms: Math.round(performance.now() - start) };
}

// Real, live checks — not a static/decorative status page. Each one makes
// an actual request against the service it reports on.
export async function getSystemHealth(): Promise<SystemHealthCheck[]> {
  const supabase = await createClient();
  const checks: SystemHealthCheck[] = [];

  try {
    const { ms, result } = await timed(() =>
      supabase.from("plan_limits").select("*", { count: "exact", head: true }),
    );
    checks.push({
      name: "Database",
      status: result.error ? "down" : "healthy",
      latencyMs: ms,
      detail: result.error ? result.error.message : "Query succeeded",
    });
  } catch (error) {
    checks.push({
      name: "Database",
      status: "down",
      latencyMs: null,
      detail: error instanceof Error ? error.message : "Unreachable",
    });
  }

  try {
    const { ms, result } = await timed(() =>
      supabase.storage.from("product-images").list("", { limit: 1 }),
    );
    checks.push({
      name: "Storage",
      status: result.error ? "down" : "healthy",
      latencyMs: ms,
      detail: result.error ? result.error.message : "Bucket reachable",
    });
  } catch (error) {
    checks.push({
      name: "Storage",
      status: "down",
      latencyMs: null,
      detail: error instanceof Error ? error.message : "Unreachable",
    });
  }

  try {
    const { ms, result } = await timed(() => supabase.auth.getUser());
    checks.push({
      name: "Auth",
      status: result.error ? "degraded" : "healthy",
      latencyMs: ms,
      detail: result.error ? result.error.message : "Session verified",
    });
  } catch (error) {
    checks.push({
      name: "Auth",
      status: "down",
      latencyMs: null,
      detail: error instanceof Error ? error.message : "Unreachable",
    });
  }

  return checks;
}
