import type { Category, ProductTone } from "@/lib/catalog";

export type AdminProduct = {
  key: string;
  slug: string;
  category: Category;
  name: string;
  description: string;
  detail: string | null;
  badge_text: string;
  weight: string;
  price_cents: number;
  stock_quantity: number;
  is_top_seller: boolean;
  active: boolean;
  tone: ProductTone;
  image_path: string;
  display_order: number;
};

export const adminProductFields =
  "key, slug, category, name, description, detail, badge_text, weight, price_cents, stock_quantity, is_top_seller, active, tone, image_path, display_order";
