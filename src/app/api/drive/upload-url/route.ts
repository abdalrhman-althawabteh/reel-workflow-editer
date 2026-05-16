import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import {
  createResumableUploadSession,
  ensureRootFolder,
} from "@/lib/drive/upload-session";
import { driveErrorResponse } from "@/lib/drive/route-error";

const Body = z.object({
  video_id: z.string().uuid(),
  kind: z.enum(["raw", "edit", "audio", "b_roll"]),
  filename: z.string().min(1).max(300),
  mime_type: z.string(),
  size: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const { user, profile } = await requireUser();
    if (!user || !profile) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const parsed = Body.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }

    // Both creator and editor upload — but Drive belongs to the creator.
    const admin = createAdmin();
    const { data: creator } = await admin
      .from("profiles")
      .select("user_id, drive_refresh_token_encrypted, drive_root_folder_id")
      .eq("role", "creator")
      .maybeSingle();

    if (!creator?.drive_refresh_token_encrypted) {
      return NextResponse.json(
        { error: "creator hasn't connected Google Drive yet" },
        { status: 400 },
      );
    }

    const refreshToken = decryptToken(creator.drive_refresh_token_encrypted);

    let folderId = creator.drive_root_folder_id;
    if (!folderId) {
      folderId = await ensureRootFolder(refreshToken);
      await admin
        .from("profiles")
        .update({ drive_root_folder_id: folderId })
        .eq("user_id", creator.user_id);
    }

    const origin =
      request.headers.get("origin") ?? new URL(request.url).origin;

    const sessionUrl = await createResumableUploadSession({
      refreshToken,
      folderId,
      filename: parsed.data.filename,
      mimeType: parsed.data.mime_type,
      size: parsed.data.size,
      origin,
    });

    return NextResponse.json({ session_url: sessionUrl });
  } catch (err) {
    return driveErrorResponse(err);
  }
}
