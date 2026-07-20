import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublicUrl, supabasePublishableKey } from "@/lib/supabase/config";

export async function createSupabaseServerClient() {
  if (!supabasePublicUrl || !supabasePublishableKey) {
    throw new Error("As variáveis públicas do Supabase não foram configuradas.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabasePublicUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components não podem gravar cookies. O proxy renova a sessão.
        }
      },
    },
  });
}

