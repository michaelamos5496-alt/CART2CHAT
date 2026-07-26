"use server";

import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Uses the Admin Auth API (via the service-role client) rather than a
// SECURITY DEFINER SQL function deleting straight from auth.users — the
// latter turned out to be unreliable across Supabase project
// configurations, where the Admin API is the officially supported path.
//
// Returns { error } instead of throwing for every expected failure mode,
// so the client never has to distinguish "a real error" from redirect()'s
// own throw-to-navigate mechanism — the same pattern signOut() above
// relies on by calling redirect() with nothing wrapping it.
export async function deleteAccount(): Promise<{ error: string } | undefined> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    const serviceClient = createServiceClient();

    // Best-effort: storage.objects references auth.users without cascade,
    // so leftover files there would otherwise block the user delete
    // below. Removing them via the Storage API (rather than raw SQL)
    // also cleans up the underlying files, not just their metadata rows.
    if (business) {
      try {
        const { data: files } = await serviceClient.storage
          .from("product-images")
          .list(business.id, { limit: 1000 });

        for (const productFolder of files ?? []) {
          const { data: images } = await serviceClient.storage
            .from("product-images")
            .list(`${business.id}/${productFolder.name}`, { limit: 1000 });

          const paths = (images ?? []).map(
            (image) => `${business.id}/${productFolder.name}/${image.name}`,
          );
          if (paths.length > 0) {
            await serviceClient.storage.from("product-images").remove(paths);
          }
        }
      } catch {
        // Orphaned files are an acceptable tradeoff; an undeletable
        // account isn't.
      }
    }

    // Calling the Admin API directly (instead of serviceClient.auth.admin.
    // deleteUser) because the SDK discards the real response body for any
    // 5xx status and substitutes a stringified Response object instead
    // (always renders as "{}") — that's been masking the actual error.
    const response = await fetch(
      `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
      {
        method: "DELETE",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? "",
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
        },
      },
    );

    if (!response.ok) {
      const body = await response.text();
      console.error("deleteAccount: admin delete failed", {
        status: response.status,
        body,
      });
      return {
        error: body || `Delete failed with status ${response.status}`,
      };
    }
  } catch (error) {
    console.error("deleteAccount: unexpected error", error);
    return {
      error:
        error instanceof Error && error.message
          ? error.message
          : "Failed to delete account",
    };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
