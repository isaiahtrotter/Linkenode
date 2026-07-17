"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSessionUser, type WidgetSettings } from "@/lib/dal";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

// Cascades through everything owned by or attached to this account (see
// delete_own_account in supabase/policies-reference.sql, section 13) so no
// connection, note, or endorsement lingers for anyone who was connected to
// them, then signs out. Also deletes the underlying auth.users row via the
// admin API, but only if SUPABASE_SERVICE_ROLE_KEY is configured -- see
// src/lib/supabase/admin.ts.
//
// Deliberately doesn't call redirect() here -- this is invoked imperatively
// from a client component's confirm dialog (not a <form action>), and a
// server action's redirect() thrown mid-promise-chain would just get
// swallowed by the caller's own .catch(). The caller navigates itself once
// this resolves.
export async function deleteAccount() {
  const user = await requireSessionUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_own_account");
  if (error) {
    throw new Error(
      "Couldn't delete account — the delete_own_account function may be missing. See supabase/policies-reference.sql, section 13.",
    );
  }

  const admin = createAdminClient();
  if (admin) {
    await admin.auth.admin.deleteUser(user.id);
  }

  await supabase.auth.signOut();
}

export async function updateWidgetSettings(settings: WidgetSettings) {
  const user = await requireSessionUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ widget_settings: settings })
    .eq("user_id", user.id)
    .select("id");

  if (error) throw error;
  if (!data || data.length === 0) {
    // RLS silently filters out updates it doesn't allow rather than
    // erroring — 0 rows affected means the update policy (or the
    // widget_settings column) is missing in Supabase, not a client bug.
    throw new Error(
      "Nothing was saved — the profiles table may be missing its update policy or the widget_settings column. See supabase/policies-reference.sql.",
    );
  }
  revalidatePath("/dashboard");
}
