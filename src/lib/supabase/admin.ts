import { createClient as createServiceClient } from "@supabase/supabase-js";

// Service-role client for server-only operations that must bypass RLS
// (e.g., reading a creator's encrypted Drive refresh token to mint upload sessions).
// Never import this from a client component.
export function createAdmin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
