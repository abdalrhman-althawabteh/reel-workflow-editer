import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import { decryptToken } from "@/lib/drive/encrypt-token";
import { getAccessToken } from "@/lib/drive/oauth";

const PatchBody = z.object({
  title: z.string().min(1).max(200).optional(),
  caption: z.string().max(2000).nullable().optional(),
  script: z.string().max(20000).nullable().optional(),
  ref_link: z.string().url().or(z.literal("")).nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { user, profile, supabase } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const parsed = PatchBody.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) update.title = parsed.data.title;
  if (parsed.data.caption !== undefined)
    update.caption = parsed.data.caption || null;
  if (parsed.data.script !== undefined)
    update.script = parsed.data.script || null;
  if (parsed.data.ref_link !== undefined)
    update.ref_link = parsed.data.ref_link || null;

  const { error } = await supabase.from("videos").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// Deletes the video, all its files, comments, and activity. Drive files are
// moved to trash (recoverable in Drive for 30 days, then auto-purged).
export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { user, profile } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const admin = createAdmin();

  // Pull files to trash from Drive
  const { data: files } = await admin
    .from("video_files")
    .select("drive_file_id")
    .eq("video_id", id);

  if (files && files.length > 0) {
    const { data: creator } = await admin
      .from("profiles")
      .select("drive_refresh_token_encrypted")
      .eq("role", "creator")
      .maybeSingle();

    if (creator?.drive_refresh_token_encrypted) {
      const refreshToken = decryptToken(creator.drive_refresh_token_encrypted);
      const accessToken = await getAccessToken(refreshToken);

      // Best-effort trash. We don't fail the whole delete if a file is
      // already gone or fails to trash.
      await Promise.allSettled(
        files.map((f) =>
          fetch(
            `https://www.googleapis.com/drive/v3/files/${f.drive_file_id}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ trashed: true }),
            },
          ),
        ),
      );
    }
  }

  // Delete from DB. Cascade handles video_files, comments, activity.
  const { error } = await admin.from("videos").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
