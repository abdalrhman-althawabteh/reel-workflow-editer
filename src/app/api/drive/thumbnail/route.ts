import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getAccessToken } from "@/lib/drive/oauth";

// Proxies Drive's auto-generated thumbnail for a file. Drive's thumbnailLink
// is signed and short-lived, so we fetch a fresh metadata pull each time and
// re-stream the image. Browser caching (Cache-Control) absorbs the load.
export async function GET(request: NextRequest) {
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
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,mimeType`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!metaRes.ok) return new NextResponse(null, { status: 404 });

  const meta = (await metaRes.json()) as { thumbnailLink?: string };
  if (!meta.thumbnailLink) return new NextResponse(null, { status: 404 });

  // Bump thumb size — Drive default is 220px; ask for 640px for sharper cards
  const thumbUrl = meta.thumbnailLink.replace(/=s\d+$/, "=s640");

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
}
