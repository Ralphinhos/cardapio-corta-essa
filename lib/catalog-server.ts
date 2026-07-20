import { createClient } from "@supabase/supabase-js";

export type CatalogInventory = {
  key: string;
  stock_quantity: number;
  is_top_seller: boolean;
};

export async function getCatalogInventory(): Promise<CatalogInventory[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecretKey) return [];

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("catalog_products")
    .select("key, stock_quantity, is_top_seller")
    .eq("active", true);

  if (error) {
    console.error("[catalog] Não foi possível carregar o estoque:", error.message);
    return [];
  }

  return (data ?? []).map((product) => ({
    key: String(product.key),
    stock_quantity: Number(product.stock_quantity),
    is_top_seller: Boolean(product.is_top_seller),
  }));
}

