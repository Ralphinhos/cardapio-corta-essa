import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const noStore = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ORDERING_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Pedidos online ainda não estão habilitados." },
      { status: 503, headers: noStore },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 24_000) {
    return NextResponse.json(
      { error: "Pedido maior que o limite permitido." },
      { status: 413, headers: noStore },
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "O serviço de pedidos ainda não foi configurado." },
      { status: 503, headers: noStore },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler os dados do pedido." },
      { status: 400, headers: noStore },
    );
  }

  if (!isRecord(payload) || !isRecord(payload.customer) || !Array.isArray(payload.items)) {
    return NextResponse.json(
      { error: "Dados do pedido incompletos." },
      { status: 400, headers: noStore },
    );
  }

  if (cleanText(payload.website, 120)) {
    return NextResponse.json(
      { error: "Não foi possível registrar o pedido." },
      { status: 400, headers: noStore },
    );
  }

  const customer = {
    name: cleanText(payload.customer.name, 120),
    phone: cleanText(payload.customer.phone, 30),
    postal_code: cleanText(payload.customer.postal_code, 12),
    street: cleanText(payload.customer.street, 160),
    address_number: cleanText(payload.customer.address_number, 20),
    complement: cleanText(payload.customer.complement, 120),
    neighborhood: cleanText(payload.customer.neighborhood, 100),
    city: cleanText(payload.customer.city, 100),
    state: cleanText(payload.customer.state, 2).toUpperCase(),
    reference: cleanText(payload.customer.reference, 180),
    notes: cleanText(payload.customer.notes, 600),
  };

  const requiredCustomerFields = [
    customer.name,
    customer.phone,
    customer.postal_code,
    customer.street,
    customer.address_number,
    customer.neighborhood,
    customer.city,
    customer.state,
  ];

  if (requiredCustomerFields.some((field) => !field)) {
    return NextResponse.json(
      { error: "Preencha os dados obrigatórios para entrega." },
      { status: 400, headers: noStore },
    );
  }

  const items = payload.items
    .filter(isRecord)
    .map((item) => ({
      product_key: cleanText(item.product_key, 80),
      quantity: Number(item.quantity),
    }));

  if (
    items.length === 0 ||
    items.length !== payload.items.length ||
    items.length > 40 ||
    items.some(
      (item) =>
        !item.product_key ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20,
    )
  ) {
    return NextResponse.json(
      { error: "Revise os itens e as quantidades do pedido." },
      { status: 400, headers: noStore },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let data: unknown;
  let rpcError: { message: string } | null = null;

  try {
    const result = await supabase.rpc("create_server_order", {
      p_customer: customer,
      p_items: items,
    });
    data = result.data;
    rpcError = result.error;
  } catch {
    return NextResponse.json(
      { error: "Não foi possível acessar o serviço de pedidos." },
      { status: 502, headers: noStore },
    );
  }

  if (rpcError) {
    console.error("[orders] Falha ao registrar pedido:", rpcError.message);
    const stockConflict = /estoque insuficiente|produto indisponível/i.test(
      rpcError.message,
    );
    return NextResponse.json(
      {
        error: stockConflict
          ? "Um dos produtos ficou sem estoque. Atualize o cardápio e revise o pedido."
          : "Não foi possível registrar o pedido. Tente novamente.",
      },
      { status: stockConflict ? 409 : 500, headers: noStore },
    );
  }

  return NextResponse.json(data, { status: 201, headers: noStore });
}
