import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptToken } from "@/lib/drive/encrypt-token";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error?.message ?? "unknown")}`);
  }

  const user = data.user;
  const session = data.session;

  // Bootstrap profile on first login.
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const bootstrapEmail = process.env.BOOTSTRAP_CREATOR_EMAIL?.toLowerCase();
  const role =
    existing?.role ??
    (user.email?.toLowerCase() === bootstrapEmail ? "creator" : "editor");

  // Pull provider tokens from session (Supabase exposes them on OAuth sign-in)
  const providerRefreshToken = session?.provider_refresh_token ?? null;

  const update: Record<string, unknown> = {
    user_id: user.id,
    email: user.email,
    role,
    display_name:
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };

  if (role === "creator" && providerRefreshToken) {
    update.drive_refresh_token_encrypted = encryptToken(providerRefreshToken);
  }

  await supabase.from("profiles").upsert(update, { onConflict: "user_id" });

  return NextResponse.redirect(`${origin}${next}`);
}
