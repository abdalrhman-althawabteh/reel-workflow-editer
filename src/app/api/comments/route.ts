import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";

const Body = z.object({
  video_file_id: z.string().uuid(),
  body: z.string().min(1).max(2000),
  timestamp_seconds: z.number().nullable().optional(),
});

export async function POST(request: Request) {
  const { user, profile, supabase } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({
      video_file_id: parsed.data.video_file_id,
      author_id: user.id,
      body: parsed.data.body,
      timestamp_seconds: parsed.data.timestamp_seconds ?? null,
    })
    .select()
    .single();

  if (error || !comment) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
  }

  // Notify the editor (the file was uploaded by them; we ping them).
  const admin = createAdmin();
  const { data: file } = await admin
    .from("video_files")
    .select("video_id, uploaded_by")
    .eq("id", parsed.data.video_file_id)
    .maybeSingle();
  if (file && file.uploaded_by !== user.id) {
    await admin.from("activity").insert({
      user_id: file.uploaded_by,
      video_id: file.video_id,
      kind: "comment",
    });
  }

  return NextResponse.json({ id: comment.id });
}
