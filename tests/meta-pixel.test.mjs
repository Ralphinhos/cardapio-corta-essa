import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("configures the Meta Pixel behind explicit consent", async () => {
  const source = await readFile(
    new URL("../app/meta-pixel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /214378517891929/);
  assert.match(source, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(source, /fbq\("init", META_PIXEL_ID\)/);
  assert.match(source, /fbq\("track", "PageView"\)/);
  assert.match(source, /storedChoice === "accepted"/);
  assert.match(source, /saveChoice\("rejected"\)/);
  assert.match(source, /usePathname\(\)/);
});
