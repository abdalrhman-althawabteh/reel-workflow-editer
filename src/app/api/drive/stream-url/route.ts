import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getStreamableUrl } from "@/lib/drive/upload-session";
import { driveErrorResponse } from "@/lib/drive/route-error";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireUser();
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const fileId = request.nextUrl.searchParams.get("file_id");
    if (!fileId) return NextResponse.json({ error: "file_id required" }, { status: 400 });

    const admin = createAdmin();
    const { data: creator } = await admin
      .from("profiles")
      .select("drive_refresh_token_encrypted")
      .eq("role", "creator")
      .maybeSingle();
    if (!creator?.drive_refresh_token_encrypted) {
      return NextResponse.json({ error: "drive not connected" }, { status: 400 });
    }
    const token = decryptToken(creator.drive_refresh_token_encrypted);
    const url = await getStreamableUrl(token, fileId);
    return NextResponse.json({ url });
  } catch (err) {
    return driveErrorResponse(err);
  }
}
