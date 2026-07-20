-- Catálogo dinâmico, cadastro administrativo e imagens no Supabase Storage.
-- Execute no SQL Editor depois de 20260720_admin_inventory.sql.

begin;

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
    select 1 from pg_constraint
     where conname = 'catalog_products_tone_check'
       and conrelid = 'public.catalog_products'::regclass
  ) then
    alter table public.catalog_products
      add constraint catalog_products_tone_check
      check (tone in ('green', 'orange'));
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'catalog_products_slug_check'
       and conrelid = 'public.catalog_products'::regclass
  ) then
    alter table public.catalog_products
      add constraint catalog_products_slug_check
      check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'catalog_products_display_order_check'
       and conrelid = 'public.catalog_products'::regclass
  ) then
    alter table public.catalog_products
      add constraint catalog_products_display_order_check
      check (display_order >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
     where conname = 'catalog_products_category_slug_key'
       and conrelid = 'public.catalog_products'::regclass
  ) then
    alter table public.catalog_products
      add constraint catalog_products_category_slug_key unique (category, slug);
  end if;
end;
$$;

insert into public.catalog_products (
  key,
  slug,
  category,
  name,
  description,
  detail,
  weight,
  price_cents,
  tone,
  image_path,
  display_order
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

create index if not exists catalog_products_category_order_idx
  on public.catalog_products (category, display_order, created_at);

revoke all on table public.catalog_products from anon, authenticated;
grant select on table public.catalog_products to anon, authenticated;
grant insert on table public.catalog_products to authenticated;
grant update (
  category,
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

notify pgrst, 'reload schema';

commit;
