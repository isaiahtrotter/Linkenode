"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser, type WidgetSettings } from "@/lib/dal";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
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
  revalidatePath("/dashboard/embed");
}
