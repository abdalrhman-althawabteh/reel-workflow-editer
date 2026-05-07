import Link from "next/link";
import { Film, Layers, Music, Scissors } from "lucide-react";
import type { Video, VideoFile } from "@/lib/types";
import { TRANSITIONS, type Role, type Status } from "@/lib/status";
import { StatusBadge } from "./StatusBadge";
import { timeAgo } from "@/lib/utils";
import { projectGradientCss } from "@/lib/project-color";

function isYourTurn(status: Status, role: Role) {
  return TRANSITIONS.some((t) => t.role === role && t.from === status);
}

export function AssetCard({
  video,
  files,
  role,
  aspect,
}: {
  video: Video;
  files: VideoFile[];
  role: Role;
  aspect: "video" | "portrait";
}) {
  const yourTurn = isYourTurn(video.status as Status, role);
  const aspectClass = aspect === "portrait" ? "aspect-[9/16]" : "aspect-video";

  const counts = {
    edit: files.filter((f) => f.kind === "edit").length,
    raw: files.filter((f) => f.kind === "raw").length,
    audio: files.filter((f) => f.kind === "audio").length,
    b_roll: files.filter((f) => f.kind === "b_roll").length,
  };

  // Big initial letter on the gradient — gives each card its own identity
  const initial = (video.title || "?").trim().slice(0, 1).toUpperCase();

  return (
    <Link
      href={`/video/${video.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background-elev)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-lg hover:shadow-black/5"
    >
      <div
        className={`relative ${aspectClass} overflow-hidden`}
        style={{ background: projectGradientCss(video.id) }}
      >
        {/* Big translucent initial as the visual focal point */}
        <div className="absolute inset-0 grid place-items-center">
          <span
            className="font-mono font-medium text-white/35 transition-transform duration-500 group-hover:scale-105"
            style={{ fontSize: "min(48%, 8rem)" }}
          >
            {initial}
          </span>
        </div>

        {/* Top-left: status */}
        <div className="absolute left-2.5 top-2.5">
          <StatusBadge
            status={video.status as Status}
            className="bg-white/85 backdrop-blur-md ring-0 shadow-sm"
          />
        </div>

        {/* Top-right: your turn */}
        {yourTurn ? (
          <div className="absolute right-2.5 top-2.5 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md">
            Your turn
          </div>
        ) : null}

        {/* Bottom-right: file pills */}
        <div className="absolute bottom-2.5 right-2.5 flex gap-1">
          {counts.edit > 0 ? (
            <PillBadge icon={<Scissors size={10} />} text={`v${counts.edit}`} />
          ) : null}
          {counts.raw > 0 ? (
            <PillBadge icon={<Film size={10} />} text={String(counts.raw)} />
          ) : null}
          {counts.audio > 0 ? (
            <PillBadge icon={<Music size={10} />} text={String(counts.audio)} />
          ) : null}
          {counts.b_roll > 0 ? (
            <PillBadge icon={<Layers size={10} />} text={String(counts.b_roll)} />
          ) : null}
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {video.title}
        </h3>
        <p className="mt-1 text-[11px] text-[var(--muted)]">
          {timeAgo(video.updated_at)}
        </p>
      </div>
    </Link>
  );
}

function PillBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/85 px-1.5 py-0.5 text-[10px] font-medium text-[var(--foreground)] backdrop-blur-md shadow-sm">
      {icon}
      {text}
    </span>
  );
}
