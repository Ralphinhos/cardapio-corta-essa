"use client";

import { Check, Minus, PackageCheck, Plus, RotateCcw } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { MetaTrackedLink } from "@/app/meta-tracked-link";
import { formatPrice, whatsappNumber } from "@/lib/catalog";
import styles from "./rotina.module.css";

type PackageKey = "single" | "weekly" | "complete";
type FlavorQuantities = Record<string, number>;

export type RoutineFlavorOption = {
  key: string;
  name: string;
  price: number;
  stockQuantity?: number | null;
};

type PackageOption = {
  key: PackageKey;
  eyebrow: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  unitPrice: number;
  saving?: number;
  featured?: boolean;
};

const STORAGE_KEY = "corta-essa-rotina-last-kit:v2";
const STORAGE_CHANGE_EVENT = "corta-essa-rotina-last-kit-change:v2";

const packageDefinitions = [
  {
    key: "single",
    eyebrow: "Primeira experiência",
    name: "1 refeição",
    description: "Para conhecer a Linha Rotina no seu sabor preferido.",
    quantity: 1,
  },
  {
    key: "weekly",
    eyebrow: "Semana organizada",
    name: "Kit 5",
    description: "Cinco refeições e liberdade para combinar os sabores.",
    quantity: 5,
    price: 139,
  },
  {
    key: "complete",
    eyebrow: "Escolha completa",
    name: "Kit 20",
    description: "A solução mais completa para ter comida de verdade à mão.",
    quantity: 20,
    price: 529,
    featured: true,
  },
] as const;

const isPackageKey = (value: unknown): value is PackageKey =>
  value === "single" || value === "weekly" || value === "complete";

const stockLimit = (flavor: RoutineFlavorOption) =>
  flavor.stockQuantity == null
    ? Number.POSITIVE_INFINITY
    : flavor.stockQuantity;

const hasStock = (flavor: RoutineFlavorOption) => stockLimit(flavor) > 0;

const createDefaultQuantities = (
  total: number,
  flavors: RoutineFlavorOption[],
): FlavorQuantities => {
  const quantities = Object.fromEntries(
    flavors.map((flavor) => [flavor.key, 0]),
  ) as FlavorQuantities;
  const available = flavors.filter(hasStock);
  let remaining = total;

  while (remaining > 0 && available.length > 0) {
    let changed = false;
    for (const flavor of available) {
      if (remaining === 0) break;
      if (quantities[flavor.key] >= stockLimit(flavor)) continue;
      quantities[flavor.key] += 1;
      remaining -= 1;
      changed = true;
    }
    if (!changed) break;
  }

  return quantities;
};

const canFillPackage = (quantity: number, flavors: RoutineFlavorOption[]) => {
  if (flavors.some((flavor) => flavor.stockQuantity == null)) return true;
  return (
    flavors.reduce(
      (total, flavor) => total + Math.max(0, flavor.stockQuantity ?? 0),
      0,
    ) >= quantity
  );
};

const isFlavorQuantities = (
  value: unknown,
  expectedTotal: number,
  flavors: RoutineFlavorOption[],
): value is FlavorQuantities => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const quantities = value as FlavorQuantities;
  const validKeys = new Set(flavors.map((flavor) => flavor.key));
  if (Object.keys(quantities).some((key) => !validKeys.has(key))) return false;

  const values = flavors.map((flavor) => Number(quantities[flavor.key] ?? 0));
  return (
    values.every(
      (quantity, index) =>
        Number.isInteger(quantity) &&
        quantity >= 0 &&
        quantity <= stockLimit(flavors[index]),
    ) &&
    values.reduce((total, quantity) => total + quantity, 0) === expectedTotal
  );
};

const subscribeToSavedKit = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
  };
};

const getSavedKitSnapshot = () => window.localStorage.getItem(STORAGE_KEY);

const parseSavedKit = (
  stored: string | null,
  packages: PackageOption[],
  flavors: RoutineFlavorOption[],
) => {
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as {
      packageKey?: unknown;
      quantities?: unknown;
    };
    if (!isPackageKey(parsed.packageKey)) return null;
    const option = packages.find(({ key }) => key === parsed.packageKey);
    if (
      !option ||
      !isFlavorQuantities(parsed.quantities, option.quantity, flavors)
    ) {
      return null;
    }
    return {
      packageKey: parsed.packageKey,
      quantities: parsed.quantities,
    };
  } catch {
    return null;
  }
};

export function RotinaKitBuilder({
  flavors,
}: {
  flavors: RoutineFlavorOption[];
}) {
  const availableFlavors = useMemo(() => flavors.filter(hasStock), [flavors]);
  const baseSinglePrice =
    availableFlavors[0]?.price ?? flavors[0]?.price ?? 29.9;
  const packages = useMemo<PackageOption[]>(
    () =>
      packageDefinitions.map((option) => {
        const price = "price" in option ? option.price : baseSinglePrice;
        const saving = Math.max(0, baseSinglePrice * option.quantity - price);
        return {
          ...option,
          price,
          unitPrice: price / option.quantity,
          saving: saving > 0.005 ? saving : undefined,
        };
      }),
    [baseSinglePrice],
  );
  const [selectedKey, setSelectedKey] = useState<PackageKey>("complete");
  const [quantities, setQuantities] = useState<FlavorQuantities>(() =>
    createDefaultQuantities(20, flavors),
  );
  const savedKitSnapshot = useSyncExternalStore(
    subscribeToSavedKit,
    getSavedKitSnapshot,
    () => null,
  );
  const savedKit = useMemo(
    () => parseSavedKit(savedKitSnapshot, packages, flavors),
    [flavors, packages, savedKitSnapshot],
  );

  const packageBase = packages.find((option) => option.key === selectedKey)!;
  const selectedFlavor = flavors.find(
    (flavor) => (quantities[flavor.key] ?? 0) > 0,
  );
  const selectedPrice =
    selectedKey === "single"
      ? selectedFlavor?.price ?? packageBase.price
      : packageBase.price;
  const selectedPackage = {
    ...packageBase,
    price: selectedPrice,
    unitPrice: selectedPrice / packageBase.quantity,
  };
  const selectedTotal = Object.values(quantities).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const remaining = selectedPackage.quantity - selectedTotal;

  const composition = flavors
    .filter(({ key }) => (quantities[key] ?? 0) > 0)
    .map(({ key, name }) => `${quantities[key]}× ${name}`)
    .join("\n");
  const message = [
    "Olá! Quero reservar um pedido da Linha Rotina.",
    "",
    `${selectedPackage.name} — ${formatPrice(selectedPackage.price)}`,
    composition,
    "",
    "Podemos confirmar a disponibilidade e a entrega?",
  ].join("\n");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const selectPackage = (option: PackageOption) => {
    if (!canFillPackage(option.quantity, flavors)) return;
    setSelectedKey(option.key);
    setQuantities(createDefaultQuantities(option.quantity, flavors));
  };

  const changeFlavor = (key: string, delta: number) => {
    const flavor = flavors.find((item) => item.key === key);
    if (!flavor) return;

    setQuantities((current) => {
      const currentValue = current[key] ?? 0;
      const nextValue = currentValue + delta;
      if (nextValue < 0 || nextValue > stockLimit(flavor)) return current;
      const currentTotal = Object.values(current).reduce(
        (total, quantity) => total + quantity,
        0,
      );
      if (delta > 0 && currentTotal >= selectedPackage.quantity) return current;
      return { ...current, [key]: nextValue };
    });
  };

  const restoreSavedKit = () => {
    if (!savedKit) return;
    setSelectedKey(savedKit.packageKey);
    setQuantities({ ...savedKit.quantities });
  };

  const persistSelection = () => {
    const selection = { packageKey: selectedKey, quantities };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
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
      <div className={styles.packageGrid} aria-label="Escolha o tamanho do pedido">
        {packages.map((option) => {
          const disabled = !canFillPackage(option.quantity, flavors);
          const shownPrice =
            option.key === "single" && selectedKey === "single"
              ? selectedPrice
              : option.price;
          return (
            <button
              type="button"
              key={option.key}
              className={`${styles.packageCard}${
                selectedKey === option.key
                  ? ` ${styles.packageCardSelected}`
                  : ""
              }${option.featured ? ` ${styles.packageCardFeatured}` : ""}`}
              aria-pressed={selectedKey === option.key}
              onClick={() => selectPackage(option)}
              disabled={disabled}
            >
              <span className={styles.packageEyebrow}>{option.eyebrow}</span>
              {option.featured ? (
                <span className={styles.packageBadge}>Melhor escolha</span>
              ) : null}
              <strong className={styles.packageName}>{option.name}</strong>
              <span className={styles.packageDescription}>{option.description}</span>
              <span className={styles.packagePrice}>{formatPrice(shownPrice)}</span>
              <span className={styles.packageUnitPrice}>
                {formatPrice(shownPrice / option.quantity)} por refeição
              </span>
              {option.saving ? (
                <span className={styles.packageSaving}>
                  Economize {formatPrice(option.saving)}
                </span>
              ) : null}
              <span className={styles.packageSelect}>
                {disabled ? (
                  "Estoque insuficiente"
                ) : selectedKey === option.key ? (
                  <><Check aria-hidden="true" /> Selecionado</>
                ) : (
                  "Escolher"
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.composer}>
        <div className={styles.composerHeading}>
          <div>
            <span>Monte do seu jeito</span>
            <h3>
              {selectedPackage.quantity === 1
                ? "Escolha seu primeiro sabor."
                : `Distribua suas ${selectedPackage.quantity} refeições.`}
            </h3>
            <p>Kits de 5 e 20 podem combinar livremente os sabores disponíveis.</p>
          </div>
          <div className={styles.composerProgress} aria-live="polite">
            <strong>{selectedTotal}</strong>
            <span>de {selectedPackage.quantity}</span>
          </div>
        </div>

        {savedKit ? (
          <button
            type="button"
            className={styles.restoreButton}
            onClick={restoreSavedKit}
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
                    disabled={soldOut || remaining === 0 || reachedFlavorStock}
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
            <span>Total do pedido</span>
            <strong>{formatPrice(selectedPackage.price)}</strong>
            <small>Taxa e disponibilidade confirmadas no atendimento.</small>
          </div>
          {remaining === 0 ? (
            <MetaTrackedLink
              className={styles.builderCta}
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              metaEvent="InitiateCheckout"
              metaParameters={{
                content_name: `Linha Rotina — ${selectedPackage.name}`,
                content_category: "Linha Rotina",
                content_ids: [`rotina-${selectedKey}`],
                content_type: "product_group",
                currency: "BRL",
                num_items: selectedPackage.quantity,
                value: selectedPackage.price,
              }}
              secondaryMetaEvent="Contact"
              secondaryMetaParameters={{
                content_name: `Linha Rotina — ${selectedPackage.name}`,
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
              Escolha mais {remaining}{" "}
              {remaining === 1 ? "refeição" : "refeições"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
