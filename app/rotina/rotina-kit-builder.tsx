"use client";

import { Check, Minus, PackageCheck, Plus, RotateCcw } from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { MetaTrackedLink } from "@/app/meta-tracked-link";
import { formatPrice, whatsappNumber } from "@/lib/catalog";
import styles from "./rotina.module.css";

type PackageKey = "single" | "weekly" | "complete";
type FlavorKey = "tropeiro" | "tirinhas" | "parmegiana";
type FlavorQuantities = Record<FlavorKey, number>;

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

const STORAGE_KEY = "corta-essa-rotina-last-kit:v1";
const STORAGE_CHANGE_EVENT = "corta-essa-rotina-last-kit-change:v1";

const packageOptions: PackageOption[] = [
  {
    key: "single",
    eyebrow: "Primeira experiência",
    name: "1 refeição",
    description: "Para conhecer a Linha Rotina no seu sabor preferido.",
    quantity: 1,
    price: 29.9,
    unitPrice: 29.9,
  },
  {
    key: "weekly",
    eyebrow: "Semana organizada",
    name: "Kit 5",
    description: "Cinco refeições e liberdade para combinar os sabores.",
    quantity: 5,
    price: 139,
    unitPrice: 27.8,
    saving: 10.5,
  },
  {
    key: "complete",
    eyebrow: "Escolha completa",
    name: "Kit 20",
    description: "A solução mais completa para ter comida de verdade à mão.",
    quantity: 20,
    price: 529,
    unitPrice: 26.45,
    saving: 69,
    featured: true,
  },
];

const flavorOptions: { key: FlavorKey; name: string }[] = [
  { key: "tropeiro", name: "Tropeiro Vegano da Casa" },
  { key: "tirinhas", name: "Tirinhas de Soja Marinadas" },
  { key: "parmegiana", name: "Parmegiana de Soja" },
];

const defaultQuantities: Record<PackageKey, FlavorQuantities> = {
  single: { tropeiro: 1, tirinhas: 0, parmegiana: 0 },
  weekly: { tropeiro: 2, tirinhas: 2, parmegiana: 1 },
  complete: { tropeiro: 7, tirinhas: 7, parmegiana: 6 },
};

const isPackageKey = (value: unknown): value is PackageKey =>
  value === "single" || value === "weekly" || value === "complete";

const isFlavorQuantities = (
  value: unknown,
  expectedTotal: number,
): value is FlavorQuantities => {
  if (!value || typeof value !== "object") return false;
  const quantities = value as Partial<FlavorQuantities>;
  const values = flavorOptions.map(({ key }) => Number(quantities[key]));
  return (
    values.every((quantity) => Number.isInteger(quantity) && quantity >= 0) &&
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

const parseSavedKit = (stored: string | null) => {
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as {
      packageKey?: unknown;
      quantities?: unknown;
    };
    if (!isPackageKey(parsed.packageKey)) return null;
    const option = packageOptions.find(({ key }) => key === parsed.packageKey);
    if (!option || !isFlavorQuantities(parsed.quantities, option.quantity)) {
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

export function RotinaKitBuilder() {
  const [selectedKey, setSelectedKey] = useState<PackageKey>("complete");
  const [quantities, setQuantities] = useState<FlavorQuantities>(
    defaultQuantities.complete,
  );
  const savedKitSnapshot = useSyncExternalStore(
    subscribeToSavedKit,
    getSavedKitSnapshot,
    () => null,
  );
  const savedKit = useMemo(
    () => parseSavedKit(savedKitSnapshot),
    [savedKitSnapshot],
  );

  const selectedPackage = packageOptions.find(
    (option) => option.key === selectedKey,
  )!;
  const selectedTotal = Object.values(quantities).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const remaining = selectedPackage.quantity - selectedTotal;

  const whatsappUrl = useMemo(() => {
    const composition = flavorOptions
      .filter(({ key }) => quantities[key] > 0)
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
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [quantities, selectedPackage]);

  const selectPackage = (option: PackageOption) => {
    setSelectedKey(option.key);
    setQuantities({ ...defaultQuantities[option.key] });
  };

  const changeFlavor = (key: FlavorKey, delta: number) => {
    setQuantities((current) => {
      const nextValue = current[key] + delta;
      if (nextValue < 0) return current;
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

  return (
    <div className={styles.builder}>
      <div className={styles.packageGrid} aria-label="Escolha o tamanho do pedido">
        {packageOptions.map((option) => (
          <button
            type="button"
            key={option.key}
            className={`${styles.packageCard}${
              selectedKey === option.key ? ` ${styles.packageCardSelected}` : ""
            }${option.featured ? ` ${styles.packageCardFeatured}` : ""}`}
            aria-pressed={selectedKey === option.key}
            onClick={() => selectPackage(option)}
          >
            <span className={styles.packageEyebrow}>{option.eyebrow}</span>
            {option.featured && (
              <span className={styles.packageBadge}>Melhor escolha</span>
            )}
            <strong className={styles.packageName}>{option.name}</strong>
            <span className={styles.packageDescription}>{option.description}</span>
            <span className={styles.packagePrice}>{formatPrice(option.price)}</span>
            <span className={styles.packageUnitPrice}>
              {formatPrice(option.unitPrice)} por refeição
            </span>
            {option.saving && (
              <span className={styles.packageSaving}>
                Economize {formatPrice(option.saving)}
              </span>
            )}
            <span className={styles.packageSelect}>
              {selectedKey === option.key ? (
                <>
                  <Check aria-hidden="true" /> Selecionado
                </>
              ) : (
                "Escolher"
              )}
            </span>
          </button>
        ))}
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
            <p>
              Kits de 5 e 20 podem combinar livremente os três sabores.
            </p>
          </div>
          <div className={styles.composerProgress} aria-live="polite">
            <strong>{selectedTotal}</strong>
            <span>de {selectedPackage.quantity}</span>
          </div>
        </div>

        {savedKit && (
          <button
            type="button"
            className={styles.restoreButton}
            onClick={restoreSavedKit}
          >
            <RotateCcw aria-hidden="true" /> Repetir minha última composição
          </button>
        )}

        <div className={styles.flavorControls}>
          {flavorOptions.map(({ key, name }, index) => (
            <div className={styles.flavorControl} key={key}>
              <span className={styles.flavorNumber}>0{index + 1}</span>
              <strong>{name}</strong>
              <div aria-label={`Quantidade de ${name}`}>
                <button
                  type="button"
                  onClick={() => changeFlavor(key, -1)}
                  disabled={quantities[key] === 0}
                  aria-label={`Diminuir ${name}`}
                >
                  <Minus aria-hidden="true" />
                </button>
                <span>{quantities[key]}</span>
                <button
                  type="button"
                  onClick={() => changeFlavor(key, 1)}
                  disabled={remaining === 0}
                  aria-label={`Aumentar ${name}`}
                >
                  <Plus aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
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
              Escolha mais {remaining} {remaining === 1 ? "refeição" : "refeições"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
