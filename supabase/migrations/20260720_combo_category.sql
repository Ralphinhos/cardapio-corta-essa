-- Adiciona a categoria Combo ao catálogo e aos itens de pedido existentes.
-- Execute no SQL Editor depois de 20260720_dynamic_catalog.sql.

begin;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
      from pg_constraint
     where conrelid = 'public.catalog_products'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format(
      'alter table public.catalog_products drop constraint %I',
      constraint_record.conname
    );
  end loop;

  alter table public.catalog_products
    add constraint catalog_products_category_check
    check (category in ('kit', 'unit', 'combo'));

  for constraint_record in
    select conname
      from pg_constraint
     where conrelid = 'public.order_items'::regclass
       and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%category%'
  loop
    execute format(
      'alter table public.order_items drop constraint %I',
      constraint_record.conname
    );
  end loop;

  alter table public.order_items
    add constraint order_items_category_check
    check (category in ('kit', 'unit', 'combo'));
end;
$$;

notify pgrst, 'reload schema';

commit;
