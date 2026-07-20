"use client";
/* eslint-disable @next/next/no-img-element -- Product assets are already optimized WebP files. */

import {
  Box,
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  type CartItem,
  categoryLabel,
  formatPrice,
  productImagePath,
  productImageUrl,
  productKey,
  whatsappNumber,
} from "@/lib/catalog";

type OrderResult = {
  order_id: string;
  order_number: string;
  total_cents: number;
};

type Confirmation = OrderResult & {
  deliveryLabel: string;
  whatsappUrl: string;
};

type OrderCartProps = {
  items: CartItem[];
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  onIncrease: (item: CartItem) => void;
  onDecrease: (item: CartItem) => void;
  onRemove: (item: CartItem) => void;
  onOrderPlaced: () => void;
};

const inputValue = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

const getTodayInSaoPaulo = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const formatDeliveryDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

export function OrderCart({
  items,
  open,
  onClose,
  onOpen,
  onIncrease,
  onDecrease,
  onRemove,
  onOrderPlaced,
}: OrderCartProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const minimumDeliveryDate = useMemo(() => getTodayInSaoPaulo(), []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [items],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const closeDialog = () => {
    if (!submitting) dialogRef.current?.close();
  };

  const handleDialogClose = () => {
    setError("");
    setConfirmation(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length || submitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const customer = {
      name: inputValue(formData, "name"),
      phone: inputValue(formData, "phone"),
      postal_code: inputValue(formData, "postal_code"),
      street: inputValue(formData, "street"),
      address_number: inputValue(formData, "address_number"),
      complement: inputValue(formData, "complement"),
      neighborhood: inputValue(formData, "neighborhood"),
      city: inputValue(formData, "city"),
      state: inputValue(formData, "state").toUpperCase(),
      requested_delivery_date: inputValue(formData, "requested_delivery_date"),
      requested_delivery_time: inputValue(formData, "requested_delivery_time"),
      reference: inputValue(formData, "reference"),
      notes: inputValue(formData, "notes"),
    };

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: inputValue(formData, "website"),
          customer,
          items: items.map((item) => ({
            product_key: productKey(item.category, item.product),
            quantity: item.quantity,
          })),
        }),
      });

      const result = (await response.json().catch(() => ({
        error: "O servidor não respondeu como esperado. Tente novamente.",
      }))) as OrderResult & { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Não foi possível registrar o pedido.");
      }

      const itemSummary = items
        .map(
          (item) =>
            `${item.quantity}x ${item.product.name} (${categoryLabel(item.category)} · ${item.product.weight})`,
        )
        .join("\n");
      const address = [
        `${customer.street}, ${customer.address_number}`,
        customer.complement,
        customer.neighborhood,
        `${customer.city}/${customer.state}`,
        `CEP ${customer.postal_code}`,
      ]
        .filter(Boolean)
        .join(" · ");
      const deliveryLabel = `${formatDeliveryDate(customer.requested_delivery_date)} às ${customer.requested_delivery_time}`;
      const message = [
        `Olá! Quero confirmar o pedido ${result.order_number}.`,
        "",
        itemSummary,
        "",
        `Total: ${formatPrice(result.total_cents / 100)}`,
        `Entrega desejada: ${deliveryLabel}`,
        `Entrega: ${address}`,
        customer.reference ? `Referência: ${customer.reference}` : "",
        customer.notes ? `Observações: ${customer.notes}` : "",
      ]
        .filter((line) => line !== "")
        .join("\n");

      setConfirmation({
        ...result,
        deliveryLabel,
        whatsappUrl: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      });
      form.reset();
      onOrderPlaced();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível registrar o pedido.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {itemCount > 0 && (
        <button className="cart-fab" type="button" onClick={onOpen} aria-label={`Abrir pedido com ${itemCount} itens`}>
          <ShoppingBag aria-hidden="true" />
          <span>Pedido</span>
          <strong>{itemCount}</strong>
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="checkout"
        aria-labelledby="checkout-title"
        onClose={handleDialogClose}
        onCancel={(event) => {
          if (submitting) event.preventDefault();
        }}
      >
        <div className="checkout__shell">
          <header className="checkout__header">
            <div>
              <span>Pedido para entrega</span>
              <h2 id="checkout-title">
                {confirmation ? "Pedido registrado" : "Monte sua encomenda"}
              </h2>
            </div>
            <button type="button" onClick={closeDialog} aria-label="Fechar pedido">
              <X aria-hidden="true" />
            </button>
          </header>

          {confirmation ? (
            <div className="checkout-success" aria-live="polite">
              <span className="checkout-success__icon"><Check aria-hidden="true" /></span>
              <p className="checkout-success__eyebrow">Registro concluído</p>
              <h3>{confirmation.order_number}</h3>
              <p>
                Seu pedido já está salvo. Agora envie a mensagem para confirmarmos
                disponibilidade e entrega pelo WhatsApp.
              </p>
              <p className="checkout-success__delivery">
                <CalendarDays aria-hidden="true" /> Entrega desejada: {confirmation.deliveryLabel}
              </p>
              <strong>{formatPrice(confirmation.total_cents / 100)}</strong>
              <a href={confirmation.whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" />
                Confirmar no WhatsApp
              </a>
              <button type="button" onClick={closeDialog}>Fechar</button>
            </div>
          ) : items.length === 0 ? (
            <div className="checkout-empty">
              <Box aria-hidden="true" />
              <h3>Seu pedido está vazio.</h3>
              <p>Escolha os produtos e volte aqui para informar a entrega.</p>
              <a href="#cardapio" onClick={closeDialog}>Ver cardápio</a>
            </div>
          ) : (
            <form className="checkout__body" onSubmit={handleSubmit}>
              <section className="checkout-summary" aria-labelledby="checkout-summary-title">
                <div className="checkout-section-title">
                  <span>01</span>
                  <div>
                    <h3 id="checkout-summary-title">Seu pedido</h3>
                    <p>{itemCount} {itemCount === 1 ? "item" : "itens"}</p>
                  </div>
                </div>

                <div className="checkout-lines">
                  {items.map((item) => {
                    const itemKey = productKey(item.category, item.product);
                    const stockQuantity = item.product.stockQuantity;
                    const stockId = `stock-limit-${itemKey}`;
                    const atStockLimit =
                      stockQuantity != null && item.quantity >= stockQuantity;

                    return (
                      <article className="checkout-line" key={itemKey}>
                        <img
                          src={productImageUrl(
                            productImagePath(item.category, item.product),
                          )}
                          alt=""
                        />
                        <div className="checkout-line__copy">
                          <h4>{item.product.name}</h4>
                          <p>{categoryLabel(item.category)} · {item.product.weight}</p>
                          {stockQuantity != null && (
                            <span className="checkout-line__stock" id={stockId}>
                              <PackageCheck aria-hidden="true" />
                              Máximo disponível: {stockQuantity}
                            </span>
                          )}
                          <strong>{formatPrice(item.product.price * item.quantity)}</strong>
                        </div>
                        <div className="checkout-line__actions" aria-label={`Quantidade de ${item.product.name}`}>
                          <button type="button" onClick={() => onDecrease(item)} aria-label={`Diminuir ${item.product.name}`}>
                            <Minus aria-hidden="true" />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onIncrease(item)}
                            aria-label={
                              atStockLimit
                                ? `Estoque máximo atingido para ${item.product.name}`
                                : `Aumentar ${item.product.name}`
                            }
                            aria-describedby={stockQuantity != null ? stockId : undefined}
                            disabled={atStockLimit}
                          >
                            <Plus aria-hidden="true" />
                          </button>
                          <button className="checkout-line__remove" type="button" onClick={() => onRemove(item)} aria-label={`Remover ${item.product.name}`}>
                            <Trash2 aria-hidden="true" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="checkout-total">
                  <span>Total dos produtos</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <p className="checkout-summary__note">
                  Taxa e prazo de entrega são confirmados no WhatsApp.
                </p>
              </section>

              <section className="checkout-form" aria-labelledby="checkout-delivery-title">
                <div className="checkout-section-title">
                  <span>02</span>
                  <div>
                    <h3 id="checkout-delivery-title">Dados da entrega</h3>
                    <p><MapPin aria-hidden="true" /> Atendimento somente por entrega</p>
                  </div>
                </div>

                <div className="checkout-fields">
                  <label className="checkout-field checkout-field--full">
                    <span>Nome</span>
                    <input name="name" autoComplete="name" maxLength={120} required />
                  </label>
                  <label className="checkout-field checkout-field--full">
                    <span>WhatsApp</span>
                    <input name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} placeholder="(35) 99999-9999" required />
                  </label>
                  <label className="checkout-field checkout-field--half">
                    <span><CalendarDays aria-hidden="true" /> Dia desejado</span>
                    <input
                      name="requested_delivery_date"
                      type="date"
                      min={minimumDeliveryDate}
                      aria-describedby="checkout-schedule-note"
                      required
                    />
                  </label>
                  <label className="checkout-field checkout-field--half">
                    <span><Clock3 aria-hidden="true" /> Horário desejado</span>
                    <input
                      name="requested_delivery_time"
                      type="time"
                      aria-describedby="checkout-schedule-note"
                      required
                    />
                  </label>
                  <p className="checkout-schedule-note" id="checkout-schedule-note">
                    Data e horário desejados, sujeitos à confirmação pelo WhatsApp.
                  </p>
                  <label className="checkout-field">
                    <span>CEP</span>
                    <input name="postal_code" autoComplete="postal-code" inputMode="numeric" maxLength={12} placeholder="00000-000" required />
                  </label>
                  <label className="checkout-field checkout-field--wide">
                    <span>Rua / avenida</span>
                    <input name="street" autoComplete="address-line1" maxLength={160} required />
                  </label>
                  <label className="checkout-field">
                    <span>Número</span>
                    <input name="address_number" maxLength={20} required />
                  </label>
                  <label className="checkout-field checkout-field--wide">
                    <span>Complemento</span>
                    <input name="complement" autoComplete="address-line2" maxLength={120} placeholder="Opcional" />
                  </label>
                  <label className="checkout-field">
                    <span>Bairro</span>
                    <input name="neighborhood" maxLength={100} required />
                  </label>
                  <label className="checkout-field checkout-field--wide">
                    <span>Cidade</span>
                    <input name="city" autoComplete="address-level2" maxLength={100} required />
                  </label>
                  <label className="checkout-field checkout-field--state">
                    <span>UF</span>
                    <input name="state" autoComplete="address-level1" maxLength={2} placeholder="MG" required />
                  </label>
                  <label className="checkout-field checkout-field--full">
                    <span>Ponto de referência</span>
                    <input name="reference" maxLength={180} placeholder="Opcional" />
                  </label>
                  <label className="checkout-field checkout-field--full">
                    <span>Observações</span>
                    <textarea name="notes" maxLength={600} rows={3} placeholder="Preferências ou detalhes para a entrega (opcional)" />
                  </label>
                  <label className="checkout__trap" aria-hidden="true">
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                {error && <p className="checkout-error" role="alert">{error}</p>}

                <button className="checkout-submit" type="submit" disabled={submitting}>
                  {submitting ? (
                    <><LoaderCircle className="checkout-submit__loader" aria-hidden="true" /> Registrando pedido</>
                  ) : (
                    <><ShoppingBag aria-hidden="true" /> Registrar e continuar</>
                  )}
                </button>
                <p className="checkout-form__note">
                  Ao continuar, o pedido é salvo e você finaliza a confirmação no WhatsApp.
                </p>
              </section>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
