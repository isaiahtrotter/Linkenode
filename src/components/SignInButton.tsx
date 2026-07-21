"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import styles from "./SignInButton.module.css";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

type GoogleCredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            nonce: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.68 9c0-.593.102-1.17.284-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

// Signs in via Google's client-side Identity Services rather than Supabase's
// hosted OAuth redirect -- that redirect round-trips through
// <project-ref>.supabase.co, which is why Google's consent screen used to
// show that raw domain instead of the app's name. This flow gets an ID
// token directly in the browser and hands it to Supabase, so Google only
// ever sees this site's own domain.
//
// Google's own renderButton() draws its UI inside a cross-origin iframe, so
// its padding/spacing can't be styled to this design's exact spec. This
// button instead triggers the same identity flow via prompt() (Google's One
// Tap UI), which can be called from any element we style ourselves.
export default function SignInButton() {
  const supabase = createClient();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scriptLoaded || !window.google) return;

    let cancelled = false;
    // The raw nonce is sent to Supabase to confirm this specific ID token
    // was minted for this sign-in attempt; Google's API only accepts the
    // hashed form.
    const rawNonce = crypto.randomUUID();

    sha256Hex(rawNonce).then((hashedNonce) => {
      if (cancelled || !window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        nonce: hashedNonce,
        callback: async (response) => {
          const { error: signInError } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
            nonce: rawNonce,
          });
          if (signInError) {
            setError(signInError.message);
            return;
          }
          window.location.href = "/dashboard";
        },
      });
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [scriptLoaded, supabase]);

  return (
    <div>
      <Script src="https://accounts.google.com/gsi/client" onLoad={() => setScriptLoaded(true)} />
      <button
        type="button"
        className={styles.button}
        disabled={!ready}
        onClick={() => window.google?.accounts.id.prompt()}
      >
        <GoogleLogo />
        <span>Continue with Google</span>
      </button>
      {error && <p style={{ color: "#a33", fontSize: 13, marginTop: 8 }}>{error}</p>}
    </div>
  );
}
