import { createClient } from "@supabase/supabase-js";
import {
  type CatalogProduct,
  type Category,
  type ProductTone,
  fallbackCatalog,
} from "@/lib/catalog";

export type CatalogInventory = {
  key: string;
  stock_quantity: number;
  is_top_seller: boolean;
};

type CatalogRow = {
  key: unknown;
  slug: unknown;
  category: unknown;
  name: unknown;
  description: unknown;
  detail: unknown;
  badge_text: unknown;
  weight: unknown;
  price_cents: unknown;
  tone: unknown;
  image_path: unknown;
  display_order: unknown;
  stock_quantity: unknown;
  is_top_seller: unknown;
};

const isCategory = (value: unknown): value is Category =>
  value === "kit" || value === "unit";

const isTone = (value: unknown): value is ProductTone =>
  value === "green" || value === "orange";

const fallbackWithInventory = (inventory: CatalogInventory[]) => {
  const inventoryByKey = new Map(inventory.map((item) => [item.key, item]));
  return fallbackCatalog.map((product) => {
    const current = inventoryByKey.get(product.key);
    return {
      ...product,
      stockQuantity: current?.stock_quantity ?? null,
      isTopSeller: current?.is_top_seller ?? false,
    };
  });
};

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) return fallbackCatalog;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("catalog_products")
    .select(
      "key, slug, category, name, description, detail, badge_text, weight, price_cents, tone, image_path, display_order, stock_quantity, is_top_seller",
    )
    .eq("active", true)
    .order("category")
    .order("display_order")
    .order("created_at");

  if (!error) {
    return ((data ?? []) as CatalogRow[]).flatMap((row) => {
      if (
        typeof row.key !== "string" ||
        typeof row.slug !== "string" ||
        !isCategory(row.category) ||
        typeof row.name !== "string" ||
        typeof row.description !== "string" ||
        typeof row.weight !== "string" ||
        typeof row.image_path !== "string"
      ) {
        return [];
      }

      return [
        {
          key: row.key,
          slug: row.slug,
          category: row.category,
          name: row.name,
          description: row.description,
          detail: typeof row.detail === "string" && row.detail ? row.detail : undefined,
          badgeText:
            typeof row.badge_text === "string" && row.badge_text
              ? row.badge_text
              : "Feito para a brasa",
          weight: row.weight,
          price: Number(row.price_cents) / 100,
          tone: isTone(row.tone) ? row.tone : "green",
          imagePath: row.image_path,
          displayOrder: Number(row.display_order) || 0,
          stockQuantity: Number(row.stock_quantity),
          isTopSeller: Boolean(row.is_top_seller),
        },
      ];
    });
  }

  console.error(
    "[catalog] Catálogo dinâmico indisponível; usando dados locais:",
    error.message,
  );

  const { data: legacyData, error: legacyError } = await supabase
    .from("catalog_products")
    .select("key, stock_quantity, is_top_seller")
    .eq("active", true);

  if (legacyError) return fallbackCatalog;

  return fallbackWithInventory(
    (legacyData ?? []).map((product) => ({
      key: String(product.key),
      stock_quantity: Number(product.stock_quantity),
      is_top_seller: Boolean(product.is_top_seller),
    })),
  );
}
