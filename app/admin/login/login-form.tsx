"use client";

import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminLoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || submitting) return;

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setSubmitting(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(
        signInError.message.toLowerCase().includes("invalid login")
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Verifique os dados e tente novamente.",
      );
      setSubmitting(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  if (!configured) {
    return (
      <div className="admin-notice admin-notice--error" role="alert">
        Configure `NEXT_PUBLIC_SUPABASE_URL` e
        `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` na Vercel antes de usar o painel.
      </div>
    );
  }

  return (
    <form className="admin-login__form" onSubmit={handleSubmit}>
      <label>
        <span>E-mail</span>
        <div>
          <Mail aria-hidden="true" />
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            autoFocus
          />
        </div>
      </label>
      <label>
        <span>Senha</span>
        <div>
          <LockKeyhole aria-hidden="true" />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            minLength={6}
            required
          />
        </div>
      </label>
      {error && (
        <p className="admin-login__error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="admin-spin" aria-hidden="true" /> Entrando
          </>
        ) : (
          <>
            <LockKeyhole aria-hidden="true" /> Entrar no painel
          </>
        )}
      </button>
    </form>
  );
}

