"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import type { Video } from "@/lib/types";

export function EditDetailsButton({ video }: { video: Video }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [caption, setCaption] = useState(video.caption ?? "");
  const [refLink, setRefLink] = useState(video.ref_link ?? "");
  const [script, setScript] = useState(video.script ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setError(null);
  }

  function reset() {
    setTitle(video.title);
    setCaption(video.caption ?? "");
    setRefLink(video.ref_link ?? "");
    setScript(video.script ?? "");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/videos/${video.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        caption,
        ref_link: refLink,
        script,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "save failed");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background-elev)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40"
      >
        <Pencil size={14} /> Edit details
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="close"
            onClick={close}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <form
            onSubmit={save}
            className="relative z-10 w-full max-w-2xl space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--background-elev)] p-6 shadow-2xl"
          >
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Edit details
              </h2>
              <button
                type="button"
                onClick={close}
                className="grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--background-elev-2)] hover:text-[var(--foreground)]"
              >
                <X size={16} />
              </button>
            </header>

            <Field label="Title" required>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Caption">
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Reference link">
              <input
                value={refLink}
                onChange={(e) => setRefLink(e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </Field>
            <Field label="Script">
              <textarea
                rows={10}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className={`${inputCls} font-mono text-[13px] leading-relaxed`}
              />
            </Field>

            {error ? (
              <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            ) : null}

            <footer className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !title.trim()}
                className="rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--olive)] px-4 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </footer>
          </form>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {label}
        {required ? <span className="ml-1 text-rose-400">*</span> : null}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background-elev-2)] px-3 py-2 text-sm placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15";
