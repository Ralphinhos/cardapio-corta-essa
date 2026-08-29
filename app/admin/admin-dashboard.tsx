"use client";
/* eslint-disable @next/next/no-img-element -- imagens locais já otimizadas em WebP. */

import {
  AlertTriangle,
  Check,
  EyeOff,
  Flame,
  LoaderCircle,
  LogOut,
  Pencil,
  PackageCheck,
  PackagePlus,
  PackageX,
  Save,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AdminProductForm } from "@/app/admin/product-form";
import type { AdminProduct } from "@/app/admin/product-types";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  catalogCategories,
  brasaCategories,
  categoryLabel,
  fallbackRoutineCatalog,
  formatPrice,
  productImageUrl,
} from "@/lib/catalog";

type Feedback = { kind: "success" | "error"; message: string } | null;
type AdminLine = "brasa" | "rotina";
const isRoutineProduct = (product: AdminProduct) =>
  product.key.startsWith("rotina-");

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
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [activeLine, setActiveLine] = useState<AdminLine>("brasa");
  const [productPendingDelete, setProductPendingDelete] =
    useState<AdminProduct | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  const lineProducts = useMemo(
    () =>
      products.filter((product) =>
        activeLine === "rotina"
          ? isRoutineProduct(product)
          : !isRoutineProduct(product),
      ),
    [activeLine, products],
  );

  const summary = useMemo(
    () => ({
      total: lineProducts.filter((product) => product.active).length,
      available: lineProducts.filter(
        (product) =>
          product.active &&
          (product.persisted === false || product.stock_quantity > 0),
      ).length,
      highlighted: lineProducts.filter(
        (product) => product.active && product.is_top_seller,
      ).length,
    }),
    [lineProducts],
  );

  const sortedProducts = useMemo(
    () =>
      [...lineProducts].sort(
        (first, second) =>
          catalogCategories.indexOf(first.category) -
            catalogCategories.indexOf(second.category) ||
          first.display_order - second.display_order ||
          first.name.localeCompare(second.name),
      ),
    [lineProducts],
  );

  const nextOrders = useMemo(
    () => ({
      kit:
        Math.max(
          0,
          ...products
            .filter((product) => product.category === "kit")
            .map((product) => product.display_order),
        ) + 1,
      unit:
        Math.max(
          0,
          ...products
            .filter((product) => product.category === "unit")
            .map((product) => product.display_order),
        ) + 1,
      combo:
        Math.max(
          0,
          ...products
            .filter((product) => product.category === "combo")
            .map((product) => product.display_order),
        ) + 1,
      rotina:
        Math.max(
          0,
          ...fallbackRoutineCatalog.map((product) => product.displayOrder),
          ...products
            .filter(isRoutineProduct)
            .map((product) => product.display_order),
        ) + 1,
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
        active: product.active,
        updated_at: new Date().toISOString(),
      })
      .eq("key", product.key)
      .select("key, stock_quantity, is_top_seller, active")
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
              active: Boolean(data.active),
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

  function openEditor(product: AdminProduct | null = null) {
    setEditingProduct(product);
    setEditorOpen(true);
    setFeedback(null);
    window.requestAnimationFrame(() => {
      document.getElementById("admin-product-editor")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingProduct(null);
  }

  function selectLine(line: AdminLine) {
    setActiveLine(line);
    setEditorOpen(false);
    setEditingProduct(null);
    setFeedback(null);
  }

  function productSaved(savedProduct: AdminProduct, created: boolean) {
    setProducts((current) => {
      const persistedProduct = { ...savedProduct, persisted: true };
      return current.some((product) => product.key === savedProduct.key)
        ? current.map((product) =>
            product.key === savedProduct.key ? persistedProduct : product,
          )
        : [...current, persistedProduct];
    });
    setDirtyKeys((current) => {
      const next = new Set(current);
      next.delete(savedProduct.key);
      return next;
    });
    setFeedback({
      kind: "success",
      message: created
        ? `${savedProduct.name} adicionado ao cardápio.`
        : `${savedProduct.name} atualizado.`,
    });
    closeEditor();
    router.refresh();
  }

  function requestDelete(product: AdminProduct) {
    setProductPendingDelete(product);
    setFeedback(null);
    window.requestAnimationFrame(() => deleteDialogRef.current?.showModal());
  }

  function closeDeleteDialog() {
    if (deletingKey) return;
    deleteDialogRef.current?.close();
    setProductPendingDelete(null);
  }

  async function deleteProduct() {
    if (!productPendingDelete || deletingKey) return;

    const product = productPendingDelete;
    setDeletingKey(product.key);
    setFeedback(null);

    const supabase = createSupabaseBrowserClient();
    const { data: deletedImagePath, error } = await supabase.rpc(
      "delete_catalog_product",
      { p_key: product.key },
    );

    if (error) {
      setFeedback({
        kind: "error",
        message:
          "Não foi possível excluir o produto. Confirme se a migration de exclusão foi executada no Supabase.",
      });
      setDeletingKey(null);
      return;
    }

    if (
      typeof deletedImagePath === "string" &&
      deletedImagePath &&
      !deletedImagePath.startsWith("/") &&
      !/^https?:\/\//i.test(deletedImagePath)
    ) {
      await supabase.storage.from("product-images").remove([deletedImagePath]);
    }

    setProducts((current) =>
      current.filter((item) => item.key !== product.key),
    );
    setDirtyKeys((current) => {
      const next = new Set(current);
      next.delete(product.key);
      return next;
    });
    if (editingProduct?.key === product.key) closeEditor();
    setDeletingKey(null);
    deleteDialogRef.current?.close();
    setProductPendingDelete(null);
    setFeedback({
      kind: "success",
      message: `${product.name} foi excluído permanentemente.`,
    });
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
          <h1>Gestão dos produtos</h1>
          <span>Administre separadamente as linhas Brasa e Rotina.</span>
        </div>
        <div className="admin-summary" aria-label="Resumo do catálogo">
          <article><strong>{summary.total}</strong><span>Produtos ativos</span></article>
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

      <nav className="admin-catalog-tabs" aria-label="Linha de produtos" role="tablist">
        <button
          id="admin-tab-brasa"
          type="button"
          role="tab"
          aria-selected={activeLine === "brasa"}
          aria-controls="admin-products-panel"
          className={activeLine === "brasa" ? "admin-catalog-tabs__active" : ""}
          onClick={() => selectLine("brasa")}
        >
          <Flame aria-hidden="true" />
          <span><strong>Linha Brasa</strong><small>{products.filter((product) => !isRoutineProduct(product)).length} produtos</small></span>
        </button>
        <button
          id="admin-tab-rotina"
          type="button"
          role="tab"
          aria-selected={activeLine === "rotina"}
          aria-controls="admin-products-panel"
          className={activeLine === "rotina" ? "admin-catalog-tabs__active" : ""}
          onClick={() => selectLine("rotina")}
        >
          <Snowflake aria-hidden="true" />
          <span><strong>Linha Rotina</strong><small>{products.filter(isRoutineProduct).length} produtos</small></span>
        </button>
      </nav>

      {editorOpen && (
        <AdminProductForm
          key={editingProduct?.key ?? "new-product"}
          product={editingProduct}
          nextOrders={nextOrders}
          existingKeys={products.map((product) => product.key)}
          initialCategory={activeLine === "rotina" ? "rotina" : "kit"}
          allowedCategories={
            activeLine === "rotina" ? (["rotina"] as const) : brasaCategories
          }
          onSaved={productSaved}
          onCancel={closeEditor}
        />
      )}

      <section
        className="admin-products"
        id="admin-products-panel"
        role="tabpanel"
        aria-labelledby={`admin-tab-${activeLine}`}
      >
        <div className="admin-section-title">
          <span>01 / {activeLine === "rotina" ? "Linha Rotina" : "Linha Brasa"}</span>
          <div>
            <h2>
              {activeLine === "rotina" ? "Produtos cadastrados" : "Catálogo da Brasa"}
            </h2>
            <p>
              {activeLine === "rotina"
                ? "Marmitas completas e pratos individuais ficam na mesma linha e aparecem automaticamente na página."
                : "Estoque zero bloqueia a compra; produto inativo some do cardápio."}
            </p>
          </div>
        </div>

        <div className="admin-products__toolbar">
          <p>{lineProducts.length} registros · imagens novas ficam no Supabase Storage.</p>
          <button type="button" onClick={() => openEditor()}>
            <PackagePlus aria-hidden="true" />
            Adicionar produto
          </button>
        </div>

        {sortedProducts.length > 0 ? <div className="admin-product-grid">
          {sortedProducts.map((product) => {
            const dirty = dirtyKeys.has(product.key);
            const saving = savingKey === product.key;
            return (
              <article className={`admin-product${product.active ? "" : " admin-product--inactive"}`} key={product.key}>
                <div className="admin-product__visual">
                  <img
                    src={productImageUrl(product.image_path)}
                    alt=""
                  />
                  <span>
                    {isRoutineProduct(product)
                      ? "Linha Rotina"
                      : categoryLabel(product.category)}
                  </span>
                  {!product.active && (
                    <em><EyeOff aria-hidden="true" /> Inativo</em>
                  )}
                  {product.persisted !== false && product.stock_quantity <= 0 && (
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

                  <button
                    className="admin-product__edit"
                    type="button"
                    onClick={() => openEditor(product)}
                    disabled={saving}
                  >
                    <Pencil aria-hidden="true" />
                    {product.persisted === false
                      ? "Configurar este sabor"
                      : "Editar informações e imagem"}
                  </button>

                  {product.persisted === false ? (
                    <div className="admin-product__setup">
                      <strong>Produto atual da página</strong>
                      <p>
                        Abra o editor para definir o estoque e passar a controlar
                        este produto pelo painel.
                      </p>
                    </div>
                  ) : (
                    <>
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

                  <label className="admin-highlight-field">
                    <span>
                      <EyeOff aria-hidden="true" />
                      <span><strong>Produto ativo</strong><small>Desativar remove sem apagar o histórico.</small></span>
                    </span>
                    <input
                      type="checkbox"
                      checked={product.active}
                      disabled={saving}
                      onChange={(event) =>
                        updateProduct(product.key, {
                          active: event.target.checked,
                        })
                      }
                    />
                  </label>

                  <div className="admin-product__actions">
                    <button
                      className="admin-product__save"
                      type="button"
                      onClick={() => saveProduct(product)}
                      disabled={!dirty || saving || deletingKey === product.key}
                    >
                      {saving ? <LoaderCircle className="admin-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
                      {saving ? "Salvando" : dirty ? "Salvar alteração" : "Atualizado"}
                    </button>
                    <button
                      className="admin-product__delete"
                      type="button"
                      onClick={() => requestDelete(product)}
                      disabled={saving || deletingKey === product.key}
                      aria-label={`Excluir permanentemente ${product.name}`}
                    >
                      <Trash2 aria-hidden="true" />
                      Excluir produto
                    </button>
                  </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div> : (
          <div className="admin-products__empty">
            <Snowflake aria-hidden="true" />
            <h3>Nenhum produto cadastrado</h3>
            <p>Use “Adicionar produto” para publicar uma marmita completa ou um prato individual.</p>
          </div>
        )}
      </section>

      <dialog
        ref={deleteDialogRef}
        className="admin-delete-dialog"
        aria-labelledby="admin-delete-title"
        aria-describedby="admin-delete-description"
        onCancel={(event) => {
          if (deletingKey) event.preventDefault();
        }}
        onClose={() => {
          if (!deletingKey) setProductPendingDelete(null);
        }}
      >
        <button
          type="button"
          className="admin-delete-dialog__close"
          onClick={closeDeleteDialog}
          disabled={Boolean(deletingKey)}
          aria-label="Fechar confirmação"
        >
          <X aria-hidden="true" />
        </button>
        <span><AlertTriangle aria-hidden="true" /> Exclusão permanente</span>
        <h2 id="admin-delete-title">Excluir este produto?</h2>
        <p id="admin-delete-description">
          <strong>{productPendingDelete?.name}</strong> será removido do catálogo e
          não poderá ser recuperado pelo painel. Os registros de pedidos antigos
          serão preservados.
        </p>
        <div className="admin-delete-dialog__actions">
          <button
            type="button"
            onClick={closeDeleteDialog}
            disabled={Boolean(deletingKey)}
          >
            Manter produto
          </button>
          <button
            type="button"
            onClick={deleteProduct}
            disabled={Boolean(deletingKey)}
          >
            {deletingKey ? (
              <LoaderCircle className="admin-spin" aria-hidden="true" />
            ) : (
              <Trash2 aria-hidden="true" />
            )}
            {deletingKey ? "Excluindo" : "Excluir permanentemente"}
          </button>
        </div>
      </dialog>

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
