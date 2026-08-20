import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders the optimized catalog shell", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /src="\/images\/gourmet-type\.webp"/);
  assert.match(html, /fetchpriority="high"/i);
  assert.doesNotMatch(html, /src="\/images\/gourmet-type\.png"/);
  assert.match(html, /src="\/images\/logo-transparent\.webp"/);
  assert.match(html, /Grupo VIP/);
  assert.match(html, /class="topbar__club-link"/);
  assert.doesNotMatch(html, /topbar__club-tag/);
  assert.doesNotMatch(html, /top-seller-medal/);
  assert.match(html, /id="tab-combo"/);
  assert.equal(
    (html.match(/class="product-card product-card--/g) ?? []).length,
    6,
    "a primeira página deve renderizar seis produtos",
  );
  assert.match(html, /class="catalog-pagination"/);
});

test("renders the subscription club page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("club-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/clube", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Assinatura Brasa/);
  assert.match(html, /Assinatura Marmitas/);
  assert.match(html, /Assinatura 360°/);
  assert.match(html, /R\$\s*179/);
  assert.match(html, /R\$\s*529/);
  assert.match(html, /R\$\s*679/);
  assert.match(html, /Economize[\s\S]{0,40}R\$\s*7/);
  assert.match(html, /Economize[\s\S]{0,40}R\$\s*69/);
  assert.match(html, /Economize[\s\S]{0,40}R\$\s*105/);
  assert.match(html, /R\$\s*29 abaixo das duas assinaturas separadas/);
  assert.doesNotMatch(html, /Clube Entusiasta/);
  assert.doesNotMatch(html, /Mestre Churrasqueiro/);
  assert.doesNotMatch(html, /Anfitrião Premium/);
  assert.match(html, /Seleção do Mestre/);
  assert.match(html, /somente 40 vagas/);
  assert.match(html, /src="\/images\/mensal-type\.webp"/);
  assert.match(html, /src="\/images\/club-champion-medal\.webp"/);
  assert.match(html, /alt="Plano mais completo"/);
  assert.match(html, /src="\/images\/rotina\/parmegiana-transparent\.webp"/);
  assert.doesNotMatch(html, /src="\/images\/rotina\/parmegiana\.webp"/);
  assert.match(html, /todos os domingos em Poços/);
  assert.match(html, /Frete grátis/);
});

test("renders the Linha Rotina page and its premium value ladder", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("rotina-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/rotina", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Tropeiro Vegano da Casa/);
  assert.match(html, /Tirinhas de Soja Marinadas/);
  assert.match(html, /Parmegiana de Soja/);
  assert.match(html, /Kit 5/);
  assert.match(html, /Kit 20/);
  assert.match(html, /sem renovação automática/i);
  assert.match(html, /MARMITAS GOURMET CONGELADAS - LINHA ROTINA/);
  assert.match(html, /Para dias corridos/);
  assert.match(html, /PRÁTICA E SAUDÁVEL/);
  assert.match(html, /RECEITAS SABOROSAS E ESPECIAIS/);
  assert.match(html, /Frete grátis/);
  assert.doesNotMatch(html, /significa comida de dieta/);
  assert.match(html, /href="\/#cardapio">Brasa<\/a>/);
  assert.match(html, /lucide-flame/);
  assert.match(html, /src="\/images\/rotina\/hero-person\.webp"/);
});
