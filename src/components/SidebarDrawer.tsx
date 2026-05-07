"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, LogOut, Plus, Inbox, CheckSquare, LayoutGrid } from "lucide-react";
import type { Profile, Video } from "@/lib/types";
import { STATUS_META, type Status } from "@/lib/status";
import { projectGradientCss } from "@/lib/project-color";
import { timeAgo } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const slideVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function SidebarDrawer({
  projects,
  profile,
  onClose,
}: {
  projects: Video[];
  profile: Profile;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = query.trim()
    ? projects.filter((p) =>
        p.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : projects;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const isOnRoute = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={fadeVariants}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-[var(--background-overlay)] backdrop-blur-sm"
      />

      {/* Drawer panel — `inset-y-0` pins to viewport top + bottom because this
          component is rendered OUTSIDE any backdrop-filter ancestor. */}
      <motion.aside
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={slideVariants}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-y-0 left-0 z-50 flex w-[19rem] flex-col bg-[var(--background-elev)] shadow-2xl"
      >
        {/* Profile */}
        <div className="shrink-0 border-b border-[var(--border)] p-4">
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="h-11 w-11 rounded-full object-cover ring-2 ring-[var(--background-elev-2)]"
              />
            ) : (
              <div
                className="grid h-11 w-11 place-items-center rounded-full text-sm font-semibold uppercase text-white/90 ring-2 ring-[var(--background-elev-2)]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
                }}
              >
                {(profile.display_name ?? profile.email).slice(0, 2)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {profile.display_name ?? "Reel"}
              </p>
              <p className="truncate text-[11px] text-[var(--muted)]">
                {profile.email}
              </p>
            </div>
            <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--accent)]">
              {profile.role}
            </span>
          </div>
        </div>

        {/* Quick links */}
        <nav className="shrink-0 space-y-0.5 border-b border-[var(--border)] p-3">
          <DrawerLink href="/" icon={<LayoutGrid size={15} />} active={isOnRoute("/")}>
            Library
          </DrawerLink>
          <DrawerLink href="/inbox" icon={<Inbox size={15} />} active={isOnRoute("/inbox")}>
            Inbox
          </DrawerLink>
          <DrawerLink href="/published" icon={<CheckSquare size={15} />} active={isOnRoute("/published")}>
            Published
          </DrawerLink>
          {profile.role === "editor" && (
            <DrawerLink href="/new" icon={<Plus size={15} />} active={isOnRoute("/new")}>
              New idea
            </DrawerLink>
          )}
        </nav>

        {/* Search */}
        <div className="shrink-0 px-3 pt-3">
          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background-elev-2)] px-3 py-2">
            <Search size={13} className="text-[var(--muted)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-2)]"
            />
          </div>
          <p className="mt-3 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Projects · {projects.length}
          </p>
        </div>

        {/* Project list (scrollable) */}
        <ul className="scrollbar-thin min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 pb-3">
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-xs text-[var(--muted)]">
              {query.trim() ? "No matches." : "No projects yet."}
            </li>
          ) : (
            filtered.map((p) => (
              <DrawerProjectRow
                key={p.id}
                project={p}
                onNavigate={onClose}
              />
            ))
          )}
        </ul>

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--background-elev-2)] hover:text-[var(--foreground)]"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function DrawerLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
          : "text-[var(--foreground)] hover:bg-[var(--background-elev-2)]"
      }`}
    >
      <span className="opacity-80">{icon}</span>
      {children}
    </Link>
  );
}

function DrawerProjectRow({
  project,
  onNavigate,
}: {
  project: Video;
  onNavigate: () => void;
}) {
  const status = project.status as Status;
  const meta = STATUS_META[status];
  const initial = (project.title || "?").trim().slice(0, 1).toUpperCase();
  const dotClass =
    meta.tone.split(" ").find((c) => c.startsWith("text-")) ?? "";

  return (
    <li>
      <Link
        href={`/video/${project.id}`}
        onClick={onNavigate}
        className="flex items-center gap-3 overflow-hidden rounded-xl px-2 py-1.5 transition hover:bg-[var(--background-elev-2)]"
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-mono text-sm font-medium text-white/90 shadow-sm"
          style={{ background: projectGradientCss(project.id) }}
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-tight">
            {project.title}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] text-[var(--muted)]">
            <span
              className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current ${dotClass}`}
            />
            <span className="truncate">
              {meta.label} · {timeAgo(project.updated_at)}
            </span>
          </p>
        </div>
      </Link>
    </li>
  );
}
