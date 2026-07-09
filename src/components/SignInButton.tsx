"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignInButton() {
  const supabase = createClient();

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <button onClick={signIn} className="google-signin-btn">
      Continue with Google
    </button>
  );
}
