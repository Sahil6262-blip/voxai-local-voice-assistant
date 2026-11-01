import { test, expect } from "./static-fixture";

// Browser-contract tests use explicit test doubles. The foundation suite uses real Qwen.
async function setup(page, { voice = true, synthesis = true } = {}) {
  await page.addInitScript(
    ({ voice, synthesis }) => {
      window.testVoice = { stops: 0, aborts: 0, spoken: [], cancels: 0 };
      class Recognition {
        start() {
          window.testVoice.recognition = this;
          this.onstart?.();
        }
        stop() {
          window.testVoice.stops++;
        }
        abort() {
          window.testVoice.aborts++;
        }
      }
      Object.defineProperty(window, "SpeechRecognition", {
        value: voice ? Recognition : undefined,
        configurable: true,
      });
      Object.defineProperty(window, "webkitSpeechRecognition", {
        value: undefined,
        configurable: true,
      });
      if (synthesis) {
        class Utterance {
          constructor(text) {
            this.text = text;
          }
        }
        Object.defineProperty(window, "SpeechSynthesisUtterance", {
          value: Utterance,
          configurable: true,
        });
        Object.defineProperty(window, "speechSynthesis", {
          value: {
            getVoices: () => [
              {
                name: "Test English",
                lang: "en-US",
                voiceURI: "test",
                localService: true,
              },
            ],
            addEventListener() {},
            removeEventListener() {},
            cancel() {
              window.testVoice.cancels++;
            },
            speak(utterance) {
              window.testVoice.spoken.push(utterance.text);
              window.testVoice.utterance = utterance;
              utterance.onstart?.();
            },
          },
          configurable: true,
        });
      } else {
        delete window.speechSynthesis;
        delete window.SpeechSynthesisUtterance;
      }
    },
    { voice, synthesis },
  );
  await page.route("**/api/health", (route) =>
    route.fulfill({
      json: {
        status: "connected",
        model: "qwen2.5:3b",
        backend: "ok",
        ollama_connected: true,
        model_available: true,
      },
    }),
  );
  const requests = [];
  await page.route("**/api/chat", (route) => {
    requests.push(route.request().postDataJSON());
    return route.fulfill({
      json: {
        answer:
          'A test response with **formatting**.\n\n```python\nprint("hello")\n```',
        elapsed_ms: 1234,
        model: "qwen2.5:3b",
        status: "success",
        context_messages: requests.at(-1).history.length,
      },
    });
  });
  await page.goto("/");
  await expect(page.getByText("Local model connected")).toBeVisible();
  return requests;
}

async function send(page, text) {
  await page.getByRole("textbox", { name: "Message VoxAI" }).fill(text);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByTestId("assistant-message").last()).toBeVisible();
}

test("mode, settings, markdown, memory and clear", async ({ page }) => {
  const requests = await setup(page);
  await page
    .getByRole("checkbox", { name: "Speak responses automatically" })
    .uncheck();
  await page.getByRole("button", { name: "Educational Learn" }).click();
  await page.getByRole("button", { name: "Open settings" }).click();
  await page.getByLabel("Maximum response tokens").selectOption("1024");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await send(page, "Explain Transformers");
  expect(requests[0].mode).toBe("educational");
  expect(requests[0].settings.max_tokens).toBe(1024);
  await expect(page.locator("pre code")).toHaveText('print("hello")\n');
  await send(page, "Tell me more");
  expect(requests[1].history.map((m) => m.role)).toEqual(["user", "assistant"]);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByTestId("assistant-message")).toHaveCount(0);
  await send(page, "Fresh start");
  expect(requests[2].history).toEqual([]);
});

test("final speech events submit only once; replay and stop do not overlap", async ({
  page,
}) => {
  const requests = await setup(page);
  await page.getByRole("button", { name: "Start listening" }).click();
  await expect(page.locator(".orb-scene")).toHaveClass(/listening/);
  await page.evaluate(() => {
    const recognition = window.testVoice.recognition;
    const result = [{ transcript: "What is Generative AI?" }];
    result.isFinal = true;
    recognition.onresult({ results: [result] });
    recognition.onresult({ results: [result] });
    const end = recognition.onend;
    end();
    end();
  });
  await expect(page.getByTestId("assistant-message")).toHaveCount(1);
  expect(requests).toHaveLength(1);
  await expect(page.locator(".orb-scene")).toHaveClass(/speaking/);
  await page.getByRole("button", { name: "Stop speaking" }).click();
  await expect(page.locator(".orb-scene")).toHaveClass(/idle/);
  await page.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(page.locator(".orb-scene")).toHaveClass(/speaking/);
  await page.getByRole("button", { name: "Start listening" }).click();
  await expect(page.locator(".orb-scene")).toHaveClass(/listening/);
  expect(await page.evaluate(() => window.testVoice.spoken.length)).toBe(2);
  await page.getByRole("button", { name: "Cancel listening" }).click();
  await expect(page.locator(".orb-scene")).toHaveClass(/idle/);
  expect(requests).toHaveLength(1);
});

for (const error of ["not-allowed", "no-speech", "network"]) {
  test(`speech ${error} gives usable text fallback`, async ({ page }) => {
    const requests = await setup(page);
    await page.getByRole("button", { name: "Start listening" }).click();
    await page.evaluate((error) => {
      const r = window.testVoice.recognition;
      r.onerror({ error });
      r.onend();
    }, error);
    await expect(page.getByRole("alert")).toBeVisible();
    expect(requests).toHaveLength(0);
    await send(page, "Typed fallback");
    expect(requests).toHaveLength(1);
  });
}

test("unsupported speech APIs keep text usable", async ({ page }) => {
  await setup(page, { voice: false, synthesis: false });
  await expect(
    page.getByRole("button", { name: "Start listening" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Speech recognition is unavailable", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("Speech playback is unavailable", { exact: false }),
  ).toBeVisible();
  await send(page, "Text only");
});

test("offline health and failed request preserve typed retry", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/health", (route) => route.abort());
  await page.getByRole("button", { name: "Refresh connection status" }).click();
  await expect(
    page.getByText("Connection offline", { exact: true }),
  ).toBeVisible();
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 503,
      json: { detail: "Start Ollama and ensure qwen2.5:3b is installed." },
    }),
  );
  await page.getByRole("textbox", { name: "Message VoxAI" }).fill("Retry me");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Start Ollama");
  await expect(
    page.getByRole("textbox", { name: "Message VoxAI" }),
  ).toHaveValue("Retry me");
});

test("clear during generation discards late response", async ({ page }) => {
  await setup(page);
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/api/chat", async (route) => {
    await pending;
    try {
      await route.fulfill({ json: { answer: "Late answer", elapsed_ms: 10 } });
    } catch {
      /* fetch was canceled */
    }
  });
  await page.getByRole("textbox", { name: "Message VoxAI" }).fill("Pending");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".orb-scene")).toHaveClass(/thinking/);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  release();
  await expect(page.getByTestId("assistant-message")).toHaveCount(0);
  await expect(page.locator(".orb-scene")).toHaveClass(/idle/);
});

test("desktop, tablet and mobile fit with accessible settings", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await setup(page);
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 820, height: 1180 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `test-results/voxai-${viewport.width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "Open settings" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("studio navigation, theme preference and explore starters work", async ({
  page,
}) => {
  const requests = await setup(page);
  await page.getByRole("button", { name: "Switch to evening theme" }).click();
  await expect(page.locator(".app-shell")).toHaveClass(/theme-evening/);
  await page.screenshot({
    path: "test-results/voxai-evening.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveClass(/theme-evening/);
  await page.getByRole("button", { name: "Switch to daylight theme" }).click();
  await page.getByRole("button", { name: "Voice space", exact: true }).click();
  await expect(page.locator(".conversation-panel")).toBeHidden();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(page.locator(".conversation-panel")).toBeVisible();
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Where shall we start?" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "A little clarity Explain Generative AI in simple words.",
    })
    .click();
  await expect(page.getByTestId("assistant-message")).toHaveCount(1);
  expect(requests[0].message).toBe("Explain Generative AI in simple words.");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("individual answers can be copied and read aloud", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await setup(page);
  await page
    .getByRole("checkbox", { name: "Speak responses automatically" })
    .uncheck();
  await send(page, "A question");
  await page.getByRole("button", { name: "Copy answer", exact: true }).click();
  await expect(page.getByText("Copied", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "A test response",
  );
  await page
    .getByRole("button", { name: "Read this answer aloud", exact: true })
    .click();
  await expect(page.locator(".orb-scene")).toHaveClass(/speaking/);
  await page.screenshot({
    path: "test-results/voxai-conversation.png",
    fullPage: true,
    animations: "disabled",
  });
});
