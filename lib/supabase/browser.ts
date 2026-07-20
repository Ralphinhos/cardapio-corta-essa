"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicUrl, supabasePublishableKey } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  if (!supabasePublicUrl || !supabasePublishableKey) {
    throw new Error("As variáveis públicas do Supabase não foram configuradas.");
  }

  return createBrowserClient(supabasePublicUrl, supabasePublishableKey);
}

