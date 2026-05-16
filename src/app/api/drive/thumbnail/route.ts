import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getAccessToken } from "@/lib/drive/oauth";

// Proxies Drive's auto-generated thumbnail for a file. Drive's thumbnailLink
// is signed and short-lived, so we fetch a fresh metadata pull each time and
// re-stream the image. Browser caching (Cache-Control) absorbs the load.
export async function GET(request: NextRequest) {
  try {
  const { user } = await requireUser();
  if (!user) return new NextResponse(null, { status: 401 });

  const fileId = request.nextUrl.searchParams.get("file_id");
  if (!fileId) return new NextResponse(null, { status: 400 });

  const admin = createAdmin();
  const { data: creator } = await admin
    .from("profiles")
    .select("drive_refresh_token_encrypted")
    .eq("role", "creator")
    .maybeSingle();
  if (!creator?.drive_refresh_token_encrypted) {
    return new NextResponse(null, { status: 404 });
  }

  const refreshToken = decryptToken(creator.drive_refresh_token_encrypted);
  const accessToken = await getAccessToken(refreshToken);

  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,hasThumbnail,mimeType`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!metaRes.ok) return new NextResponse(null, { status: 404 });

  const meta = (await metaRes.json()) as {
    thumbnailLink?: string;
    hasThumbnail?: boolean;
  };

  // Drive returns a generic file-type icon as `thumbnailLink` even when the
  // real thumbnail isn't ready yet. The `hasThumbnail` flag is the source of
  // truth — short-circuit to 404 when false so the client falls back to a
  // proper placeholder instead of rendering Drive's icon as a poster.
  if (!meta.hasThumbnail || !meta.thumbnailLink) {
    return new NextResponse(null, { status: 404 });
  }

  // Ask for a portrait crop (9:16-ish) so vertical Reel clips look right.
  // The =s/=w syntax is documented at
  // https://developers.google.com/people/image-sizing
  const thumbUrl = meta.thumbnailLink.replace(/=s\d+$|=w\d+(-h\d+)?$/, "=w400-h720");

  const thumbRes = await fetch(thumbUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!thumbRes.ok) return new NextResponse(null, { status: thumbRes.status });

  return new NextResponse(thumbRes.body, {
    status: 200,
    headers: {
      "Content-Type": thumbRes.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
  } catch (err) {
    console.error("[drive thumbnail]", err);
    return new NextResponse(null, { status: 500 });
  }
}
