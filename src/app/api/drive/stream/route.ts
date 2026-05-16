import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getAccessToken } from "@/lib/drive/oauth";
import { driveErrorResponse } from "@/lib/drive/route-error";

// Streams a Drive file inline for `<video>` playback. Forwards Range headers
// so the browser can seek. Auth via Authorization header (not URL query) — that
// avoids Google's "We're sorry" anti-bot block we hit before.
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
  headers.set("Content-Type", driveRes.headers.get("content-type") ?? "video/mp4");
  headers.set("Accept-Ranges", driveRes.headers.get("accept-ranges") ?? "bytes");
  const cl = driveRes.headers.get("content-length");
  const cr = driveRes.headers.get("content-range");
  if (cl) headers.set("Content-Length", cl);
  if (cr) headers.set("Content-Range", cr);

  return new NextResponse(driveRes.body, {
    status: driveRes.status,
    headers,
  });
  } catch (err) {
    return driveErrorResponse(err);
  }
}
