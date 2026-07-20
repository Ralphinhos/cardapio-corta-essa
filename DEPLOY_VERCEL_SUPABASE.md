# Publicação na Vercel + pedidos no Supabase

Este projeto está preparado para funcionar de duas formas:

- sem configuração do Supabase: mantém os links atuais de pedido direto pelo WhatsApp;
- com o pedido online ativado: o cliente adiciona produtos, informa o endereço de entrega, o pedido é registrado no Supabase e só então a confirmação é aberta no WhatsApp.

O atendimento implementado é exclusivamente por entrega. Não há retirada, pagamento online ou envio automático de mensagem.

## Antes de começar: Vercel gratuita e uso comercial

O plano Hobby da Vercel custa zero, mas a própria página de preços o posiciona para uso pessoal e não comercial. Como este cardápio recebe pedidos de um negócio, use o Hobby para desenvolvimento e homologação e confira os termos vigentes antes de mantê-lo como hospedagem comercial. Para produção, pode ser necessário o plano Pro.

Referência: [planos oficiais da Vercel](https://vercel.com/pricing).

O Supabase oferece um plano gratuito adequado para começar e testar o volume inicial. Limites e política podem mudar; confirme-os no painel antes da publicação definitiva.

## Como o pedido funciona

1. O cliente escolhe produtos nas abas **Kit** ou **Unidade**.
2. Os botões **Adicionar** montam o pedido no navegador.
3. O cliente informa nome, WhatsApp e endereço de entrega.
4. O navegador envia o pedido para `POST /api/orders` na aplicação.
5. A função da Vercel usa uma chave secreta, disponível somente no servidor, para chamar o Supabase.
6. O banco consulta os preços oficiais, grava `orders` e `order_items` e devolve um código como `CE-000001`.
7. A página cria uma mensagem com o código, itens, total e endereço e abre o WhatsApp para o cliente confirmar.

O WhatsApp não envia a mensagem sozinho: o cliente ainda precisa tocar em **Enviar**. Isso mantém o fluxo simples e evita depender da API paga do WhatsApp Business neste primeiro momento.

## 1. Criar o projeto no Supabase

1. Acesse [Supabase](https://supabase.com/dashboard) e clique em **New project**.
2. Escolha a organização, informe um nome, crie uma senha forte para o banco e selecione a região mais próxima dos clientes.
3. Aguarde o projeto ficar disponível.
4. No menu lateral, abra **SQL Editor** e clique em **New query**.
5. Copie todo o conteúdo de `supabase/schema.sql`, cole no editor e clique em **Run**.
6. Abra **Table Editor** e confirme a presença de:
   - `catalog_products` com 18 registros;
   - `orders`;
   - `order_items`.

O script habilita RLS nas três tabelas, impede gravação direta pelo navegador e cria a função protegida `create_server_order`. Os preços são recalculados pelo banco; portanto, alterar o valor no navegador não altera o valor registrado.

Referências: [guia de RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) e [funções de banco](https://supabase.com/docs/guides/database/functions).

## 2. Obter as credenciais corretas

No projeto Supabase, abra **Connect** ou **Project Settings → API** e copie:

- **Project URL**: será `SUPABASE_URL`;
- **Secret key** (`sb_secret_...`): será `SUPABASE_SECRET_KEY`.

Não use uma chave secreta em variáveis com prefixo `NEXT_PUBLIC_`. Não cole essa chave no código, no GitHub, em capturas de tela ou em mensagens. Ela deve existir apenas no arquivo local ignorado pelo Git e nas variáveis protegidas da Vercel.

Referência: [chaves de API do Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

## 3. Testar localmente

Na raiz do projeto, crie `.env.local` a partir de `.env.example` e substitua os valores:

```dotenv
NEXT_PUBLIC_ORDERING_ENABLED=true
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SECRET_KEY=sb_secret_SUA_CHAVE_REAL
NEXT_PUBLIC_WHATSAPP_NUMBER=5535910222015
```

Depois execute:

```bash
npm install
npm run dev:vercel
```

Abra `http://localhost:3000` e faça um pedido de teste. Ao concluir:

1. a tela deve mostrar um número `CE-...`;
2. uma linha deve aparecer em `orders` no Supabase;
3. os produtos devem aparecer em `order_items`;
4. o botão final deve abrir o WhatsApp com a mensagem preenchida.

Para validar o mesmo build usado na Vercel:

```bash
npm run build:vercel
npm run start:vercel
```

## 4. Enviar o projeto para o GitHub

Crie um repositório vazio no GitHub. Na raiz desta aplicação, confira as alterações e publique-as:

```bash
git status
git add app lib public/images/gourmet-type.png supabase .env.example .gitignore package.json package-lock.json vercel.json DEPLOY_VERCEL_SUPABASE.md
git commit -m "Adiciona pedidos de entrega com Supabase e publicação Vercel"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Se o repositório já tiver um remoto chamado `origin`, não execute `git remote add origin`; use o remoto existente.

O arquivo `.env.local` não entra no commit porque está ignorado. Confira isso em `git status` antes de publicar.

## 5. Importar na Vercel

1. Acesse [Vercel](https://vercel.com/new) e conecte a conta do GitHub.
2. Clique em **Import** no repositório.
3. Em **Framework Preset**, selecione **Next.js** caso não seja detectado automaticamente.
4. Mantenha a raiz do projeto como **Root Directory**. Se o código estiver dentro de uma subpasta no repositório, selecione essa subpasta.
5. O comando de build já está definido em `vercel.json` como `npm run build:vercel`.
6. Em **Environment Variables**, cadastre as quatro variáveis abaixo para **Production**, **Preview** e **Development**:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_ORDERING_ENABLED` | `true` |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SECRET_KEY` | chave secreta `sb_secret_...` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5535910222015` |

7. Clique em **Deploy**.

A integração com GitHub cria novos deploys automaticamente a cada `git push`. Consulte a [documentação oficial de deploy por Git](https://vercel.com/docs/git) e de [variáveis de ambiente](https://vercel.com/docs/environment-variables).

Se alterar qualquer variável depois do primeiro deploy, abra **Deployments** e faça um novo deploy para que o valor seja incorporado à aplicação.

## 6. Teste de produção obrigatório

No domínio fornecido pela Vercel:

1. teste as abas **Kit** e **Unidade**;
2. adicione um kit e uma unidade;
3. aumente, diminua e remova quantidades;
4. preencha um endereço real de teste;
5. confirme que o código `CE-...` aparece;
6. confira as duas tabelas no Supabase;
7. abra o WhatsApp e verifique código, itens, total e endereço;
8. repita o fluxo em um celular;
9. teste um pedido da Divine Flour e confirme que ela aparece como pronta para servir, sem referência à brasa no selo.

Não divulgue o link antes desse teste completo.

## 7. Operação diária no Supabase

No início, os pedidos podem ser administrados diretamente no **Table Editor**:

- `whatsapp_pending`: pedido registrado, aguardando a mensagem do cliente;
- `confirmed`: disponibilidade e entrega confirmadas no WhatsApp;
- `preparing`: em preparo;
- `out_for_delivery`: saiu para entrega;
- `delivered`: entregue;
- `cancelled`: cancelado.

O código mostrado ao cliente corresponde à coluna `order_number`, formatada como `CE-000001`.

O valor de entrega fica para confirmação no WhatsApp. O total salvo inicialmente representa somente os produtos. Isso está explícito no formulário.

## 8. Atualização de produtos e preços

Nesta versão, o catálogo visual está em `lib/catalog.ts` e os preços seguros estão em `catalog_products` no Supabase. Ao alterar produto, peso ou preço:

1. atualize `lib/catalog.ts`;
2. atualize o mesmo registro em `catalog_products` no Supabase;
3. execute `npm run build:vercel`;
4. publique o commit;
5. faça um pedido de teste.

Essa duplicação é intencional neste MVP: a página continua rápida e o banco continua sendo a autoridade no momento de registrar o pedido. Uma fase posterior pode incluir painel administrativo e catálogo totalmente carregado do Supabase.

## 9. Domínio próprio

Para usar um domínio como `cardapio.cortaessa.com.br`:

1. na Vercel, abra **Project → Settings → Domains**;
2. informe o domínio ou subdomínio;
3. copie os registros DNS solicitados;
4. configure-os no provedor onde o domínio foi comprado;
5. aguarde a validação e o certificado HTTPS automático.

## 10. Segurança e próximos reforços

Já implementado:

- chave secreta apenas na rota de servidor;
- RLS habilitado e sem acesso público direto às tabelas;
- preço, disponibilidade e total conferidos pelo banco;
- limites de quantidade e tamanho dos campos;
- campo-armadilha contra robôs simples;
- respostas sem dados pessoais em cache;
- nenhuma credencial dentro do repositório.

Antes de campanhas com tráfego alto, acrescente limitação de requisições e um desafio como Cloudflare Turnstile na rota de pedido. Também vale configurar alertas e revisar o **Security Advisor** do Supabase. Referência: [Security Advisor](https://supabase.com/docs/guides/database/database-advisors).

## 11. Diagnóstico rápido

### “Pedidos online ainda não estão habilitados”

Confirme `NEXT_PUBLIC_ORDERING_ENABLED=true` na Vercel e gere um novo deploy.

### “O serviço de pedidos ainda não foi configurado”

Confirme `SUPABASE_URL` e `SUPABASE_SECRET_KEY`. Nenhuma delas pode ter espaço, aspas extras ou estar cadastrada somente em outro ambiente.

### Erro ao registrar, mas a página abre

Execute novamente `supabase/schema.sql` em um projeto novo ou confirme se a função `create_server_order` aparece em **Database → Functions**.

### Pedido registrado, mas WhatsApp não abre

Confirme que `NEXT_PUBLIC_WHATSAPP_NUMBER` contém somente números, com DDI e DDD. Alguns navegadores bloqueiam nova aba; o cliente pode tocar novamente no botão de confirmação.

### O deploy da Vercel falhou

Abra os logs do deploy, confirme Node.js compatível com o `package.json` e rode `npm run build:vercel` localmente. A Vercel documenta o comportamento de build em [Configure a Build](https://vercel.com/docs/builds/configure-a-build).

## Arquivos envolvidos

- `app/page.tsx`: catálogo, ícones, carrinho e ativação condicional;
- `app/order-cart.tsx`: revisão, formulário de entrega e confirmação;
- `app/api/orders/route.ts`: endpoint seguro executado no servidor;
- `lib/catalog.ts`: produtos, preços visuais e WhatsApp;
- `supabase/schema.sql`: tabelas, RLS, catálogo seguro e função de pedido;
- `vercel.json`: comando de build da Vercel;
- `.env.example`: nomes das variáveis, sem segredos;
- `public/images/gourmet-type.png`: tipografia transparente do hero.

