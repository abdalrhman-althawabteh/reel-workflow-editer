"use client";

import { useEffect, useMemo, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowUp,
  ChevronDown,
  Search,
  Sparkles,
  BookOpen,
  Clock,
  Eye,
} from "lucide-react";
import { SECTIONS, type Block, type Section, type Tone } from "./content-guide/sections";

const TONE_MAP: Record<
  Tone,
  { bg: string; text: string; ring: string; soft: string }
> = {
  slate: {
    bg: "var(--status-slate)",
    text: "var(--status-slate)",
    ring: "var(--status-slate)",
    soft: "var(--status-slate-soft)",
  },
  sky: {
    bg: "var(--status-sky)",
    text: "var(--status-sky)",
    ring: "var(--status-sky)",
    soft: "var(--status-sky-soft)",
  },
  violet: {
    bg: "var(--status-violet)",
    text: "var(--status-violet)",
    ring: "var(--status-violet)",
    soft: "var(--status-violet-soft)",
  },
  amber: {
    bg: "var(--status-amber)",
    text: "var(--status-amber)",
    ring: "var(--status-amber)",
    soft: "var(--status-amber-soft)",
  },
  emerald: {
    bg: "var(--status-emerald)",
    text: "var(--status-emerald)",
    ring: "var(--status-emerald)",
    soft: "var(--status-emerald-soft)",
  },
  rose: {
    bg: "var(--status-rose)",
    text: "var(--status-rose)",
    ring: "var(--status-rose)",
    soft: "var(--status-rose-soft)",
  },
  lime: {
    bg: "var(--status-lime)",
    text: "var(--status-lime)",
    ring: "var(--status-lime)",
    soft: "var(--status-lime-soft)",
  },
  green: {
    bg: "var(--status-green)",
    text: "var(--status-green)",
    ring: "var(--status-green)",
    soft: "var(--status-green-soft)",
  },
};

export function ContentGuide() {
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const [showTop, setShowTop] = useState(false);
  const [query, setQuery] = useState("");

  // active section via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          );
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.subs.some((sub) => sub.title.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="relative">
      {/* scroll progress bar */}
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-[3px] origin-left"
        style={{
          scaleX: progressX,
          background:
            "linear-gradient(90deg, var(--accent) 0%, var(--olive) 100%)",
        }}
      />

      <Hero />

      <div className="mx-auto mt-10 grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1fr_240px]">
        {/* Main column */}
        <div className="min-w-0 space-y-12">
          {/* mobile TOC pills */}
          <div className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1 lg:hidden">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition ${
                  activeId === s.id
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--background-elev)] text-[var(--muted)]"
                }`}
              >
                {s.number} · {s.title}
              </a>
            ))}
          </div>

          {filtered.map((section, idx) => (
            <SectionCard key={section.id} section={section} index={idx} />
          ))}

          <Outro />
        </div>

        {/* sticky desktop TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elev)]/70 p-4 backdrop-blur">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                <BookOpen size={12} />
                Contents
              </div>
              <label className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background-elev-2)] px-2.5 py-1.5">
                <Search size={12} className="text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Filter…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none placeholder:text-[var(--muted-2)]"
                />
              </label>
              <ul className="space-y-0.5">
                {SECTIONS.map((s) => {
                  const active = activeId === s.id;
                  const visible =
                    !query.trim() || filtered.some((f) => f.id === s.id);
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className={`group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition ${
                          active
                            ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                            : visible
                            ? "text-[var(--muted)] hover:bg-[var(--background-elev-2)] hover:text-[var(--foreground)]"
                            : "text-[var(--muted-2)]/50"
                        }`}
                      >
                        <span
                          className={`font-mono text-[10px] tabular-nums ${
                            active
                              ? "text-[var(--accent)]"
                              : "text-[var(--muted-2)]"
                          }`}
                        >
                          {s.number}
                        </span>
                        <span className="truncate">{s.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.18 }}
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center rounded-full text-white shadow-lg shadow-[var(--accent)]/25 transition hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
            }}
            aria-label="Back to top"
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  const title = "Content Creation System";
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-[var(--border)] gradient-mesh">
      {/* blobs */}
      <FloatingBlob
        className="left-[-80px] top-[-60px] h-72 w-72"
        color="var(--accent)"
        delay={0}
      />
      <FloatingBlob
        className="right-[-100px] top-10 h-80 w-80"
        color="var(--olive)"
        delay={1.4}
      />
      <FloatingBlob
        className="left-1/3 bottom-[-100px] h-60 w-60"
        color="var(--accent-soft)"
        delay={0.7}
      />

      <div className="relative px-6 py-16 sm:px-10 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background-elev)]/80 px-3 py-1 text-xs text-[var(--muted)] backdrop-blur"
        >
          <Sparkles size={12} className="text-[var(--accent)]" />
          Internal reference · for the editor & creator
        </motion.div>

        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          {title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1 + i * 0.08,
                ease: [0.21, 1, 0.32, 1],
              }}
              className="mr-3 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-4 max-w-2xl text-base text-[var(--muted)] sm:text-lg"
          dir="rtl"
        >
          مرجع كامل لطريقة بناء محتوى عبدالرحمن الثوابتة — مستخرج من ٣٠ فيديو من لانا
          ومطبَّق على مجال الذكاء الاصطناعي و Claude Code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-7 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--background-elev)]/80 px-3 py-1 backdrop-blur">
            <Clock size={12} /> ~25 min read
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--background-elev)]/80 px-3 py-1 backdrop-blur">
            <BookOpen size={12} /> 11 parts
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--background-elev)]/80 px-3 py-1 backdrop-blur">
            <Eye size={12} /> live reference
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-8 flex items-center gap-2 text-xs text-[var(--muted-2)]"
        >
          <ChevronDown size={14} className="animate-bounce" />
          scroll to begin
        </motion.div>
      </div>
    </div>
  );
}

function FloatingBlob({
  className,
  color,
  delay,
}: {
  className: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ background: color, opacity: 0.25 }}
      animate={{
        x: [0, 20, -10, 0],
        y: [0, -15, 10, 0],
        scale: [1, 1.08, 0.96, 1],
      }}
      transition={{
        duration: 18,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ---------------- Section ---------------- */

function SectionCard({ section, index }: { section: Section; index: number }) {
  return (
    <motion.section
      id={section.id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.21, 1, 0.32, 1] }}
      className="scroll-mt-20"
    >
      <div className="mb-6 flex items-start gap-5">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 16,
            delay: 0.05,
          }}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-mono text-base font-bold text-white shadow-md"
          style={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
          }}
        >
          {section.number}
        </motion.div>
        <div className="min-w-0 flex-1 pt-1">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {section.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{section.tagline}</p>
        </div>
        <div className="hidden h-px flex-1 self-center bg-[var(--border)] sm:block" />
      </div>

      <div className="space-y-7 rounded-3xl border border-[var(--border)] bg-[var(--background-elev)]/60 p-6 backdrop-blur sm:p-8">
        {section.subs.map((sub, i) => (
          <div key={i} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
              {sub.title}
            </h3>
            <div className="space-y-4">
              {sub.blocks.map((b, j) => (
                <BlockRenderer key={j} block={b} index={index * 100 + j} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

/* ---------------- Blocks ---------------- */

function BlockRenderer({ block, index }: { block: Block; index: number }) {
  switch (block.kind) {
    case "p":
      return <p className="text-[15px] leading-relaxed text-[var(--foreground)]">{block.text}</p>;
    case "h":
      return (
        <h4 className="mt-2 text-base font-semibold text-[var(--foreground)]">
          {block.text}
        </h4>
      );
    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[var(--foreground)]"
            >
              <span
                aria-hidden
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
                }}
              />
              <span>{it}</span>
            </motion.li>
          ))}
        </ul>
      );
    case "checks":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--background-elev-2)] px-3.5 py-2.5 text-[15px] leading-relaxed"
            >
              <span
                aria-hidden
                className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${
                  it.good ? "" : ""
                }`}
                style={{
                  background: it.good
                    ? "var(--status-green)"
                    : "var(--status-rose)",
                }}
              >
                {it.good ? "✓" : "✗"}
              </span>
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          className="rounded-2xl border-l-4 p-4 text-[15px] italic leading-relaxed"
          style={{
            background: "var(--accent-soft)",
            borderColor: "var(--accent)",
            color: "var(--accent)",
          }}
          dir={block.ar ? "rtl" : "ltr"}
        >
          “{block.text}”
        </blockquote>
      );
    case "applied":
      return (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl p-5"
          style={{ background: "var(--olive-soft)" }}
        >
          <div
            className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--olive)" }}
          >
            → {block.title}
          </div>
          <ul className="space-y-1.5 text-[15px] leading-relaxed">
            {block.items.map((it, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full"
                  style={{ background: "var(--olive)" }}
                />
                <span dir="auto">{it}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      );
    case "meweyou":
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Me", text: block.me, color: "var(--accent)" },
            { label: "We", text: block.we, color: "var(--olive)" },
            { label: "You", text: block.you, color: "var(--status-rose)" },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-2xl border bg-[var(--background-elev-2)] p-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: c.color }}
              >
                {c.label}
              </div>
              <p className="text-[14px] leading-relaxed" dir="rtl">
                {c.text}
              </p>
            </motion.div>
          ))}
        </div>
      );
    case "pyramid":
      return <Pyramid />;
    case "tier":
      return <TierBlock tone={block.tone} label={block.label} items={block.items} />;
    case "hookCard":
      return (
        <HookCard
          label={block.label}
          template={block.template}
          why={block.why}
          examples={block.examples}
          tip={block.tip}
          delay={(index % 20) * 0.05}
        />
      );
    case "timeline":
      return <Timeline days={block.days} />;
    case "rule":
      return (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: block.number * 0.04 }}
          className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background-elev-2)] p-4 transition hover:shadow-sm"
        >
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-mono text-sm font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
            }}
          >
            {block.number}
          </div>
          <p className="pt-1.5 text-[15px] leading-relaxed">{block.text}</p>
        </motion.div>
      );
  }
}

/* ---------------- Pyramid ---------------- */

function Pyramid() {
  const tiers = [
    { label: "TOPIC · AUDIENCE · POSITIONING", color: "var(--status-emerald)" },
    { label: "Structure · SEO · Engagement · Hooks", color: "var(--status-violet)" },
    { label: "Frequency · Consistency · Production", color: "var(--status-sky)" },
    { label: "Posting time", color: "var(--status-slate)" },
  ];
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      {tiers.map((t, i) => {
        const width = 35 + i * 18; // % — top narrow, bottom wide
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0.6 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{ width: `${width}%`, background: t.color }}
            className="origin-bottom grid place-items-center rounded-md py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-white shadow-sm"
          >
            {t.label}
          </motion.div>
        );
      })}
      <div className="mt-2 text-xs text-[var(--muted)]">
        ↑ what actually matters · ↓ what barely matters
      </div>
    </div>
  );
}

function TierBlock({
  tone,
  label,
  items,
}: {
  tone: Tone;
  label: string;
  items: string[];
}) {
  const c = TONE_MAP[tone];
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: c.bg, background: c.soft }}
    >
      <div
        className="mb-2 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: c.text }}
      >
        {label}
      </div>
      <ul className="space-y-1.5 text-[14.5px] leading-relaxed text-[var(--foreground)]">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              className="mt-2 h-1 w-1 shrink-0 rounded-full"
              style={{ background: c.bg }}
            />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Hook flip card ---------------- */

function HookCard({
  label,
  template,
  why,
  examples,
  tip,
  delay,
}: {
  label: string;
  template: string;
  why: string[];
  examples: string[];
  tip?: string;
  delay: number;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="[perspective:1400px]"
    >
      <motion.button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.21, 1, 0.32, 1] }}
        className="relative grid w-full text-left [transform-style:preserve-3d]"
        style={{ minHeight: 220 }}
      >
        {/* Front */}
        <div
          className="col-start-1 row-start-1 flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--background-elev-2)] p-5 [backface-visibility:hidden]"
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
              }}
            >
              HOOK {label}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted-2)]">
              tap to flip
            </span>
          </div>
          <p className="text-lg font-medium leading-snug text-[var(--foreground)]">
            “{template}”
          </p>
          <div className="mt-4 space-y-1.5">
            {why.map((w, i) => (
              <p
                key={i}
                className="flex items-start gap-2 text-[13px] text-[var(--muted)]"
              >
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                {w}
              </p>
            ))}
          </div>
          {tip ? (
            <p className="mt-3 rounded-lg bg-[var(--accent-soft)] px-2.5 py-1.5 text-[12px] text-[var(--accent)]">
              💡 {tip}
            </p>
          ) : null}
        </div>

        {/* Back */}
        <div
          className="col-start-1 row-start-1 flex flex-col rounded-2xl border p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{
            borderColor: "var(--olive)",
            background: "var(--olive-soft)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white"
              style={{ background: "var(--olive)" }}
            >
              For Abdulrahman
            </span>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--olive)" }}>
              tap to flip back
            </span>
          </div>
          <ul className="space-y-2" dir="rtl">
            {examples.map((ex, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-[14px] leading-relaxed text-[var(--foreground)]"
              >
                <span
                  className="mt-2 h-1 w-1 shrink-0 rounded-full"
                  style={{ background: "var(--olive)" }}
                />
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.button>
    </motion.div>
  );
}

/* ---------------- Timeline ---------------- */

function Timeline({
  days,
}: {
  days: {
    day: string;
    funnel: string;
    framework: string;
    idea: string;
    why: string;
  }[];
}) {
  return (
    <div className="relative space-y-4 pl-6">
      {/* vertical line */}
      <div
        aria-hidden
        className="absolute bottom-0 left-2 top-2 w-px"
        style={{
          background:
            "linear-gradient(180deg, var(--accent) 0%, var(--olive) 100%)",
        }}
      />
      {days.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
          className="relative"
        >
          <div
            aria-hidden
            className="absolute -left-[18px] top-2 h-3 w-3 rounded-full ring-4 ring-[var(--background)]"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
            }}
          />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elev-2)] p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, var(--olive) 100%)",
                }}
              >
                {d.day}
              </span>
              <span
                className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--accent)" }}
              >
                {d.funnel}
              </span>
              <span className="text-[12px] text-[var(--muted)]">
                {d.framework}
              </span>
            </div>
            <p
              className="text-[15px] font-medium leading-relaxed text-[var(--foreground)]"
              dir="rtl"
            >
              {d.idea}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
              <span
                className="font-semibold"
                style={{ color: "var(--olive)" }}
              >
                Why:{" "}
              </span>
              {d.why}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- Outro ---------------- */

function Outro() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-3xl border border-[var(--border)] gradient-mesh p-8 text-center"
    >
      <Sparkles
        size={20}
        className="mx-auto mb-3"
        style={{ color: "var(--accent)" }}
      />
      <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Document compiled from 30 video transcripts of Lana&apos;s content coaching account.
        All frameworks, techniques, and strategies are her intellectual property —
        adapted here for educational reference and content planning purposes only.
      </p>
      <p className="mt-3 text-xs text-[var(--muted-2)]">
        Applied to Abdulrahman Thawabteh · @abd_thawabteh · AI Business Academy · Leads Alchemy
      </p>
    </motion.div>
  );
}
