"use client";
/* eslint-disable @next/next/no-img-element -- prévia pode usar imagem do Supabase Storage. */

import { ImagePlus, LoaderCircle, PackagePlus, Save, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import {
  type Category,
  type ProductTone,
  catalogCategories,
  categoryLabel,
  productImageUrl,
} from "@/lib/catalog";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  type AdminProduct,
  adminProductFields,
} from "@/app/admin/product-types";

const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];

type ProductDraft = {
  name: string;
  category: Category;
  description: string;
  detail: string;
  badgeText: string;
  weight: string;
  price: string;
  stockQuantity: string;
  isTopSeller: boolean;
  active: boolean;
  tone: ProductTone;
};

const emptyDraft = (): ProductDraft => ({
  name: "",
  category: "kit",
  description: "",
  detail: "",
  badgeText: "Feito para a brasa",
  weight: "",
  price: "",
  stockQuantity: "0",
  isTopSeller: false,
  active: true,
  tone: "green",
});

const draftFromProduct = (product: AdminProduct): ProductDraft => ({
  name: product.name,
  category: product.category,
  description: product.description,
  detail: product.detail ?? "",
  badgeText: product.badge_text,
  weight: product.weight,
  price: (product.price_cents / 100).toFixed(2),
  stockQuantity: String(product.stock_quantity),
  isTopSeller: product.is_top_seller,
  active: product.active,
  tone: product.tone,
});

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

const imageExtension = (file: File) => {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
};

export function AdminProductForm({
  product,
  nextOrders,
  existingKeys,
  onSaved,
  onCancel,
}: {
  product: AdminProduct | null;
  nextOrders: Record<Category, number>;
  existingKeys: string[];
  onSaved: (product: AdminProduct, created: boolean) => void;
  onCancel: () => void;
}) {
  const editing = Boolean(product);
  const [draft, setDraft] = useState<ProductDraft>(() =>
    product ? draftFromProduct(product) : emptyDraft(),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(() =>
    product ? productImageUrl(product.image_path) : "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () => () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  function updateDraft(patch: Partial<ProductDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setError("");
  }

  function chooseImage(file: File | null) {
    if (!file) return;
    if (!acceptedImageTypes.includes(file.type)) {
      setError("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const name = draft.name.trim();
    const slug = product?.slug ?? slugify(name);
    const key = product?.key ?? `${draft.category}-${slug}`;
    const price = Number(draft.price.replace(",", "."));
    const stockQuantity = Number(draft.stockQuantity);

    if (name.length < 2 || !slug) {
      setError("Informe um nome válido para o produto.");
      return;
    }
    if (draft.description.trim().length < 5 || !draft.weight.trim()) {
      setError("Preencha descrição e peso/quantidade.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0 || price > 10000) {
      setError("Informe um preço entre R$ 0,01 e R$ 10.000,00.");
      return;
    }
    if (
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0 ||
      stockQuantity > 100000
    ) {
      setError("Estoque deve ser um número inteiro entre 0 e 100.000.");
      return;
    }
    if (!product && existingKeys.includes(key)) {
      setError("Já existe um produto com esse nome nesta categoria.");
      return;
    }
    if (!product && !imageFile) {
      setError("Selecione uma imagem para o novo produto.");
      return;
    }

    setSubmitting(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    let uploadedPath = "";
    let persisted = false;

    try {
      if (imageFile) {
        uploadedPath = `${draft.category}/${Date.now()}-${crypto.randomUUID()}-${slug}.${imageExtension(imageFile)}`;
        const { error: uploadError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(uploadedPath, imageFile, {
            cacheControl: "31536000",
            contentType: imageFile.type,
            upsert: false,
          });
        if (uploadError) throw new Error("Não foi possível enviar a imagem.");
      }

      const values = {
        name,
        description: draft.description.trim(),
        detail: draft.detail.trim() || null,
        badge_text: draft.badgeText.trim() || "Feito para a brasa",
        weight: draft.weight.trim(),
        price_cents: Math.round(price * 100),
        stock_quantity: stockQuantity,
        is_top_seller: draft.isTopSeller,
        active: draft.active,
        tone: draft.tone,
        image_path: uploadedPath || product?.image_path || "",
        updated_at: new Date().toISOString(),
      };

      const query = product
        ? supabase
            .from("catalog_products")
            .update(values)
            .eq("key", product.key)
        : supabase.from("catalog_products").insert({
            ...values,
            key,
            slug,
            category: draft.category,
            display_order: nextOrders[draft.category],
          });

      const { data, error: saveError } = await query
        .select(adminProductFields)
        .single();

      if (saveError || !data) {
        if (saveError?.code === "23505") {
          throw new Error("Já existe um produto com esse nome nesta categoria.");
        }
        throw new Error("Não foi possível salvar o produto. Verifique a migration e as permissões.");
      }

      persisted = true;

      if (
        uploadedPath &&
        product?.image_path &&
        !product.image_path.startsWith("/") &&
        !/^https?:\/\//i.test(product.image_path)
      ) {
        await supabase.storage.from(IMAGE_BUCKET).remove([product.image_path]);
      }

      onSaved(data as AdminProduct, !product);
    } catch (submitError) {
      if (uploadedPath && !persisted) {
        await supabase.storage.from(IMAGE_BUCKET).remove([uploadedPath]);
      }
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar o produto.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="admin-editor" id="admin-product-editor" aria-labelledby="admin-editor-title">
      <div className="admin-editor__heading">
        <div>
          <span>{editing ? "Editor / Editar produto" : "Editor / Novo produto"}</span>
          <h2 id="admin-editor-title">
            {editing ? product?.name : "Adicionar ao cardápio"}
          </h2>
          <p>
            {editing
              ? "Categoria e identificador ficam fixos para preservar pedidos antigos."
              : "Após salvar, o produto entra no fim da categoria selecionada."}
          </p>
        </div>
        <button type="button" className="admin-editor__close" onClick={onCancel} aria-label="Fechar formulário">
          <X aria-hidden="true" />
        </button>
      </div>

      <form className="admin-editor__form" onSubmit={submit}>
        <div className="admin-editor__image-column">
          <label className={`admin-image-field${imagePreview ? " admin-image-field--filled" : ""}`}>
            {imagePreview ? (
              <img src={imagePreview} alt="Prévia do produto" />
            ) : (
              <span><ImagePlus aria-hidden="true" /> Selecionar imagem</span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={submitting}
              onChange={(event) => chooseImage(event.target.files?.[0] ?? null)}
            />
          </label>
          <small>JPG, PNG ou WebP · máximo 5 MB.</small>
        </div>

        <div className="admin-editor__fields">
          <div className="admin-form-grid admin-form-grid--two">
            <label>
              <span>Nome</span>
              <input
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value })}
                maxLength={120}
                required
                disabled={submitting}
              />
            </label>
            <label>
              <span>Categoria</span>
              <select
                value={draft.category}
                onChange={(event) => updateDraft({ category: event.target.value as Category })}
                disabled={editing || submitting}
              >
                {catalogCategories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabel(category)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>Descrição</span>
            <textarea
              value={draft.description}
              onChange={(event) => updateDraft({ description: event.target.value })}
              maxLength={500}
              rows={3}
              required
              disabled={submitting}
            />
          </label>

          <label>
            <span>Detalhe opcional</span>
            <input
              value={draft.detail}
              onChange={(event) => updateDraft({ detail: event.target.value })}
              maxLength={300}
              placeholder="Ex.: Marinada com shoyu e limão"
              disabled={submitting}
            />
          </label>

          <label>
            <span>Selo curto do produto</span>
            <input
              value={draft.badgeText}
              onChange={(event) => updateDraft({ badgeText: event.target.value })}
              maxLength={60}
              placeholder="Ex.: Pronta para servir"
              disabled={submitting}
            />
          </label>

          <div className="admin-form-grid admin-form-grid--three">
            <label>
              <span>Peso ou quantidade</span>
              <input
                value={draft.weight}
                onChange={(event) => updateDraft({ weight: event.target.value })}
                maxLength={80}
                placeholder="Ex.: 300 g"
                required
                disabled={submitting}
              />
            </label>
            <label>
              <span>Preço</span>
              <div className="admin-price-input">
                <span>R$</span>
                <input
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  inputMode="decimal"
                  value={draft.price}
                  onChange={(event) => updateDraft({ price: event.target.value })}
                  required
                  disabled={submitting}
                />
              </div>
            </label>
            <label>
              <span>Estoque inicial</span>
              <input
                type="number"
                min="0"
                max="100000"
                step="1"
                inputMode="numeric"
                value={draft.stockQuantity}
                onChange={(event) => updateDraft({ stockQuantity: event.target.value })}
                required
                disabled={submitting}
              />
            </label>
          </div>

          <fieldset className="admin-tone-field">
            <legend>Cor do card</legend>
            <label>
              <input
                type="radio"
                name="tone"
                checked={draft.tone === "green"}
                onChange={() => updateDraft({ tone: "green" })}
                disabled={submitting}
              />
              <span className="admin-tone-field__swatch admin-tone-field__swatch--green" />
              Verde-limão
            </label>
            <label>
              <input
                type="radio"
                name="tone"
                checked={draft.tone === "orange"}
                onChange={() => updateDraft({ tone: "orange" })}
                disabled={submitting}
              />
              <span className="admin-tone-field__swatch admin-tone-field__swatch--orange" />
              Laranja brasa
            </label>
          </fieldset>

          <div className="admin-editor__switches">
            <label className="admin-highlight-field">
              <span><span><strong>Destaque da casa</strong><small>Prioriza o produto na abertura.</small></span></span>
              <input
                type="checkbox"
                checked={draft.isTopSeller}
                onChange={(event) => updateDraft({ isTopSeller: event.target.checked })}
                disabled={submitting}
              />
            </label>
            <label className="admin-highlight-field">
              <span><span><strong>Produto ativo</strong><small>Desativar remove do cardápio sem apagar.</small></span></span>
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(event) => updateDraft({ active: event.target.checked })}
                disabled={submitting}
              />
            </label>
          </div>

          {error && <p className="admin-editor__error" role="alert">{error}</p>}

          <div className="admin-editor__actions">
            <button type="button" onClick={onCancel} disabled={submitting}>Cancelar</button>
            <button type="submit" disabled={submitting}>
              {submitting ? (
                <LoaderCircle className="admin-spin" aria-hidden="true" />
              ) : editing ? (
                <Save aria-hidden="true" />
              ) : (
                <PackagePlus aria-hidden="true" />
              )}
              {submitting ? "Salvando" : editing ? "Salvar produto" : "Cadastrar produto"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
