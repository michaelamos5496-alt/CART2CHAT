"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteAccount() {
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    throw new Error(error.message);
  }

  await supabase.auth.signOut();
  redirect("/login");
}
