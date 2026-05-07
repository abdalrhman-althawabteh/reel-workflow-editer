export const STATUSES = [
  "idea",
  "ready_to_film",
  "raw_uploaded",
  "editing",
  "in_review",
  "revisions_requested",
  "approved",
  "published",
] as const;

export type Status = (typeof STATUSES)[number];
export type Role = "creator" | "editor";

export const STATUS_META: Record<
  Status,
  { label: string; tone: string; description: string }
> = {
  idea: {
    label: "Idea",
    tone: "bg-[var(--status-slate-soft)] text-[var(--status-slate)] ring-[var(--status-slate)]/20",
    description: "Editor proposed an idea. Awaiting your decision.",
  },
  ready_to_film: {
    label: "Ready to film",
    tone: "bg-[var(--status-sky-soft)] text-[var(--status-sky)] ring-[var(--status-sky)]/20",
    description: "You've queued this for filming.",
  },
  raw_uploaded: {
    label: "Raw uploaded",
    tone: "bg-[var(--status-violet-soft)] text-[var(--status-violet)] ring-[var(--status-violet)]/20",
    description: "Raw footage uploaded. Waiting for editor to claim.",
  },
  editing: {
    label: "Editing",
    tone: "bg-[var(--status-amber-soft)] text-[var(--status-amber)] ring-[var(--status-amber)]/20",
    description: "Editor is working on the cut.",
  },
  in_review: {
    label: "In review",
    tone: "bg-[var(--status-emerald-soft)] text-[var(--status-emerald)] ring-[var(--status-emerald)]/20",
    description: "Edit ready for your review.",
  },
  revisions_requested: {
    label: "Revisions requested",
    tone: "bg-[var(--status-rose-soft)] text-[var(--status-rose)] ring-[var(--status-rose)]/20",
    description: "You sent it back with notes.",
  },
  approved: {
    label: "Approved",
    tone: "bg-[var(--status-lime-soft)] text-[var(--status-lime)] ring-[var(--status-lime)]/20",
    description: "Approved. Mark as published once it goes live.",
  },
  published: {
    label: "Published",
    tone: "bg-[var(--status-green-soft)] text-[var(--status-green)] ring-[var(--status-green)]/30",
    description: "Live. Done.",
  },
};

type Transition = {
  from: Status;
  to: Status;
  role: Role;
  uploadKind?: "raw" | "edit";
  requires?: "note" | "publish_url";
};

export const TRANSITIONS: Transition[] = [
  { from: "idea", to: "ready_to_film", role: "creator" },
  { from: "ready_to_film", to: "raw_uploaded", role: "creator", uploadKind: "raw" },
  { from: "idea", to: "raw_uploaded", role: "creator", uploadKind: "raw" },
  { from: "raw_uploaded", to: "editing", role: "editor" },
  { from: "editing", to: "in_review", role: "editor", uploadKind: "edit" },
  { from: "in_review", to: "revisions_requested", role: "creator", requires: "note" },
  { from: "revisions_requested", to: "in_review", role: "editor", uploadKind: "edit" },
  { from: "in_review", to: "approved", role: "creator" },
  { from: "approved", to: "published", role: "creator", requires: "publish_url" },
];

export function findTransition(from: Status, to: Status, role: Role) {
  return TRANSITIONS.find((t) => t.from === from && t.to === to && t.role === role);
}

export function nextActionsFor(role: Role, status: Status) {
  return TRANSITIONS.filter((t) => t.role === role && t.from === status);
}
