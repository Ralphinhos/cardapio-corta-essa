import { redirect } from "next/navigation";
import { AdminAccessDenied, AdminDashboard } from "@/app/admin/admin-dashboard";
import {
  type AdminProduct,
  adminProductFields,
} from "@/app/admin/product-types";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return (
    <AdminDashboard
      email={user.email ?? "administrador"}
      initialProducts={(data ?? []) as AdminProduct[]}
    />
  );
}
