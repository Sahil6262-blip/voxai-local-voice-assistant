import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (error) => console.log("PAGE ERROR:", error.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE:", msg.text());
});
await page.goto("http://127.0.0.1:5173");
await page.waitForTimeout(1000);
console.log((await page.locator("body").innerText()).slice(0, 3000));
await page.screenshot({ path: "test-results/inspection.png", fullPage: true });
await page
  .getByRole("checkbox", { name: "Speak responses automatically" })
  .uncheck({ timeout: 5000 });
await page
  .getByRole("textbox", { name: "Message VoxAI" })
  .fill("What is Generative AI?");
page.on("response", (r) => console.log("RESPONSE", r.url(), r.status()));
await page
  .getByRole("button", { name: "Send message", exact: true })
  .click({ timeout: 5000 });
await page.waitForTimeout(5000);
console.log((await page.locator("body").innerText()).slice(-4000));
await browser.close();
