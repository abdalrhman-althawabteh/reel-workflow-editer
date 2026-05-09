import Link from "next/link";
import { LayoutGrid, Inbox, CheckSquare, Menu } from "lucide-react";

export function SkeletonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-5">
          <div className="grid h-8 w-8 place-items-center rounded-md text-[var(--foreground)]">
            <Menu size={18} />
          </div>
          <Link href="/" className="flex items-center gap-2">
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
            <NavItem href="/inbox" icon={<Inbox size={14} />}>
              Inbox
            </NavItem>
            <NavItem href="/published" icon={<CheckSquare size={14} />}>
              Published
            </NavItem>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Skel className="h-7 w-24 rounded-full" />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-7 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

export function Skel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--border)]/60 ${className}`}
    />
  );
}

function NavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      {icon}
      {children}
    </Link>
  );
}
