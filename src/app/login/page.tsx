"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "https://www.googleapis.com/auth/drive.file",
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden gradient-mesh">
      <div className="absolute inset-0 -z-10 bg-[var(--background)]/80" />
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background-elev)]/80 p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-8">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--olive)] font-mono text-sm font-bold">
            R
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Reel</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Shared workspace for you and your editor.
          </p>
        </div>

        <button
          onClick={signIn}
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background-elev-2)] px-4 py-3 text-sm font-medium transition hover:border-[var(--accent)]/50 hover:bg-[var(--background-elev-2)]/80 disabled:opacity-50"
        >
          <GoogleIcon />
          {loading ? "Signing in…" : "Continue with Google"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        )}

        <p className="mt-6 text-xs leading-relaxed text-[var(--muted)]">
          We request Drive access so videos can be uploaded straight from your
          browser to your Google Drive.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.48C16.85 3.99 14.62 3 12 3 6.98 3 2.95 7.03 2.95 12.05S6.98 21.1 12 21.1c6.94 0 9.05-4.86 9.05-7.4 0-.5-.05-.9-.13-1.6z"
      />
    </svg>
  );
}
