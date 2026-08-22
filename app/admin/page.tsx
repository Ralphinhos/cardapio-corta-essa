import { redirect } from "next/navigation";
import { AdminAccessDenied, AdminDashboard } from "@/app/admin/admin-dashboard";
import {
  type AdminProduct,
  adminProductFields,
} from "@/app/admin/product-types";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fallbackRoutineCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!hasSupabasePublicConfig) redirect("/admin/login");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdmin, error: adminError } = await supabase.rpc(
    "is_catalog_admin",
  );

  if (adminError) {
    return (
      <AdminAccessDenied
        email={user.email ?? "usuário autenticado"}
        message="A verificação administrativa ainda não está disponível. Execute a migration do painel no Supabase."
      />
    );
  }

  if (!isAdmin) {
    return <AdminAccessDenied email={user.email ?? "usuário autenticado"} />;
  }

  const { data, error } = await supabase
    .from("catalog_products")
    .select(adminProductFields)
    .order("category")
    .order("display_order")
    .order("name");

  if (error) {
    return (
      <AdminAccessDenied
        email={user.email ?? "administrador"}
        message="Não foi possível carregar o catálogo. Confirme se a migration foi executada no Supabase."
      />
    );
  }

  const databaseProducts = ((data ?? []) as AdminProduct[]).map((product) => ({
    ...product,
    persisted: true,
  }));
  const databaseKeys = new Set(databaseProducts.map((product) => product.key));
  const routineFallbacks: AdminProduct[] = fallbackRoutineCatalog
    .filter((product) => !databaseKeys.has(product.key))
    .map((product) => ({
      key: product.key,
      slug: product.slug,
      category: "unit",
      name: product.name,
      description: product.description,
      detail: product.detail ?? null,
      badge_text: product.badgeText ?? "Vegetariano",
      weight: product.weight,
      price_cents: Math.round(product.price * 100),
      stock_quantity: 0,
      is_top_seller: false,
      active: true,
      tone: product.tone,
      image_path: product.imagePath,
      display_order: product.displayOrder,
      persisted: false,
    }));

  return (
    <AdminDashboard
      email={user.email ?? "administrador"}
      initialProducts={[...databaseProducts, ...routineFallbacks]}
    />
  );
}
