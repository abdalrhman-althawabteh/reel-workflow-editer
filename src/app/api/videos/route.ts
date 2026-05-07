import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";

const Body = z.object({
  title: z.string().min(1).max(200),
  caption: z.string().max(2000).optional().default(""),
  ref_link: z.string().url().or(z.literal("")).optional().default(""),
  script: z.string().max(20000).optional().default(""),
});

export async function POST(request: Request) {
  const { user, profile, supabase } = await requireUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (profile.role !== "editor") {
    return NextResponse.json({ error: "only editors can create ideas" }, { status: 403 });
  }

  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const { data: video, error } = await supabase
    .from("videos")
    .insert({
      title: parsed.data.title,
      caption: parsed.data.caption || null,
      ref_link: parsed.data.ref_link || null,
      script: parsed.data.script || null,
      status: "idea",
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !video) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 });
  }

  // Notify the creator
  const admin = createAdmin();
  const { data: creator } = await admin
    .from("profiles")
    .select("user_id")
    .eq("role", "creator")
    .maybeSingle();
  if (creator) {
    await admin.from("activity").insert({
      user_id: creator.user_id,
      video_id: video.id,
      kind: "idea_proposed",
    });
  }

  return NextResponse.json({ id: video.id });
}
