import { test as base, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const types = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

// Optional build-only harness: fulfill compiled files in the browser itself.
// No Vite, FastAPI, Ollama, HTTP server or listening socket is started.
export const test = base.extend({
  page: async ({ page }, use) => {
    if (process.env.VOXAI_STATIC_TEST === "1") {
      await page.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.startsWith("/api/")) {
          await route.fulfill({
            status: 503,
            json: {
              detail: "No live API is used in the static UI test harness.",
            },
          });
          return;
        }
        const relative =
          decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
        const file = path.resolve(dist, relative);
        if (!file.startsWith(path.resolve(dist) + path.sep)) {
          await route.abort();
          return;
        }
        try {
          await route.fulfill({
            body: await readFile(file),
            contentType:
              types[path.extname(file)] || "application/octet-stream",
          });
        } catch {
          await route.fulfill({ status: 404, body: "Asset not found" });
        }
      });
    }
    await use(page);
  },
});
export { expect };
