import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for the one thing no user-scoped/RLS client can ever
// do: deleting an auth.users row outright. Requires SUPABASE_SERVICE_ROLE_KEY
// (Supabase dashboard -> Project Settings -> API -> service_role secret) in
// .env.local / Vercel's env vars -- not set up yet in this project. Returns
// null when it's missing so callers (deleteAccount) can degrade gracefully
// instead of crashing: the app-visible profile and all its data are already
// gone by the time this is used, so a missing key just means the bare auth
// identity outlives everything else rather than blocking deletion entirely.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
