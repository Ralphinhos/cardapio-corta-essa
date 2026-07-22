"use client";
/* eslint-disable @next/next/no-img-element -- Vinext preview is incompatible with next/image; assets are pre-optimized WebP files. */

import {
  Box,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Flame,
  PackageCheck,
  PackageOpen,
  PackageX,
  ShoppingBag,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  type CatalogProduct,
  type CartItem,
  type Category,
  type Product,
  categoryLabel,
  categoryPageLabel,
  categoryPriceSuffix,
  formatPrice,
  productImagePath,
  productImageUrl,
  productKey,
  stockAvailabilityLabel,
  whatsappUrl,
} from "@/lib/catalog";

const orderingEnabled = process.env.NEXT_PUBLIC_ORDERING_ENABLED === "true";
const PAGE_SIZE = 6;
const categoryControls = [
  { value: "kit", label: "Kit", Icon: PackageOpen },
  { value: "unit", label: "Unidade", Icon: Box },
  { value: "combo", label: "Combo", Icon: Boxes },
] as const;
const OrderCart = dynamic(
  () => import("@/app/order-cart").then((module) => module.OrderCart),
  { ssr: false },
);

function ProductCard({
  product,
  category,
  index,
  onAdd,
}: {
  product: Product;
  category: Category;
  index: number;
  onAdd: (product: Product, category: Category) => void;
}) {
  const image = productImageUrl(productImagePath(category, product));
  const outOfStock = product.stockQuantity != null && product.stockQuantity <= 0;
  return (
    <article
      className={`product-card product-card--${product.tone}${outOfStock ? " product-card--sold-out" : ""}`}
    >
      <div className="product-card__meta">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{categoryLabel(category)} · {product.weight}</span>
      </div>

      <div className="product-card__body">
        <div className="product-card__stage">
          <div className="product-card__badges">
            <span className="product-card__stamp">
              {product.badgeText ?? "Feito para a brasa"}
            </span>
          </div>
          {outOfStock && (
            <span className="product-card__stock" role="status">
              <PackageX aria-hidden="true" /> Fora de estoque
            </span>
          )}
          <img
            src={image}
            alt={`${product.name}: ${product.description}`}
            className="product-card__image"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="product-card__content">
          <h3>{product.name}</h3>
          <p className="product-card__description">{product.description}</p>
          {product.detail && <p className="product-card__detail">{product.detail}</p>}
          {product.stockQuantity != null && product.stockQuantity > 0 && (
            <p className="stock-availability product-card__availability">
              <PackageCheck aria-hidden="true" />
              {stockAvailabilityLabel(product.stockQuantity)}
            </p>
          )}
          <div className="product-card__footer">
            <div>
              <strong>{formatPrice(product.price)}</strong>
              <span>{categoryPriceSuffix(category)}</span>
            </div>
            {orderingEnabled ? (
              <button
                type="button"
                onClick={() => onAdd(product, category)}
                disabled={outOfStock}
              >
                {outOfStock ? <PackageX aria-hidden="true" /> : <ShoppingBag aria-hidden="true" />}
                {outOfStock ? "Indisponível" : "Adicionar"}
              </button>
            ) : outOfStock ? (
              <span className="product-card__unavailable">
                <PackageX aria-hidden="true" /> Indisponível
              </span>
            ) : (
              <a href={whatsappUrl(product)} target="_blank" rel="noreferrer">
                Pedir este <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function HeroSelector({
  category,
  onChange,
}: {
  category: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <div className="hero-selector">
      <span className="hero-selector__label">Escolha o formato</span>
      <div className="hero-selector__buttons" aria-label="Exibir produtos por tipo">
        {categoryControls.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            onClick={() => onChange(value)}
          >
            <Icon aria-hidden="true" /> <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MenuClient({
  initialProducts,
}: {
  initialProducts: CatalogProduct[];
}) {
  const [category, setCategory] = useState<Category>("kit");
  const [currentPage, setCurrentPage] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const products = useMemo(
    () =>
      initialProducts
        .filter((product) => product.category === category)
        .sort(
          (first, second) =>
            first.displayOrder - second.displayOrder ||
            first.name.localeCompare(second.name),
        ),
    [category, initialProducts],
  );
  const categoryCounts = useMemo(
    () => ({
      kit: initialProducts.filter((product) => product.category === "kit").length,
      unit: initialProducts.filter((product) => product.category === "unit").length,
      combo: initialProducts.filter((product) => product.category === "combo").length,
    }),
    [initialProducts],
  );
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pageStart = (page - 1) * PAGE_SIZE;
  const visibleProducts = products.slice(pageStart, pageStart + PAGE_SIZE);
  const featuredProducts = useMemo(
    () =>
      [...products]
        .sort(
          (first, second) =>
            Number(second.isTopSeller) - Number(first.isTopSeller),
        )
        .slice(0, 3),
    [products],
  );

  const changeCategory = (nextCategory: Category) => {
    setCategory(nextCategory);
    setCurrentPage(1);
  };

  const changePage = (nextPage: number) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
    window.requestAnimationFrame(() => {
      document.getElementById("panel-products")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  };

  const addToCart = (product: Product, itemCategory: Category) => {
    if (product.stockQuantity != null && product.stockQuantity <= 0) return;

    setCartItems((current) => {
      const key = productKey(itemCategory, product);
      const quantityLimit = Math.min(product.stockQuantity ?? 20, 20);
      const existing = current.find(
        (item) => productKey(item.category, item.product) === key,
      );
      if (existing) {
        return current.map((item) =>
          productKey(item.category, item.product) === key
            ? { ...item, quantity: Math.min(item.quantity + 1, quantityLimit) }
            : item,
        );
      }
      return [...current, { product, category: itemCategory, quantity: 1 }];
    });
  };

  const decreaseItem = (target: CartItem) => {
    const key = productKey(target.category, target.product);
    setCartItems((current) =>
      current.flatMap((item) => {
        if (productKey(item.category, item.product) !== key) return [item];
        return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
      }),
    );
  };

  const removeItem = (target: CartItem) => {
    const key = productKey(target.category, target.product);
    setCartItems((current) =>
      current.filter((item) => productKey(item.category, item.product) !== key),
    );
  };

  return (
    <main>
      <section className="hero" id="inicio">
        <header className="topbar">
          <a className="topbar__logo" href="#inicio" aria-label="Corta Essa! — início">
            <img
              src="/images/logo-transparent.webp"
              width="360"
              height="219"
              alt="Corta Essa! Churrasco Vegetariano"
            />
          </a>
          <nav aria-label="Navegação principal">
            <a href="#cardapio">Cardápio</a>
            <a className="topbar__club-link" href="/clube">
              <Flame aria-hidden="true" />
              <span>Clube</span>
            </a>
            <a className="topbar__secondary-link" href="#encomendas">Encomendas</a>
            <a
              className="topbar__social"
              href="https://www.instagram.com/cortaessachurrascovegetariano/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram da Corta Essa!"
            >
              @
            </a>
          </nav>
        </header>

        <div className="hero__inner">
          <div className="hero__copy">
            <div className="hero__eyebrow">
              <span aria-hidden="true" />
              Produtos gourmet · feitos para a brasa
            </div>
            <h1>
              <span>Churrasco</span>
              <span>vegetariano</span>
              <span>de verdade</span>
            </h1>
            <p>
              Sabor, textura e criatividade para transformar qualquer encontro
              em experiência de grelha.
            </p>
            <div className="hero__actions">
              <a className="hero__cta" href="#cardapio">
                <Flame className="hero__cta-icon" aria-hidden="true" />
                <span>Ver cardápio</span>
                <span className="hero__cta-arrow" aria-hidden="true">↓</span>
              </a>
              <a className="hero__secondary" href="#encomendas">
                Fazer encomenda <span aria-hidden="true">↗</span>
              </a>
            </div>
            <HeroSelector category={category} onChange={changeCategory} />
          </div>

          <div className="hero-collage" aria-hidden="true">
            <img
              className="hero__ghost"
              src="/images/gourmet-type.webp"
              width="960"
              height="480"
              fetchPriority="high"
              alt=""
            />
            <div className="hero-collage__halo" />
            <div className="hero-secondary hero-secondary--farofa">
              <img
                src="/images/divine-unit.webp"
                width="660"
                height="660"
                fetchPriority="low"
                decoding="async"
                alt=""
              />
            </div>
            <div className="hero-secondary hero-secondary--persian">
              <img
                src="/images/persian-kit.webp"
                width="535"
                height="660"
                fetchPriority="low"
                decoding="async"
                alt=""
              />
            </div>
            <div className="hero-product-wrap hero-product-wrap--gold">
              <img
                className="hero-product"
                src="/images/gold-unit.webp"
                width="130"
                height="660"
                decoding="async"
                alt=""
              />
            </div>
            <span className="hero-collage__note">100% vegetal</span>
          </div>
        </div>
      </section>

      <section className="featured" aria-labelledby="featured-title">
        <div className="section-intro section-intro--featured">
          <div className="section-index">
            <span>01</span> / Destaques da brasa
          </div>
          <div className="section-intro__copy">
            <h2 id="featured-title">Os mais pedidos</h2>
            <p>Os favoritos de quem já colocou a Corta Essa na grelha.</p>
          </div>
        </div>

        <div className="featured-grid" aria-label="Destaques do cardápio">
          {featuredProducts.map((product, index) => {
            const outOfStock =
              product.stockQuantity != null && product.stockQuantity <= 0;
            return (
              <article
                key={product.key}
                className={`featured-card${outOfStock ? " featured-card--sold-out" : ""}`}
              >
                <div className="featured-card__topline">
                  <span
                    className={`featured-card__badge featured-card__badge--${index}`}
                  >
                    {product.isTopSeller
                      ? "Favorito da brasa"
                      : index === 0
                        ? "Mais pedido"
                        : index === 1
                          ? "Para compartilhar"
                          : "Cheio de sabor"}
                  </span>
                  <span>{categoryLabel(category)}</span>
                </div>
                <div className="featured-card__visual">
                  <span className="featured-card__number">0{index + 1}</span>
                  {outOfStock && (
                    <span className="featured-card__stock">
                      <PackageX aria-hidden="true" /> Fora de estoque
                    </span>
                  )}
                  <img
                    src={productImageUrl(productImagePath(category, product))}
                    alt={`${product.name}: ${product.description}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="featured-card__content">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  {product.stockQuantity != null && product.stockQuantity > 0 && (
                    <p className="stock-availability featured-card__availability">
                      <PackageCheck aria-hidden="true" />
                      {stockAvailabilityLabel(product.stockQuantity)}
                    </p>
                  )}
                  <div className="featured-card__footer">
                    <div>
                      <span>{product.weight}</span>
                      <strong>{formatPrice(product.price)}</strong>
                    </div>
                    {orderingEnabled ? (
                      <button
                        type="button"
                        onClick={() => addToCart(product, category)}
                        disabled={outOfStock}
                      >
                        {outOfStock ? (
                          <PackageX aria-hidden="true" />
                        ) : (
                          <ShoppingBag aria-hidden="true" />
                        )}
                        {outOfStock ? "Indisponível" : "Adicionar"}
                      </button>
                    ) : outOfStock ? (
                      <span className="featured-card__unavailable">
                        <PackageX aria-hidden="true" /> Indisponível
                      </span>
                    ) : (
                      <a
                        href={whatsappUrl(product)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Pedir <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          {featuredProducts.length === 0 && (
            <div className="catalog-empty">
              <Boxes aria-hidden="true" />
              <h3>Nenhum produto ativo nesta categoria.</h3>
              <p>Os novos itens cadastrados no painel aparecerão aqui.</p>
            </div>
          )}
        </div>
      </section>

      <section className="catalog" id="cardapio" aria-labelledby="catalog-title">
        <div className="section-intro section-intro--catalog">
          <div className="section-index">
            <span>02</span> / Cardápio completo
          </div>
          <div className="section-intro__copy">
            <h2 id="catalog-title">Escolha como vai para a brasa.</h2>
            <p>
              Escolha um combo, monte o churrasco completo ou peça seus produtos
              favoritos por unidade.
            </p>
          </div>
        </div>

        <div className="catalog__controls">
          <span>Selecione o formato</span>
          <div className="catalog-tabs" role="tablist" aria-label="Tipo de produto">
            {categoryControls.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                id={`tab-${value}`}
                role="tab"
                aria-selected={category === value}
                aria-controls="panel-products"
                onClick={() => changeCategory(value)}
              >
                <Icon aria-hidden="true" />
                <span className="catalog-tabs__label">{label}</span>
                <span className="catalog-tabs__count">
                  {String(categoryCounts[value]).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div
          className="product-grid"
          id="panel-products"
          role="tabpanel"
          aria-labelledby={`tab-${category}`}
          key={`${category}-${page}`}
        >
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.key}
              product={product}
              category={category}
              index={pageStart + index}
              onAdd={addToCart}
            />
          ))}
          {visibleProducts.length === 0 && (
            <div className="catalog-empty">
              <PackageX aria-hidden="true" />
              <h3>Nenhum produto ativo nesta categoria.</h3>
              <p>Novos itens cadastrados no painel aparecerão aqui.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav className="catalog-pagination" aria-label={`Páginas de produtos em ${categoryPageLabel(category)}`}>
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft aria-hidden="true" />
              <span>Anterior</span>
            </button>
            <div className="catalog-pagination__pages">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => changePage(pageNumber)}
                    aria-current={pageNumber === page ? "page" : undefined}
                    aria-label={`Ir para página ${pageNumber}`}
                  >
                    {String(pageNumber).padStart(2, "0")}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              aria-label="Próxima página"
            >
              <span>Próxima</span>
              <ChevronRight aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>

      <section className="order" id="encomendas" aria-labelledby="order-title">
        <div className="order__ghost" aria-hidden="true">BRASA</div>
        <div className="order__content">
          <div className="section-index section-index--order">
            <span>03</span> / Encomendas
          </div>
          <div className="order__copy">
            <h2 id="order-title">Pronto para colocar na brasa?</h2>
            <p>
              Escolha seus favoritos, informe o endereço de entrega e confirme a
              disponibilidade pelo WhatsApp.
            </p>
          </div>
          {orderingEnabled ? (
            <button className="order__button" type="button" onClick={() => setCartOpen(true)}>
              <ShoppingBag aria-hidden="true" /> Revisar pedido
            </button>
          ) : (
            <a className="order__button" href={whatsappUrl()} target="_blank" rel="noreferrer">
              Pedir pelo WhatsApp <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        <div className="order__visual" aria-hidden="true">
          <div className="order__grill" />
          <div className="order__product-backdrop" />
          <img
            src="/images/red-kit.webp"
            width="567"
            height="660"
            loading="lazy"
            decoding="async"
            alt=""
          />
          <span>Feito para compartilhar</span>
        </div>
      </section>

      <footer>
        <div className="footer__grid">
          <div className="footer__brand">
            <img
              src="/images/logo-transparent.webp"
              width="360"
              height="219"
              loading="lazy"
              decoding="async"
              alt="Corta Essa!"
            />
            <div className="footer__statement">Churrasco vegetariano de verdade.</div>
          </div>
          <nav className="footer__nav" aria-label="Navegação do rodapé">
            <span>Navegue</span>
            <a href="#cardapio">Cardápio</a>
            <a href="/clube">Clube de assinaturas</a>
            <a href="#encomendas">Encomendas</a>
          </nav>
          <div className="footer__links">
            <span>Fale com a gente</span>
            <a href="tel:+5535910222015">(35) 91022-2015</a>
            <a
              href="https://www.instagram.com/cortaessachurrascovegetariano/"
              target="_blank"
              rel="noreferrer"
            >
              @cortaessachurrascovegetariano
            </a>
          </div>
        </div>
        <div className="footer__bottom">
          <span>Imagens meramente ilustrativas.</span>
          <a href="#inicio">Voltar ao topo ↑</a>
        </div>
      </footer>

      {orderingEnabled && (cartOpen || cartItems.length > 0) && (
        <OrderCart
          items={cartItems}
          open={cartOpen}
          onOpen={() => setCartOpen(true)}
          onClose={() => setCartOpen(false)}
          onIncrease={(item) => addToCart(item.product, item.category)}
          onDecrease={decreaseItem}
          onRemove={removeItem}
          onOrderPlaced={() => setCartItems([])}
        />
      )}
    </main>
  );
}
