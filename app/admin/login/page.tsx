import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  if (hasSupabasePublicConfig) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/admin");
  }

  return (
    <main className="admin-login">
      <div className="admin-login__texture" aria-hidden="true" />
      <section className="admin-login__card" aria-labelledby="admin-login-title">
        <div className="admin-login__brand">
          <Image
            src="/images/logo-transparent.png"
            alt="Corta Essa!"
            width={184}
            height={110}
            priority
          />
          <span>Área restrita</span>
        </div>
        <div className="admin-login__heading">
          <p>Gestão do cardápio</p>
          <h1 id="admin-login-title">Acesso administrativo</h1>
          <span>Entre com o e-mail autorizado no Supabase.</span>
        </div>
        <AdminLoginForm configured={hasSupabasePublicConfig} />
        <Link className="admin-login__back" href="/">
          ← Voltar ao cardápio
        </Link>
      </section>
    </main>
  );
}
