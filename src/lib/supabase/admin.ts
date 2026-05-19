import { createClient } from "@supabase/supabase-js";

type AdminClient = ReturnType<typeof createClient>;
const g = globalThis as typeof globalThis & { _adminClient?: AdminClient };

export function createAdminClient() {
  if (!g._adminClient) {
    g._adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }
  return g._adminClient;
}
