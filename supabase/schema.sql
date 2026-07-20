-- Corta Essa! — estrutura mínima para pedidos de entrega.
-- Execute este arquivo uma única vez no SQL Editor de um projeto Supabase novo.

create extension if not exists pgcrypto;

create table if not exists public.catalog_products (
  key text primary key,
  slug text not null,
  category text not null check (category in ('kit', 'unit')),
  name text not null,
  weight text not null,
  price_cents integer not null check (price_cents > 0),
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.catalog_products (key, slug, category, name, weight, price_cents)
values
  ('kit-divine', 'divine', 'kit', 'Divine Flour', '2 unidades de 150 g', 3500),
  ('kit-gold', 'gold', 'kit', 'Gold Marinade', '270 g', 4200),
  ('kit-red', 'red', 'kit', 'Red Hot Marinade', '270 g', 4200),
  ('kit-persian', 'persian', 'kit', 'Persian Barbecue', '300 g', 4200),
  ('kit-turkish', 'turkish', 'kit', 'Turkish Skewer', '300 g', 4200),
  ('kit-tropical', 'tropical', 'kit', 'Tropical Flavor', '360 g', 4200),
  ('kit-creamy', 'creamy', 'kit', 'Creamy Orange', '380 g', 4200),
  ('kit-petite', 'petite', 'kit', 'Petite Zucchini', '380 g', 4200),
  ('kit-deep', 'deep', 'kit', 'Deep Purple', '360 g', 4800),
  ('unit-divine', 'divine', 'unit', 'Divine Flour', '150 g', 1800),
  ('unit-gold', 'gold', 'unit', 'Gold Marinade', '90 g', 1500),
  ('unit-red', 'red', 'unit', 'Red Hot Marinade', '90 g', 1500),
  ('unit-persian', 'persian', 'unit', 'Persian Barbecue', '100 g', 1500),
  ('unit-turkish', 'turkish', 'unit', 'Turkish Skewer', '100 g', 1500),
  ('unit-tropical', 'tropical', 'unit', 'Tropical Flavor', '100 g', 1500),
  ('unit-creamy', 'creamy', 'unit', 'Creamy Orange', '130 g', 1500),
  ('unit-petite', 'petite', 'unit', 'Petite Zucchini', '130 g', 1500),
  ('unit-deep', 'deep', 'unit', 'Deep Purple', '120 g', 1800)
on conflict (key) do update set
  slug = excluded.slug,
  category = excluded.category,
  name = excluded.name,
  weight = excluded.weight,
  price_cents = excluded.price_cents,
  updated_at = now();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  status text not null default 'new'
    check (status in ('new', 'whatsapp_pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  delivery_type text not null default 'delivery' check (delivery_type = 'delivery'),
  customer_name text not null,
  phone text not null,
  postal_code text not null,
  street text not null,
  address_number text not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state text not null,
  reference text,
  notes text,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  delivery_fee_cents integer,
  total_cents integer not null default 0 check (total_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_key text not null references public.catalog_products(key),
  name_snapshot text not null,
  category text not null check (category in ('kit', 'unit')),
  weight_snapshot text not null,
  quantity integer not null check (quantity between 1 and 20),
  unit_price_cents integer not null check (unit_price_cents > 0),
  subtotal_cents integer not null check (subtotal_cents > 0),
  created_at timestamptz not null default now()
);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

alter table public.catalog_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.catalog_products from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;

create or replace function public.create_server_order(
  p_customer jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_order_number bigint;
  v_item jsonb;
  v_product record;
  v_product_key text;
  v_quantity integer;
  v_total integer := 0;
  v_name text := nullif(btrim(coalesce(p_customer ->> 'name', '')), '');
  v_phone text := nullif(btrim(coalesce(p_customer ->> 'phone', '')), '');
  v_postal_code text := nullif(btrim(coalesce(p_customer ->> 'postal_code', '')), '');
  v_street text := nullif(btrim(coalesce(p_customer ->> 'street', '')), '');
  v_address_number text := nullif(btrim(coalesce(p_customer ->> 'address_number', '')), '');
  v_complement text := nullif(btrim(coalesce(p_customer ->> 'complement', '')), '');
  v_neighborhood text := nullif(btrim(coalesce(p_customer ->> 'neighborhood', '')), '');
  v_city text := nullif(btrim(coalesce(p_customer ->> 'city', '')), '');
  v_state text := upper(nullif(btrim(coalesce(p_customer ->> 'state', '')), ''));
  v_reference text := nullif(btrim(coalesce(p_customer ->> 'reference', '')), '');
  v_notes text := nullif(btrim(coalesce(p_customer ->> 'notes', '')), '');
begin
  if jsonb_typeof(p_customer) is distinct from 'object' then
    raise exception 'Dados do cliente inválidos';
  end if;

  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 40 then
    raise exception 'Itens do pedido inválidos';
  end if;

  if v_name is null or char_length(v_name) > 120
     or v_phone is null or char_length(v_phone) < 8 or char_length(v_phone) > 30
     or v_postal_code is null or char_length(v_postal_code) > 12
     or v_street is null or char_length(v_street) > 160
     or v_address_number is null or char_length(v_address_number) > 20
     or v_neighborhood is null or char_length(v_neighborhood) > 100
     or v_city is null or char_length(v_city) > 100
     or v_state is null or char_length(v_state) <> 2
     or char_length(coalesce(v_complement, '')) > 120
     or char_length(coalesce(v_reference, '')) > 180
     or char_length(coalesce(v_notes, '')) > 600 then
    raise exception 'Dados de entrega inválidos';
  end if;

  insert into public.orders (
    status,
    customer_name,
    phone,
    postal_code,
    street,
    address_number,
    complement,
    neighborhood,
    city,
    state,
    reference,
    notes
  ) values (
    'whatsapp_pending',
    v_name,
    v_phone,
    v_postal_code,
    v_street,
    v_address_number,
    v_complement,
    v_neighborhood,
    v_city,
    v_state,
    v_reference,
    v_notes
  ) returning id, order_number into v_order_id, v_order_number;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) is distinct from 'object' then
      raise exception 'Item inválido';
    end if;

    v_product_key := nullif(btrim(coalesce(v_item ->> 'product_key', '')), '');

    begin
      v_quantity := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception 'Quantidade inválida';
    end;

    if v_product_key is null or v_quantity is null or v_quantity < 1 or v_quantity > 20 then
      raise exception 'Item ou quantidade inválida';
    end if;

    select key, name, category, weight, price_cents
      into v_product
      from public.catalog_products
     where key = v_product_key and active = true;

    if not found then
      raise exception 'Produto indisponível';
    end if;

    v_total := v_total + (v_product.price_cents * v_quantity);
    if v_total > 1000000 then
      raise exception 'Total acima do limite permitido';
    end if;

    insert into public.order_items (
      order_id,
      product_key,
      name_snapshot,
      category,
      weight_snapshot,
      quantity,
      unit_price_cents,
      subtotal_cents
    ) values (
      v_order_id,
      v_product.key,
      v_product.name,
      v_product.category,
      v_product.weight,
      v_quantity,
      v_product.price_cents,
      v_product.price_cents * v_quantity
    );
  end loop;

  update public.orders
     set subtotal_cents = v_total,
         total_cents = v_total,
         updated_at = now()
   where id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', 'CE-' || lpad(v_order_number::text, 6, '0'),
    'total_cents', v_total
  );
end;
$$;

revoke all on function public.create_server_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_server_order(jsonb, jsonb) to service_role;

comment on function public.create_server_order(jsonb, jsonb) is
  'Registra pedidos de entrega usando preços oficiais do catálogo. Uso exclusivo do servidor.';

notify pgrst, 'reload schema';

