# Corta Essa! — Cardápio Digital

Cardápio online da **Corta Essa!**, marca de churrasco vegetariano com identidade visual “Brasa Editorial”.

O projeto apresenta produtos nas categorias **Kit** e **Unidade**, permite montar um pedido para entrega, registra o pedido no Supabase e abre o WhatsApp com a confirmação preenchida.

## Funcionalidades

- hero editorial responsivo com imagens reais dos produtos;
- abas acessíveis para Kit e Unidade;
- cards com sabores, pesos e preços;
- carrinho com controle de quantidades;
- formulário exclusivo para entrega;
- registro seguro de pedidos no Supabase;
- confirmação final pelo WhatsApp;
- fallback para pedido direto pelo WhatsApp quando o Supabase não está ativado;
- suporte a `prefers-reduced-motion`.

## Tecnologias

- Next.js 16;
- React 19;
- TypeScript;
- Supabase;
- Lucide React;
- Vercel para hospedagem Next.js;
- Vinext/Cloudflare para a hospedagem alternativa atual.

## Rodando localmente

Requisitos: Node.js `>=22.13.0` e npm.

```bash
npm install
```

Copie `.env.example` para `.env.local` e configure:

```dotenv
NEXT_PUBLIC_ORDERING_ENABLED=true
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SECRET_KEY=sb_secret_SUA_CHAVE
NEXT_PUBLIC_WHATSAPP_NUMBER=5535910222015
```

Nunca publique `.env.local` ou a chave `SUPABASE_SECRET_KEY`.

```bash
npm run dev:vercel
```

Acesse `http://localhost:3000`.

## Configurando o Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
4. Confirme a criação de `catalog_products`, `orders` e `order_items`.
5. Configure as variáveis de ambiente no servidor.

O banco utiliza RLS e a função protegida `create_server_order`. O preço final é recalculado com os valores oficiais do banco, sem confiar nos valores enviados pelo navegador.

## Publicando na Vercel

O projeto já contém `vercel.json` e o script `build:vercel`.

1. Importe este repositório na Vercel.
2. Selecione Next.js.
3. Cadastre as variáveis do `.env.example`.
4. Execute o deploy.
5. Faça um pedido de teste e confira o registro no Supabase.

O passo a passo completo está em [`DEPLOY_VERCEL_SUPABASE.md`](DEPLOY_VERCEL_SUPABASE.md).

## Scripts principais

```bash
npm run dev:vercel      # desenvolvimento Next.js
npm run build:vercel    # build usado pela Vercel
npm run start:vercel    # inicia o build Next.js
npm run lint            # análise estática
npm test                # build e testes do ambiente Sites
```

## Fluxo do pedido

1. O cliente escolhe Kit ou Unidade.
2. Adiciona produtos e quantidades.
3. Informa os dados de entrega.
4. A aplicação registra o pedido no Supabase.
5. O cliente recebe um código como `CE-000001`.
6. O WhatsApp abre com o resumo para confirmação.

O envio da mensagem não é automático: o cliente revisa e toca em **Enviar** no WhatsApp.

## Observações

- atendimento somente por entrega;
- taxa e prazo de entrega são confirmados no WhatsApp;
- a Divine Flour é pronta para servir;
- imagens do cardápio são ilustrativas;
- produtos e preços devem ser atualizados em `lib/catalog.ts` e em `catalog_products` no Supabase.