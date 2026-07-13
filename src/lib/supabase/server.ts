import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component — proxy.ts refreshes the
            // session instead, so this can be safely ignored here.
          }
        },
      },
      global: {
        // Next.js's fetch patching would otherwise cache these REST calls
        // in its Data Cache (keyed by URL), so e.g. a connection's updated
        // name wouldn't show up until that cache entry happened to expire.
        fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }),
      },
    },
  );
}
