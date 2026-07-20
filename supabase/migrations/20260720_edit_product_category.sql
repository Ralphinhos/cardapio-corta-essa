-- Permite que administradores movam produtos entre Kit, Unidade e Combo.
-- A chave primária não muda, preservando referências de pedidos antigos.

begin;

grant update (category)
  on table public.catalog_products to authenticated;

notify pgrst, 'reload schema';

commit;
