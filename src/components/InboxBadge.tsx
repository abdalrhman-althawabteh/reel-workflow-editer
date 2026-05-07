"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function InboxBadge({
  userId,
  initial,
}: {
  userId: string;
  initial: number;
}) {
  const [count, setCount] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`activity:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity",
          filter: `user_id=eq.${userId}`,
        },
        () => setCount((c) => c + 1),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "activity",
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const { count: c } = await supabase
            .from("activity")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .is("read_at", null);
          if (typeof c === "number") setCount(c);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (count <= 0) return null;
  return (
    <span className="absolute right-3 top-3 hidden md:block" aria-hidden>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
      </span>
    </span>
  );
}
