# Painel administrativo, Supabase Auth e estoque

Este guia ativa o painel `/admin`, a autenticação por e-mail e senha, a gestão de
estoque e os destaques do cardápio.

## 1. Atualizar o banco

Para um Supabase que já recebeu o `supabase/schema.sql` anteriormente:

1. abra **SQL Editor → New query**;
2. copie todo o conteúdo de
   `supabase/migrations/20260720_admin_inventory.sql`;
3. cole no editor e clique em **Run**;
4. confirme que a execução terminou sem erro.

Em um projeto Supabase novo, execute somente o `supabase/schema.sql` atualizado,
pois ele já contém a mesma estrutura.

A migration:

- adiciona `stock_quantity` e `is_top_seller` em `catalog_products`;
- cria a allowlist privada `admin_users`;
- libera somente leitura pública do catálogo;
- permite atualizar estoque/destaque apenas ao usuário autenticado presente na
  allowlist;
- valida e decrementa o estoque dentro da transação do pedido.

Os produtos existentes começam com estoque `0` por segurança. Depois do deploy,
informe as quantidades reais pelo painel antes de divulgar o cardápio.

## 2. Criar o usuário administrador

1. no Supabase, abra **Authentication → Users**;
2. clique em **Add user → Create new user**;
3. informe o e-mail do administrador e uma senha temporária forte;
4. marque a opção para confirmar o e-mail automaticamente, se ela aparecer;
5. conclua a criação.

Não existe cadastro público na interface do site. Mesmo que outra conta seja
criada no Auth, ela não terá permissão de atualização sem estar em
`admin_users`.

## 3. Autorizar somente esse usuário

No **SQL Editor**, substitua o e-mail e execute:

```sql
insert into public.admin_users (user_id)
select id
  from auth.users
 where lower(email) = lower('EMAIL_DO_ADMINISTRADOR')
on conflict (user_id) do nothing;
```

Confirme a associação sem expor dados ao cliente:

```sql
select au.email, ad.created_at
  from public.admin_users ad
  join auth.users au on au.id = ad.user_id;
```

Para revogar o acesso no futuro:

```sql
delete from public.admin_users
 where user_id = (
   select id from auth.users
    where lower(email) = lower('EMAIL_DO_ADMINISTRADOR')
 );
```

Revogar a allowlist bloqueia alterações imediatamente, mesmo que a sessão ainda
esteja aberta.

## 4. Obter a chave pública do Auth

No Supabase, abra **Connect** ou **Project Settings → API Keys** e copie:

- Project URL;
- Publishable key, iniciada por `sb_publishable_`.

A publishable key é feita para uso no navegador e continua limitada pelas
políticas RLS. Ela não substitui nem deve ser confundida com a secret key.

## 5. Variáveis na Vercel

Em **Project → Settings → Environment Variables**, mantenha as variáveis atuais
e adicione:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE
```

O conjunto completo deve conter:

```dotenv
NEXT_PUBLIC_ORDERING_ENABLED=true
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SECRET_KEY=sb_secret_SUA_CHAVE_SECRETA
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
NEXT_PUBLIC_WHATSAPP_NUMBER=5535910222015
```

Cadastre-as em **Production**, **Preview** e **Development**. Nunca use o prefixo
`NEXT_PUBLIC_` na secret key.

Depois de salvar, abra **Deployments**, escolha o último deploy e clique em
**Redeploy**. Variáveis novas não alteram deployments antigos.

## 6. Primeiro acesso

1. abra `https://SEU-DOMINIO/admin/login`;
2. entre com o e-mail e a senha criados no Supabase;
3. configure o estoque real de cada produto;
4. ative os produtos que devem aparecer como “Destaque da casa”;
5. salve cada card alterado;
6. abra o cardápio em outra aba e confirme as mudanças.

O cardápio é renderizado dinamicamente. Um novo acesso já recebe o estoque
atualizado; basta recarregar uma aba que estava aberta.

## 7. Regras operacionais

- `stock_quantity <= 0`: exibe “Fora de estoque” e bloqueia a compra;
- `is_top_seller = true`: prioriza o produto nos três destaques e adiciona a tag;
- ao registrar um pedido, o banco bloqueia as linhas dos produtos, valida o
  saldo e desconta as quantidades atomicamente;
- se duas pessoas tentarem comprar a última unidade, somente o pedido que
  obtiver o estoque primeiro é registrado;
- como a reserva ocorre antes da confirmação no WhatsApp, um pedido cancelado
  exige a reposição manual da quantidade no painel.

## 8. Verificações rápidas

```sql
select key, name, stock_quantity, is_top_seller
  from public.catalog_products
 order by category, name;
```

```sql
select policyname, cmd, roles
  from pg_policies
 where schemaname = 'public'
   and tablename = 'catalog_products';
```

O resultado de políticas deve conter leitura pública e atualização do
administrador autenticado. A restrição final de “somente o irmão” é aplicada
pela função `is_catalog_admin()` consultando a allowlist privada.

## 9. Diagnóstico

### Login volta para a mesma página

Confirme as duas variáveis `NEXT_PUBLIC_SUPABASE_*` na Vercel e faça redeploy.

### “Acesso não autorizado” após login

O usuário existe no Auth, mas seu UUID não está em `public.admin_users`. Execute
o SQL da seção 3 com o e-mail correto.

### Salvar retorna erro de permissão

Execute novamente a migration e confirme as policies com o SQL da seção 8.

### Pedido retorna erro 500

Confirme se `create_server_order` existe em **Database → Functions** e se a URL e
a secret key da Vercel pertencem ao mesmo projeto no qual a migration foi
executada. A rota registra o detalhe técnico nos logs da Vercel sem devolver
informações internas ao cliente.
