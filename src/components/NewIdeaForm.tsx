"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewIdeaForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [refLink, setRefLink] = useState("");
  const [script, setScript] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, caption, ref_link: refLink, script }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Failed to create");
      setSubmitting(false);
      return;
    }
    const { id } = await res.json();
    router.push(`/video/${id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Title" required>
        <input
          required
          dir="auto"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="3 mistakes in your first React app"
          className={inputCls}
        />
      </Field>
      <Field label="Caption" hint="Will go under the post when published.">
        <textarea
          dir="auto"
          rows={2}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Quick rant about useEffect."
          className={inputCls}
        />
      </Field>
      <Field
        label="Reference link"
        hint="The video that inspired the idea (YouTube, TikTok, etc.)."
      >
        <input
          value={refLink}
          onChange={(e) => setRefLink(e.target.value)}
          placeholder="https://youtube.com/watch?v=…"
          className={inputCls}
        />
      </Field>
      <Field label="Script" required>
        <textarea
          required
          dir="auto"
          rows={12}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="HOOK — open with…&#10;&#10;BODY —&#10;&#10;CTA —"
          className={`${inputCls} font-mono text-[13px] leading-relaxed`}
        />
      </Field>

      {error ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          disabled={submitting}
          className="rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--olive)] px-4 py-2 text-sm font-medium text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Send to creator"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          {label}
          {required ? <span className="ml-1 text-rose-400">*</span> : null}
        </span>
        {hint ? (
          <span className="text-[11px] text-[var(--muted)]">{hint}</span>
        ) : null}
      </div>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--background-elev)] px-3 py-2 text-sm placeholder:text-[var(--muted)]/60 focus:border-[var(--accent)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/15";
