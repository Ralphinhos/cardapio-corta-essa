"use client";
/* eslint-disable @next/next/no-img-element -- Vinext preview is incompatible with next/image; assets are pre-optimized WebP files. */

import { Box, Flame, PackageOpen, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { OrderCart } from "@/app/order-cart";
import {
  type CartItem,
  type Category,
  type Product,
  formatPrice,
  kits,
  productKey,
  units,
  whatsappUrl,
} from "@/lib/catalog";

const orderingEnabled = process.env.NEXT_PUBLIC_ORDERING_ENABLED === "true";

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
  const image = `/images/${product.slug}-${category}.webp`;
  return (
    <article className={`product-card product-card--${product.tone}`}>
      <div className="product-card__meta">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{category === "kit" ? "Kit" : "Unidade"} · {product.weight}</span>
      </div>

      <div className="product-card__body">
        <div className="product-card__stage">
          <span className="product-card__stamp">
            {product.slug === "divine" ? "Pronta para servir" : "Feito para a brasa"}
          </span>
          <img
            src={image}
            alt={`${product.name}: ${product.description}`}
            className="product-card__image"
            loading="lazy"
          />
        </div>

        <div className="product-card__content">
          <h3>{product.name}</h3>
          <p className="product-card__description">{product.description}</p>
          {product.detail && <p className="product-card__detail">{product.detail}</p>}
          <div className="product-card__footer">
            <div>
              <strong>{formatPrice(product.price)}</strong>
              <span>{category === "kit" ? "por kit" : "por unidade"}</span>
            </div>
            {orderingEnabled ? (
              <button type="button" onClick={() => onAdd(product, category)}>
                <ShoppingBag aria-hidden="true" /> Adicionar
              </button>
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
        <button
          type="button"
          aria-pressed={category === "kit"}
          onClick={() => onChange("kit")}
        >
          <PackageOpen aria-hidden="true" /> <span>Kit</span>
        </button>
        <button
          type="button"
          aria-pressed={category === "unit"}
          onClick={() => onChange("unit")}
        >
          <Box aria-hidden="true" /> <span>Unidade</span>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState<Category>("kit");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const products = category === "kit" ? kits : units;

  const addToCart = (product: Product, itemCategory: Category) => {
    setCartItems((current) => {
      const key = productKey(itemCategory, product);
      const existing = current.find(
        (item) => productKey(item.category, item.product) === key,
      );
      if (existing) {
        return current.map((item) =>
          productKey(item.category, item.product) === key
            ? { ...item, quantity: Math.min(item.quantity + 1, 20) }
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
            <img src="/images/logo-transparent.png" alt="Corta Essa! Churrasco Vegetariano" />
          </a>
          <nav aria-label="Navegação principal">
            <a href="#cardapio">Cardápio</a>
            <a href="#encomendas">Encomendas</a>
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
            <HeroSelector category={category} onChange={setCategory} />
          </div>

          <div className="hero-collage" aria-hidden="true">
            <img className="hero__ghost" src="/images/gourmet-type.png" alt="" />
            <div className="hero-collage__halo" />
            <div className="hero-secondary hero-secondary--farofa">
              <img src="/images/divine-unit.webp" alt="" />
            </div>
            <div className="hero-secondary hero-secondary--persian">
              <img src="/images/persian-kit.webp" alt="" />
            </div>
            <div className="hero-product-wrap hero-product-wrap--gold">
              <img className="hero-product" src="/images/gold-unit.webp" alt="" />
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
          {products.slice(0, 3).map((product, index) => (
            <article key={product.slug} className="featured-card">
              <div className="featured-card__topline">
                <span className={`featured-card__badge featured-card__badge--${index}`}>
                  {index === 0 ? "Mais pedido" : index === 1 ? "Para compartilhar" : "Cheio de sabor"}
                </span>
                <span>{category === "kit" ? "Kit" : "Unidade"}</span>
              </div>
              <div className="featured-card__visual">
                <span className="featured-card__number">0{index + 1}</span>
                <img
                  src={`/images/${product.slug}-${category}.webp`}
                  alt={`${product.name}: ${product.description}`}
                  loading="eager"
                />
              </div>
              <div className="featured-card__content">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="featured-card__footer">
                  <div>
                    <span>{product.weight}</span>
                    <strong>{formatPrice(product.price)}</strong>
                  </div>
                  {orderingEnabled ? (
                    <button type="button" onClick={() => addToCart(product, category)}>
                      <ShoppingBag aria-hidden="true" /> Adicionar
                    </button>
                  ) : (
                    <a href={whatsappUrl(product)} target="_blank" rel="noreferrer">
                      Pedir <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
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
              Monte o churrasco completo ou escolha seus produtos favoritos por
              unidade.
            </p>
          </div>
        </div>

        <div className="catalog__controls">
          <span>Selecione o formato</span>
          <div className="catalog-tabs" role="tablist" aria-label="Tipo de produto">
            <button
              type="button"
              id="tab-kit"
              role="tab"
              aria-selected={category === "kit"}
              aria-controls="panel-products"
              onClick={() => setCategory("kit")}
            >
              <PackageOpen aria-hidden="true" />
              <span className="catalog-tabs__label">Kit</span>
              <span className="catalog-tabs__count">{String(kits.length).padStart(2, "0")}</span>
            </button>
            <button
              type="button"
              id="tab-unit"
              role="tab"
              aria-selected={category === "unit"}
              aria-controls="panel-products"
              onClick={() => setCategory("unit")}
            >
              <Box aria-hidden="true" />
              <span className="catalog-tabs__label">Unidade</span>
              <span className="catalog-tabs__count">{String(units.length).padStart(2, "0")}</span>
            </button>
          </div>
        </div>

        <div
          className="product-grid"
          id="panel-products"
          role="tabpanel"
          aria-labelledby={category === "kit" ? "tab-kit" : "tab-unit"}
          key={category}
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              category={category}
              index={index}
              onAdd={addToCart}
            />
          ))}
        </div>
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
          <img src="/images/red-kit.webp" alt="" />
          <span>Feito para compartilhar</span>
        </div>
      </section>

      <footer>
        <div className="footer__grid">
          <div className="footer__brand">
            <img src="/images/logo-transparent.png" alt="Corta Essa!" />
            <div className="footer__statement">Churrasco vegetariano de verdade.</div>
          </div>
          <nav className="footer__nav" aria-label="Navegação do rodapé">
            <span>Navegue</span>
            <a href="#cardapio">Cardápio</a>
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

      {orderingEnabled && (
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
