import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getAccessToken } from "@/lib/drive/oauth";
import { driveErrorResponse } from "@/lib/drive/route-error";

// Streams a Drive file with Content-Disposition: attachment so the browser
// triggers a Save dialog. CRITICAL: uses the file's real name + mime type from
// Drive so the saved file is byte-identical AND wrapper-identical to the
// original (e.g. IMG_1234.MOV / video/quicktime — not renamed to .mp4, which
// would break HEVC color profile handling on macOS).
export async function GET(request: NextRequest) {
  try {
  const { user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const fileId = request.nextUrl.searchParams.get("file_id");
  if (!fileId) {
    return NextResponse.json({ error: "file_id required" }, { status: 400 });
  }

  const admin = createAdmin();
  const { data: creator } = await admin
    .from("profiles")
    .select("drive_refresh_token_encrypted")
    .eq("role", "creator")
    .maybeSingle();
  if (!creator?.drive_refresh_token_encrypted) {
    return NextResponse.json({ error: "drive not connected" }, { status: 400 });
  }
  const refreshToken = decryptToken(creator.drive_refresh_token_encrypted);
  const accessToken = await getAccessToken(refreshToken);

  // 1. Pull real metadata so we can preserve the file's true identity
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!metaRes.ok) {
    return NextResponse.json(
      { error: `drive metadata fetch failed: ${metaRes.status}` },
      { status: 500 },
    );
  }
  const meta = (await metaRes.json()) as { name?: string; mimeType?: string };
  const originalName = meta.name ?? "download";
  const mimeType = meta.mimeType ?? "application/octet-stream";

  // 2. Build a filename. For raw + edit files we use the project title (so
  //    the editor can find them by project). For B-roll and audio, keep the
  //    creator's original filename — those names carry meaning ("wide_shot",
  //    "voiceover_take2") that gets lost if we rename them.
  const dotIdx = originalName.lastIndexOf(".");
  const ext = dotIdx > 0 ? originalName.slice(dotIdx) : "";

  const { data: fileRow } = await admin
    .from("video_files")
    .select("kind, revision_index, videos(title)")
    .eq("drive_file_id", fileId)
    .maybeSingle();

  let filename: string;
  if (!fileRow) {
    filename = originalName;
  } else if (fileRow.kind === "audio" || fileRow.kind === "b_roll") {
    filename = originalName;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const title = (fileRow.videos as any)?.title ?? "video";
    const safeTitle = title.replace(/[^a-z0-9_\-\s]/gi, "_").slice(0, 60).trim();
    const kindLabel =
      fileRow.kind === "edit"
        ? `edit-v${fileRow.revision_index ?? 1}`
        : "raw";
    filename = `${safeTitle}-${kindLabel}${ext}`;
  }

  // 3. Stream the bytes through, with Range support for large files
  const range = request.headers.get("range");
  const driveHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  if (range) driveHeaders["Range"] = range;

  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: driveHeaders },
  );
  if (!driveRes.ok && driveRes.status !== 206) {
    return NextResponse.json(
      { error: `drive fetch failed: ${driveRes.status}` },
      { status: driveRes.status },
    );
  }

  const headers = new Headers();
  // KEY: serve with the file's REAL mime type, not video/mp4
  headers.set("Content-Type", mimeType);
  headers.set("Content-Disposition", `attachment; filename="${filename.replace(/"/g, "")}"`);

  const cl = driveRes.headers.get("content-length");
  const cr = driveRes.headers.get("content-range");
  const ar = driveRes.headers.get("accept-ranges");
  if (cl) headers.set("Content-Length", cl);
  if (cr) headers.set("Content-Range", cr);
  if (ar) headers.set("Accept-Ranges", ar);

  return new NextResponse(driveRes.body, {
    status: driveRes.status,
    headers,
  });
  } catch (err) {
    return driveErrorResponse(err);
  }
}
