"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      title="Sign out"
      className="grid h-7 w-7 place-items-center rounded-full border border-[var(--border)] bg-[var(--background-elev)] text-[var(--muted)] transition hover:text-rose-300"
    >
      {children}
    </button>
  );
}
