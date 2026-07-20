"use client";
/* eslint-disable @next/next/no-img-element -- imagens locais já otimizadas em WebP. */

import {
  AlertTriangle,
  Check,
  Flame,
  LoaderCircle,
  LogOut,
  PackageCheck,
  PackageX,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatPrice } from "@/lib/catalog";

export type AdminProduct = {
  key: string;
  slug: string;
  category: "kit" | "unit";
  name: string;
  weight: string;
  price_cents: number;
  stock_quantity: number;
  is_top_seller: boolean;
  active: boolean;
};

type Feedback = { kind: "success" | "error"; message: string } | null;

export function AdminDashboard({
  email,
  initialProducts,
}: {
  email: string;
  initialProducts: AdminProduct[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const summary = useMemo(
    () => ({
      total: products.length,
      available: products.filter((product) => product.stock_quantity > 0).length,
      highlighted: products.filter((product) => product.is_top_seller).length,
    }),
    [products],
  );

  function updateProduct(key: string, patch: Partial<AdminProduct>) {
    setProducts((current) =>
      current.map((product) =>
        product.key === key ? { ...product, ...patch } : product,
      ),
    );
    setDirtyKeys((current) => new Set(current).add(key));
    setFeedback(null);
  }

  async function saveProduct(product: AdminProduct) {
    const stockQuantity = Math.max(0, Math.trunc(product.stock_quantity || 0));
    setSavingKey(product.key);
    setFeedback(null);

    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("catalog_products")
      .update({
        stock_quantity: stockQuantity,
        is_top_seller: product.is_top_seller,
      })
      .eq("key", product.key)
      .select("key, stock_quantity, is_top_seller")
      .single();

    if (error || !data) {
      setFeedback({
        kind: "error",
        message:
          "Não foi possível salvar. Confirme a permissão deste usuário em admin_users.",
      });
      setSavingKey(null);
      return;
    }

    setProducts((current) =>
      current.map((item) =>
        item.key === product.key
          ? {
              ...item,
              stock_quantity: Number(data.stock_quantity),
              is_top_seller: Boolean(data.is_top_seller),
            }
          : item,
      ),
    );
    setDirtyKeys((current) => {
      const next = new Set(current);
      next.delete(product.key);
      return next;
    });
    setFeedback({ kind: "success", message: `${product.name} atualizado.` });
    setSavingKey(null);
    router.refresh();
  }

  async function logout() {
    setLoggingOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link href="/" className="admin-header__brand" aria-label="Voltar ao cardápio">
          <img src="/images/logo-transparent.png" alt="Corta Essa!" />
          <span>Painel da brasa</span>
        </Link>
        <div className="admin-header__account">
          <span>{email}</span>
          <button type="button" onClick={logout} disabled={loggingOut}>
            {loggingOut ? <LoaderCircle className="admin-spin" aria-hidden="true" /> : <LogOut aria-hidden="true" />}
            Sair
          </button>
        </div>
      </header>

      <section className="admin-hero">
        <div>
          <p><ShieldCheck aria-hidden="true" /> Acesso protegido</p>
          <h1>Estoque & destaques</h1>
          <span>Controle o que está disponível sem alterar produtos ou preços.</span>
        </div>
        <div className="admin-summary" aria-label="Resumo do catálogo">
          <article><strong>{summary.total}</strong><span>Produtos</span></article>
          <article><strong>{summary.available}</strong><span>Com estoque</span></article>
          <article><strong>{summary.highlighted}</strong><span>Destaques</span></article>
        </div>
      </section>

      {feedback && (
        <div className={`admin-feedback admin-feedback--${feedback.kind}`} role="status">
          {feedback.kind === "success" ? <Check aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
          {feedback.message}
        </div>
      )}

      <section className="admin-products" aria-labelledby="admin-products-title">
        <div className="admin-section-title">
          <span>01 / Catálogo</span>
          <div>
            <h2 id="admin-products-title">Disponibilidade atual</h2>
            <p>Estoque zero remove a ação de compra do cardápio automaticamente.</p>
          </div>
        </div>

        <div className="admin-product-grid">
          {products.map((product) => {
            const dirty = dirtyKeys.has(product.key);
            const saving = savingKey === product.key;
            return (
              <article className="admin-product" key={product.key}>
                <div className="admin-product__visual">
                  <img
                    src={`/images/${product.slug}-${product.category}.webp`}
                    alt=""
                  />
                  <span>{product.category === "kit" ? "Kit" : "Unidade"}</span>
                  {product.stock_quantity <= 0 && (
                    <strong><PackageX aria-hidden="true" /> Sem estoque</strong>
                  )}
                </div>
                <div className="admin-product__content">
                  <div className="admin-product__heading">
                    <div>
                      <p>{product.key}</p>
                      <h3>{product.name}</h3>
                    </div>
                    <span>{formatPrice(product.price_cents / 100)}</span>
                  </div>
                  <p className="admin-product__weight">{product.weight}</p>

                  <label className="admin-stock-field">
                    <span><PackageCheck aria-hidden="true" /> Estoque atual</span>
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      step={1}
                      inputMode="numeric"
                      value={product.stock_quantity}
                      disabled={saving}
                      onChange={(event) =>
                        updateProduct(product.key, {
                          stock_quantity: Math.max(0, Number(event.target.value)),
                        })
                      }
                    />
                  </label>

                  <label className="admin-highlight-field">
                    <span>
                      <Sparkles aria-hidden="true" />
                      <span><strong>Destaque da casa</strong><small>Prioriza o produto na seção inicial.</small></span>
                    </span>
                    <input
                      type="checkbox"
                      checked={product.is_top_seller}
                      disabled={saving}
                      onChange={(event) =>
                        updateProduct(product.key, {
                          is_top_seller: event.target.checked,
                        })
                      }
                    />
                  </label>

                  <button
                    className="admin-product__save"
                    type="button"
                    onClick={() => saveProduct(product)}
                    disabled={!dirty || saving}
                  >
                    {saving ? <LoaderCircle className="admin-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
                    {saving ? "Salvando" : dirty ? "Salvar alteração" : "Atualizado"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="admin-footer">
        <Flame aria-hidden="true" /> Alterações publicadas diretamente no cardápio.
      </footer>
    </main>
  );
}

export function AdminAccessDenied({
  email,
  message = "Esta conta está autenticada, mas não está autorizada a alterar o catálogo.",
}: {
  email: string;
  message?: string;
}) {
  const router = useRouter();

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="admin-denied">
      <ShieldCheck aria-hidden="true" />
      <p>Conta: {email}</p>
      <h1>Acesso não autorizado</h1>
      <span>{message}</span>
      <button type="button" onClick={logout}><LogOut aria-hidden="true" /> Sair</button>
      <Link href="/">Voltar ao cardápio</Link>
    </main>
  );
}
