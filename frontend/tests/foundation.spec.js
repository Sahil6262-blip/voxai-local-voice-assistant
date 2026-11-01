import { test, expect } from "@playwright/test";

test("real browser text question reaches local Qwen and displays answer", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.getByRole("checkbox", {
    name: "Speak responses automatically",
  });
  if (await toggle.count()) await toggle.uncheck();
  await page
    .getByRole("textbox", { name: "Message VoxAI" })
    .fill("What is Generative AI? Answer in two sentences.");
  const reply = page.waitForResponse(
    (r) => r.url().endsWith("/api/chat") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Send message", exact: true })
    .or(page.getByRole("button", { name: "Send", exact: true }))
    .click();
  const response = await reply;
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.model).toBe("qwen2.5:3b");
  expect(body.answer.length).toBeGreaterThan(20);
  const answer = page.getByTestId("assistant-message").last();
  await expect(answer).toBeVisible();
  expect((await answer.innerText()).length).toBeGreaterThan(20);
});

test("real chat carries context to Qwen and clear resets it", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("checkbox", { name: "Speak responses automatically" })
    .uncheck();
  async function ask(message) {
    await page.getByRole("textbox", { name: "Message VoxAI" }).fill(message);
    const response = page.waitForResponse((r) => r.url().endsWith("/api/chat"));
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    return (await response).json();
  }
  await ask("Remember that my project codename is Cobalt. Reply briefly.");
  const followup = await ask("What is my project codename?");
  expect(followup.context_messages).toBe(2);
  expect(followup.answer.toLowerCase()).toContain("cobalt");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  const fresh = await ask("Hello.");
  expect(fresh.context_messages).toBe(0);
});
