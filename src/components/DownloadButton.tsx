import { Download } from "lucide-react";

export function DownloadButton({ fileId }: { fileId: string }) {
  return (
    <a
      href={`/api/drive/download?file_id=${fileId}`}
      title="Download original (4K, no transcoding)"
      className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--background-elev-2)] px-2 py-0.5 text-[11px] text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
    >
      <Download size={11} />
      download
    </a>
  );
}
