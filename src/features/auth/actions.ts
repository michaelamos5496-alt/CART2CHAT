"use server";

import { redirect } from "next/navigation";

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

    const { error } = await serviceClient.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("deleteAccount: admin.deleteUser failed", {
        name: error.name,
        status: "status" in error ? error.status : undefined,
        code: "code" in error ? error.code : undefined,
        message: error.message,
      });
      return { error: error.message || "Failed to delete account" };
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
