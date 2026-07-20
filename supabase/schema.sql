-- Corta Essa! — estrutura mínima para pedidos de entrega.
-- Execute este arquivo uma única vez no SQL Editor de um projeto Supabase novo.

create extension if not exists pgcrypto;

create table if not exists public.catalog_products (
  key text primary key,
  slug text not null,
  category text not null check (category in ('kit', 'unit', 'combo')),
  name text not null,
  description text not null,
  detail text,
  badge_text text not null default 'Feito para a brasa',
  weight text not null,
  price_cents integer not null check (price_cents > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_top_seller boolean not null default false,
  tone text not null default 'green' check (tone in ('green', 'orange')),
  image_path text not null,
  display_order integer not null default 0 check (display_order >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalog_products
  add column if not exists stock_quantity integer not null default 0;

alter table public.catalog_products
  add column if not exists is_top_seller boolean not null default false;

alter table public.catalog_products
  add column if not exists description text not null default '';

alter table public.catalog_products
  add column if not exists detail text;

alter table public.catalog_products
  add column if not exists badge_text text not null default 'Feito para a brasa';

alter table public.catalog_products
  add column if not exists tone text not null default 'green';

alter table public.catalog_products
  add column if not exists image_path text not null default '';

alter table public.catalog_products
  add column if not exists display_order integer not null default 0;

alter table public.catalog_products
  add column if not exists created_at timestamptz not null default now();

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

insert into public.catalog_products (
  key, slug, category, name, description, detail, weight, price_cents,
  tone, image_path, display_order
)
values
  ('kit-divine', 'divine', 'kit', 'Divine Flour', 'Farofa de milho com soja, castanha de caju e alho frito', null, '2 unidades de 150 g', 3500, 'green', '/images/divine-kit.webp', 1),
  ('kit-gold', 'gold', 'kit', 'Gold Marinade', 'Espetinho de soja marinada com tomate-cereja, pimentão e cebola-roxa', 'Marinada: shoyu, limão e gergelim tostado', '270 g', 4200, 'orange', '/images/gold-kit.webp', 2),
  ('kit-red', 'red', 'kit', 'Red Hot Marinade', 'Espetinho de soja marinada com tomate-cereja, pimentão e cebola-roxa', 'Marinada: shoyu, pimenta-calabresa, cebola e pimentão', '270 g', 4200, 'green', '/images/red-kit.webp', 3),
  ('kit-persian', 'persian', 'kit', 'Persian Barbecue', 'Kafta de soja com recheio de provolone', null, '300 g', 4200, 'orange', '/images/persian-kit.webp', 4),
  ('kit-turkish', 'turkish', 'kit', 'Turkish Skewer', 'Kafta de soja com recheio de queijo coalho', null, '300 g', 4200, 'green', '/images/turkish-kit.webp', 5),
  ('kit-tropical', 'tropical', 'kit', 'Tropical Flavor', 'Espetinho de tofu cremoso com abacaxi, cebola-roxa e pimentão', null, '360 g', 4200, 'orange', '/images/tropical-kit.webp', 6),
  ('kit-creamy', 'creamy', 'kit', 'Creamy Orange', 'Medalhão de cenoura com recheio de mandioca e queijo coalho', null, '380 g', 4200, 'green', '/images/creamy-kit.webp', 7),
  ('kit-petite', 'petite', 'kit', 'Petite Zucchini', 'Medalhão de abobrinha com recheio de mandioca e provolone', null, '380 g', 4200, 'orange', '/images/petite-kit.webp', 8),
  ('kit-deep', 'deep', 'kit', 'Deep Purple', 'Medalhão de repolho-roxo com recheio de cabotiá confitada, alho, gorgonzola e gergelim', null, '360 g', 4800, 'green', '/images/deep-kit.webp', 9),
  ('unit-divine', 'divine', 'unit', 'Divine Flour', 'Farofa de milho com soja, castanha de caju e alho frito', null, '150 g', 1800, 'green', '/images/divine-unit.webp', 1),
  ('unit-gold', 'gold', 'unit', 'Gold Marinade', 'Espetinho de soja marinada com tomate-cereja, pimentão e cebola-roxa', 'Marinada: shoyu, limão e gergelim tostado', '90 g', 1500, 'orange', '/images/gold-unit.webp', 2),
  ('unit-red', 'red', 'unit', 'Red Hot Marinade', 'Espetinho de soja marinada com tomate-cereja, pimentão e cebola-roxa', 'Marinada: shoyu, pimenta-calabresa, cebola e pimentão', '90 g', 1500, 'green', '/images/red-unit.webp', 3),
  ('unit-persian', 'persian', 'unit', 'Persian Barbecue', 'Kafta de soja com recheio de queijo provolone', null, '100 g', 1500, 'orange', '/images/persian-unit.webp', 4),
  ('unit-turkish', 'turkish', 'unit', 'Turkish Skewer', 'Kafta de lentilha com recheio de queijo coalho', null, '100 g', 1500, 'green', '/images/turkish-unit.webp', 5),
  ('unit-tropical', 'tropical', 'unit', 'Tropical Flavor', 'Espetinho de tofu cremoso com abacaxi, cebola-roxa e pimentão', null, '100 g', 1500, 'orange', '/images/tropical-unit.webp', 6),
  ('unit-creamy', 'creamy', 'unit', 'Creamy Orange', 'Medalhão de cenoura com recheio de mandioca e queijo coalho', null, '130 g', 1500, 'green', '/images/creamy-unit.webp', 7),
  ('unit-petite', 'petite', 'unit', 'Petite Zucchini', 'Medalhão de abobrinha com recheio de mandioca e provolone', null, '130 g', 1500, 'orange', '/images/petite-unit.webp', 8),
  ('unit-deep', 'deep', 'unit', 'Deep Purple', 'Medalhão de repolho-roxo com recheio de cabotiá confitada, alho, gorgonzola e gergelim', null, '120 g', 1800, 'green', '/images/deep-unit.webp', 9)
on conflict (key) do update set
  slug = excluded.slug,
  category = excluded.category,
  name = excluded.name,
  description = excluded.description,
  detail = excluded.detail,
  weight = excluded.weight,
  price_cents = excluded.price_cents,
  tone = excluded.tone,
  image_path = excluded.image_path,
  display_order = excluded.display_order,
  updated_at = now();

update public.catalog_products
   set badge_text = 'Pronta para servir'
 where slug = 'divine'
   and badge_text = 'Feito para a brasa';

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
  category text not null check (category in ('kit', 'unit', 'combo')),
  weight_snapshot text not null,
  quantity integer not null check (quantity between 1 and 20),
  unit_price_cents integer not null check (unit_price_cents > 0),
  subtotal_cents integer not null check (subtotal_cents > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create unique index if not exists catalog_products_category_slug_idx
  on public.catalog_products (category, slug);

create index if not exists catalog_products_category_order_idx
  on public.catalog_products (category, display_order, created_at);

alter table public.catalog_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;

revoke all on table public.catalog_products from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;

grant select on table public.catalog_products to anon, authenticated;
grant insert on table public.catalog_products to authenticated;
grant update (
  name,
  description,
  detail,
  badge_text,
  weight,
  price_cents,
  stock_quantity,
  is_top_seller,
  active,
  tone,
  image_path,
  display_order,
  updated_at
) on table public.catalog_products to authenticated;

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

drop policy if exists "catalog_admin_product_insert" on public.catalog_products;
create policy "catalog_admin_product_insert"
  on public.catalog_products
  for insert
  to authenticated
  with check ((select public.is_catalog_admin()));

drop policy if exists "catalog_admin_inventory_update" on public.catalog_products;
create policy "catalog_admin_inventory_update"
  on public.catalog_products
  for update
  to authenticated
  using ((select public.is_catalog_admin()))
  with check ((select public.is_catalog_admin()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (select public.is_catalog_admin())
  );

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.is_catalog_admin())
  )
  with check (
    bucket_id = 'product-images'
    and (select public.is_catalog_admin())
  );

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select public.is_catalog_admin())
  );

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

revoke all on function public.create_server_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.create_server_order(jsonb, jsonb) to service_role;

comment on function public.create_server_order(jsonb, jsonb) is
  'Registra pedidos de entrega usando preços oficiais do catálogo. Uso exclusivo do servidor.';

notify pgrst, 'reload schema';
