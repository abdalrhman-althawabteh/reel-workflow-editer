"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, PlusCircle, CheckSquare, LayoutGrid, Inbox } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile, Video } from "@/lib/types";
import { InboxBadge } from "./InboxBadge";
import { SignOutButton } from "./SignOutButton";
import { SidebarDrawer } from "./SidebarDrawer";

export function NavShell({
  profile,
  unread,
  projects,
  children,
}: {
  profile: Profile;
  unread: number;
  projects: Video[];
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Drawer rendered AT THE ROOT, outside any backdrop-filter ancestor.
          This ensures `position: fixed` + `inset-y-0` resolves to the actual
          viewport (not to the header that has backdrop-blur). */}
      <AnimatePresence>
        {drawerOpen && (
          <SidebarDrawer
            projects={projects}
            profile={profile}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-5">
          <AnimatedMenuToggle
            isOpen={drawerOpen}
            toggle={() => setDrawerOpen(!drawerOpen)}
          />

          <Link
            href="/"
            className="flex items-center gap-2 transition hover:opacity-80"
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-md font-mono text-xs font-bold text-white shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
              }}
            >
              R
            </span>
            <span className="font-semibold tracking-tight">Reel</span>
          </Link>

          <nav className="ml-3 flex items-center gap-0.5 text-sm">
            <NavItem href="/" icon={<LayoutGrid size={14} />}>
              Library
            </NavItem>
            <NavItem href="/inbox" icon={<Inbox size={14} />} badge={unread}>
              Inbox
            </NavItem>
            <NavItem href="/published" icon={<CheckSquare size={14} />}>
              Published
            </NavItem>
            {profile.role === "editor" && (
              <NavItem href="/new" icon={<PlusCircle size={14} />}>
                New idea
              </NavItem>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <InboxBadge userId={profile.user_id} initial={unread} />
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background-elev)] py-1 pl-1 pr-3">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-[var(--background-elev-2)] text-[10px] font-medium">
                  {profile.email.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-xs text-[var(--muted)]">
                {profile.role}
              </span>
            </div>
            <SignOutButton>
              <LogOut size={14} />
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-7 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

function AnimatedMenuToggle({
  isOpen,
  toggle,
}: {
  isOpen: boolean;
  toggle: () => void;
}) {
  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? "Close projects panel" : "Open projects panel"}
      className="relative z-[60] grid h-8 w-8 place-items-center rounded-md text-[var(--foreground)] transition hover:bg-[var(--background-elev)]"
    >
      <motion.svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        initial={false}
        animate={isOpen ? "open" : "closed"}
      >
        <motion.path
          fill="transparent"
          strokeWidth="2.4"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 3 5 L 21 5" },
            open: { d: "M 5 5 L 19 19" },
          }}
          transition={{ duration: 0.3 }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="2.4"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 3 12 L 21 12", opacity: 1 },
            open: { d: "M 3 12 L 21 12", opacity: 0 },
          }}
          transition={{ duration: 0.18 }}
        />
        <motion.path
          fill="transparent"
          strokeWidth="2.4"
          stroke="currentColor"
          strokeLinecap="round"
          variants={{
            closed: { d: "M 3 19 L 21 19" },
            open: { d: "M 5 19 L 19 5" },
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.svg>
    </button>
  );
}

function NavItem({
  href,
  icon,
  children,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[var(--muted)] transition-all duration-200 hover:bg-[var(--background-elev)] hover:text-[var(--foreground)]"
    >
      <span className="opacity-70 transition group-hover:opacity-100">
        {icon}
      </span>
      <span>{children}</span>
      {badge && badge > 0 ? (
        <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-px text-[10px] font-medium text-[var(--accent)]">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
