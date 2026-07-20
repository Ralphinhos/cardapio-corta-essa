-- Painel administrativo, estoque e destaques.
-- Execute no SQL Editor do projeto Supabase já existente.

begin;

alter table public.catalog_products
  add column if not exists stock_quantity integer not null default 0;

alter table public.catalog_products
  add column if not exists is_top_seller boolean not null default false;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'catalog_products_stock_quantity_check'
       and conrelid = 'public.catalog_products'::regclass
  ) then
    alter table public.catalog_products
      add constraint catalog_products_stock_quantity_check
      check (stock_quantity >= 0);
  end if;
end;
$$;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.catalog_products enable row level security;
alter table public.admin_users enable row level security;

revoke all on table public.catalog_products from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;

grant select on table public.catalog_products to anon, authenticated;
grant update (stock_quantity, is_top_seller)
  on table public.catalog_products to authenticated;

create or replace function public.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.admin_users
     where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_catalog_admin() from public, anon;
grant execute on function public.is_catalog_admin() to authenticated;

drop policy if exists "catalog_products_public_read" on public.catalog_products;
create policy "catalog_products_public_read"
  on public.catalog_products
  for select
  to anon, authenticated
  using (true);

drop policy if exists "catalog_admin_inventory_update" on public.catalog_products;
create policy "catalog_admin_inventory_update"
  on public.catalog_products
  for update
  to authenticated
  using ((select public.is_catalog_admin()))
  with check ((select public.is_catalog_admin()));

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

    select key, name, category, weight, price_cents, stock_quantity
      into v_product
      from public.catalog_products
     where key = v_product_key and active = true
     for update;

    if not found then
      raise exception 'Produto indisponível';
    end if;

    if v_product.stock_quantity < v_quantity then
      raise exception 'Estoque insuficiente para %', v_product.name;
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

    update public.catalog_products
       set stock_quantity = stock_quantity - v_quantity,
           updated_at = now()
     where key = v_product.key;
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

revoke all on function public.create_server_order(jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_server_order(jsonb, jsonb) to service_role;

notify pgrst, 'reload schema';

commit;
