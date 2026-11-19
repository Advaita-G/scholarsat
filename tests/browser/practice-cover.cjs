// Run against the local preview with Playwright available on NODE_PATH and Chrome installed.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

async function verify() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const [width, height, reducedMotion] of [
      [1440, 900, "no-preference"],
      [390, 844, "no-preference"],
      [320, 650, "reduce"],
    ]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
      await page.goto(process.env.PREVIEW_URL ?? "http://127.0.0.1:3822/");
      await page.evaluate(() => document.fonts.ready);
      const questionTop = await page.locator("#sample").evaluate(el => el.getBoundingClientRect().top);
      assert.ok(questionTop >= height - 1, "The cover should precede the first question.");
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));

      const trace = page.locator(".pencil-plot > path[stroke-linecap='round']");
      await page.waitForTimeout(1700); // Allow the entrance to settle before checking scroll alone.
      const before = await trace.getAttribute("d");
      await page.evaluate(() => window.scrollTo(0, 250));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      assert.equal(await trace.getAttribute("d") === before, reducedMotion === "reduce");

      await page.getByRole("link", { name: "Try a question" }).click();
      await page.locator(".exam-answers button").first().click();
      await page.locator(".exam-feedback strong").waitFor();
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

verify().catch(error => { console.error(error); process.exitCode = 1; });
