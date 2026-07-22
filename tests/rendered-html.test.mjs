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
  assert.match(html, /Clube Entusiasta/);
  assert.match(html, /Mestre Churrasqueiro/);
  assert.match(html, /Anfitrião Premium/);
  assert.match(html, /Seleção do Mestre/);
  assert.match(html, /somente 40 vagas/);
});
