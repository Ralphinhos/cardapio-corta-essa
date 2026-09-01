"use client";

import {
  Check,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  WalletCards,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { MetaTrackedLink } from "@/app/meta-tracked-link";
import { formatPrice, whatsappNumber } from "@/lib/catalog";
import styles from "./rotina.module.css";

type FlavorQuantities = Record<string, number>;

export type RoutineFlavorOption = {
  key: string;
  name: string;
  stockQuantity?: number | null;
};

type PriceTier = {
  id: string;
  range: string;
  min: number;
  max: number;
  unitPriceCents: number;
  eyebrow: string;
  example: string;
};

const MIN_ORDER_QUANTITY = 1;
const MAX_ORDER_QUANTITY = 30;
const STORAGE_KEY = "corta-essa-rotina-last-order:v3";
const STORAGE_CHANGE_EVENT = "corta-essa-rotina-last-order-change:v3";
const PAYMENT_NOTE =
  "Também aceitamos crédito e débito. O valor final, com as taxas da operadora, será informado antes da confirmação do pedido.";

const priceTiers: PriceTier[] = [
  {
    id: "individual",
    range: "1 a 4 refeições",
    min: 1,
    max: 4,
    unitPriceCents: 2990,
    eyebrow: "Para experimentar",
    example: "1 refeição = R$ 29,90",
  },
  {
    id: "economico",
    range: "5 a 19 refeições",
    min: 5,
    max: 19,
    unitPriceCents: 2780,
    eyebrow: "Preço reduzido",
    example: "5 refeições = R$ 139,00",
  },
  {
    id: "melhor-preco",
    range: "20 a 30 refeições",
    min: 20,
    max: 30,
    unitPriceCents: 2645,
    eyebrow: "Melhor preço",
    example: "20 refeições = R$ 529,00",
  },
];

const stockLimit = (flavor: RoutineFlavorOption) =>
  flavor.stockQuantity == null
    ? Number.POSITIVE_INFINITY
    : flavor.stockQuantity;

const hasStock = (flavor: RoutineFlavorOption) => stockLimit(flavor) > 0;

const emptyQuantities = (flavors: RoutineFlavorOption[]) =>
  Object.fromEntries(flavors.map((flavor) => [flavor.key, 0])) as FlavorQuantities;

const totalQuantity = (quantities: FlavorQuantities) =>
  Object.values(quantities).reduce((total, quantity) => total + quantity, 0);

const priceTierForQuantity = (quantity: number) =>
  priceTiers.find((tier) => quantity >= tier.min && quantity <= tier.max) ?? null;

const totalPriceForQuantity = (quantity: number) => {
  const tier = priceTierForQuantity(quantity);
  return tier ? (tier.unitPriceCents * quantity) / 100 : 0;
};

const isFlavorQuantities = (
  value: unknown,
  flavors: RoutineFlavorOption[],
): value is FlavorQuantities => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const quantities = value as FlavorQuantities;
  const validKeys = new Set(flavors.map((flavor) => flavor.key));
  if (Object.keys(quantities).some((key) => !validKeys.has(key))) return false;

  const values = flavors.map((flavor) => Number(quantities[flavor.key] ?? 0));
  const total = values.reduce((sum, quantity) => sum + quantity, 0);
  return (
    values.every(
      (quantity, index) =>
        Number.isInteger(quantity) &&
        quantity >= 0 &&
        quantity <= stockLimit(flavors[index]),
    ) &&
    total >= MIN_ORDER_QUANTITY &&
    total <= MAX_ORDER_QUANTITY
  );
};

const subscribeToSavedOrder = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
  };
};

const getSavedOrderSnapshot = () => window.localStorage.getItem(STORAGE_KEY);

const parseSavedOrder = (
  stored: string | null,
  flavors: RoutineFlavorOption[],
) => {
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as { quantities?: unknown };
    return isFlavorQuantities(parsed.quantities, flavors)
      ? parsed.quantities
      : null;
  } catch {
    return null;
  }
};

const quantityMessage = (quantity: number) => {
  if (quantity === 0) {
    return "Escolha suas refeições. O preço por unidade cai automaticamente conforme a quantidade total.";
  }
  if (quantity < 5) {
    const missing = 5 - quantity;
    return `Adicione mais ${missing} ${missing === 1 ? "refeição" : "refeições"} e cada unidade passa a R$ 27,80 no Pix.`;
  }
  if (quantity === 19) {
    return "Adicione mais 1 refeição e leve 20 por R$ 529,00 no Pix — apenas R$ 0,80 a mais que 19.";
  }
  if (quantity < 20) {
    const missing = 20 - quantity;
    return `Adicione mais ${missing} ${missing === 1 ? "refeição" : "refeições"} e cada unidade passa a R$ 26,45 no Pix.`;
  }
  if (quantity === MAX_ORDER_QUANTITY) {
    return "Melhor preço ativado. Você atingiu o limite de 30 refeições para pedidos pelo site.";
  }
  return "Melhor preço ativado: R$ 26,45 por unidade no Pix.";
};

export function RotinaKitBuilder({
  flavors,
}: {
  flavors: RoutineFlavorOption[];
}) {
  const [quantities, setQuantities] = useState<FlavorQuantities>(() =>
    emptyQuantities(flavors),
  );
  const savedOrderSnapshot = useSyncExternalStore(
    subscribeToSavedOrder,
    getSavedOrderSnapshot,
    () => null,
  );
  const savedQuantities = useMemo(
    () => parseSavedOrder(savedOrderSnapshot, flavors),
    [flavors, savedOrderSnapshot],
  );

  const selectedTotal = totalQuantity(quantities);
  const activeTier = priceTierForQuantity(selectedTotal);
  const selectedPrice = totalPriceForQuantity(selectedTotal);
  const maxReached = selectedTotal >= MAX_ORDER_QUANTITY;
  const composition = flavors
    .filter(({ key }) => (quantities[key] ?? 0) > 0)
    .map(({ key, name }) => `${quantities[key]}× ${name}`)
    .join("\n");
  const message = [
    "Olá! Quero reservar um pedido da Linha Rotina.",
    "",
    `${selectedTotal} ${selectedTotal === 1 ? "refeição" : "refeições"}`,
    activeTier
      ? `${formatPrice(activeTier.unitPriceCents / 100)} por unidade no Pix`
      : "",
    `Total no Pix: ${formatPrice(selectedPrice)}`,
    composition,
    "",
    PAYMENT_NOTE,
    "",
    "Podemos confirmar a disponibilidade e a entrega?",
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const bulkQuoteUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Preciso de mais de 30 refeições da Linha Rotina e quero solicitar uma cotação.",
  )}`;

  const changeFlavor = (key: string, delta: number) => {
    const flavor = flavors.find((item) => item.key === key);
    if (!flavor) return;

    setQuantities((current) => {
      const currentValue = current[key] ?? 0;
      const nextValue = currentValue + delta;
      if (nextValue < 0 || nextValue > stockLimit(flavor)) return current;
      if (delta > 0 && totalQuantity(current) >= MAX_ORDER_QUANTITY) {
        return current;
      }
      return { ...current, [key]: nextValue };
    });
  };

  const restoreSavedOrder = () => {
    if (savedQuantities) setQuantities({ ...savedQuantities });
  };

  const persistSelection = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ quantities }));
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
  };

  if (flavors.length === 0) {
    return (
      <div className={styles.builderUnavailable}>
        <PackageCheck aria-hidden="true" />
        <h3>Próxima produção em organização</h3>
        <p>Os sabores disponíveis serão publicados aqui em breve.</p>
      </div>
    );
  }

  return (
    <div className={styles.builder}>
      <div className={styles.priceTierGrid} aria-label="Preços por quantidade">
        {priceTiers.map((tier) => {
          const selected = activeTier?.id === tier.id;
          return (
            <article
              className={`${styles.priceTierCard}${
                selected ? ` ${styles.priceTierCardActive}` : ""
              }${tier.id === "melhor-preco" ? ` ${styles.priceTierCardBest}` : ""}`}
              key={tier.id}
              aria-current={selected ? "true" : undefined}
            >
              <span>{tier.eyebrow}</span>
              <strong>{tier.range}</strong>
              <div>
                <b>{formatPrice(tier.unitPriceCents / 100)}</b>
                <small>por unidade no Pix</small>
                <small>{tier.example} no Pix</small>
              </div>
              {selected ? (
                <em><Check aria-hidden="true" /> Faixa atual</em>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className={styles.composer}>
        <div className={styles.composerHeading}>
          <div>
            <span>Monte do seu jeito</span>
            <h3>Escolha de 1 a 30 refeições.</h3>
            <p>Combine livremente os sabores. O total define o preço de todas as unidades.</p>
          </div>
          <div className={styles.composerProgress} aria-live="polite">
            <strong>{selectedTotal}</strong>
            <span>de {MAX_ORDER_QUANTITY}</span>
          </div>
        </div>

        <p className={styles.tierProgressMessage} aria-live="polite">
          {quantityMessage(selectedTotal)}
        </p>

        {savedQuantities ? (
          <button
            type="button"
            className={styles.restoreButton}
            onClick={restoreSavedOrder}
          >
            <RotateCcw aria-hidden="true" /> Repetir minha última composição
          </button>
        ) : null}

        <div className={styles.flavorControls}>
          {flavors.map((flavor, index) => {
            const quantity = quantities[flavor.key] ?? 0;
            const soldOut = !hasStock(flavor);
            const reachedFlavorStock = quantity >= stockLimit(flavor);
            return (
              <div className={styles.flavorControl} key={flavor.key}>
                <span className={styles.flavorNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{flavor.name}</strong>
                <div aria-label={`Quantidade de ${flavor.name}`}>
                  <button
                    type="button"
                    onClick={() => changeFlavor(flavor.key, -1)}
                    disabled={quantity === 0}
                    aria-label={`Diminuir ${flavor.name}`}
                  >
                    <Minus aria-hidden="true" />
                  </button>
                  <span>{soldOut ? "Esgotado" : quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeFlavor(flavor.key, 1)}
                    disabled={soldOut || maxReached || reachedFlavorStock}
                    aria-label={`Aumentar ${flavor.name}`}
                  >
                    <Plus aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.composerFooter}>
          <div>
            <span>Total no Pix</span>
            <strong>{formatPrice(selectedPrice)}</strong>
            <small>
              {activeTier
                ? `${formatPrice(activeTier.unitPriceCents / 100)} por unidade · ${selectedTotal} ${selectedTotal === 1 ? "refeição" : "refeições"}`
                : "Escolha pelo menos 1 refeição para calcular o total."}
            </small>
          </div>
          {selectedTotal >= MIN_ORDER_QUANTITY ? (
            <MetaTrackedLink
              className={styles.builderCta}
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              metaEvent="InitiateCheckout"
              metaParameters={{
                content_name: `Linha Rotina — ${activeTier?.range}`,
                content_category: "Linha Rotina",
                content_ids: [`rotina-${activeTier?.id}`],
                content_type: "product_group",
                currency: "BRL",
                num_items: selectedTotal,
                value: selectedPrice,
              }}
              secondaryMetaEvent="Contact"
              secondaryMetaParameters={{
                content_name: "Pedido progressivo Linha Rotina",
                content_category: "WhatsApp",
              }}
              onClick={persistSelection}
            >
              <PackageCheck aria-hidden="true" />
              Reservar pelo WhatsApp
              <span aria-hidden="true">↗</span>
            </MetaTrackedLink>
          ) : (
            <button className={styles.builderCta} type="button" disabled>
              Escolha pelo menos 1 refeição
            </button>
          )}
        </div>

        <p className={styles.paymentMethodsNote}>
          <WalletCards aria-hidden="true" />
          <span>{PAYMENT_NOTE}</span>
        </p>
        <MetaTrackedLink
          className={styles.bulkQuote}
          href={bulkQuoteUrl}
          target="_blank"
          rel="noreferrer"
          metaEvent="Contact"
          metaParameters={{
            content_name: "Cotação acima de 30 refeições",
            content_category: "Linha Rotina",
          }}
        >
          <MessageCircle aria-hidden="true" /> Precisa de mais de 30? Solicite uma cotação pelo WhatsApp.
        </MetaTrackedLink>
      </div>
    </div>
  );
}
