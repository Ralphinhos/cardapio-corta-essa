-- Exclusão administrativa permanente de produtos sem perder pedidos antigos.

begin;

alter table public.order_items
  alter column product_key drop not null;

alter table public.order_items
  drop constraint if exists order_items_product_key_fkey;

alter table public.order_items
  add constraint order_items_product_key_fkey
  foreign key (product_key)
  references public.catalog_products(key)
  on delete set null;

create or replace function public.delete_catalog_product(p_key text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_image_path text;
begin
  if not public.is_catalog_admin() then
    raise exception 'Acesso administrativo necessário.';
  end if;

  delete from public.catalog_products
   where key = p_key
   returning image_path into v_image_path;

  if not found then
    raise exception 'Produto não encontrado.';
  end if;

  return v_image_path;
end;
$$;

revoke all on function public.delete_catalog_product(text) from public, anon;
grant execute on function public.delete_catalog_product(text) to authenticated;

notify pgrst, 'reload schema';

commit;
