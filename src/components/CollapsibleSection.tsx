"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      className={`rounded-xl border border-[var(--border)] bg-[var(--background-elev)]/40 ${className ?? ""}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <ChevronDown
          size={14}
          className={`transition ${open ? "" : "-rotate-90"}`}
        />
        {title}
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </section>
  );
}
