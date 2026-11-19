// Run against the local build with Playwright on NODE_PATH and Chrome installed.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

async function verify() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const [width, height, reducedMotion] of [
      [1440, 900, "no-preference"], [390, 844, "no-preference"], [320, 650, "reduce"],
    ]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await page.addInitScript(() => {
        // Sample the model-view transform actually sent to the GPU.
        const gl = WebGL2RenderingContext.prototype;
        const locations = new WeakSet();
        const get = gl.getUniformLocation;
        gl.getUniformLocation = function(program, name) {
          const location = get.call(this, program, name);
          if (location && name === "modelViewMatrix") locations.add(location);
          return location;
        };
        const send = gl.uniformMatrix4fv;
        gl.uniformMatrix4fv = function(location, transpose, matrix, ...rest) {
          if (locations.has(location) && this.canvas.isConnected) window.lastModelView = Array.from(matrix).join();
          return send.call(this, location, transpose, matrix, ...rest);
        };
      });
      await page.goto(process.env.PREVIEW_URL ?? "http://127.0.0.1:3822/");
      await page.locator(".type-sculpture[data-rendered]").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(2300);
      const before = await page.evaluate(() => window.lastModelView);
      assert.ok(before, "The type sculpture should render real geometry.");
      assert.ok(await page.locator("#sample").evaluate(el => el.getBoundingClientRect().top >= innerHeight - 1));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.evaluate(() => window.scrollTo(0, 270));
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => window.lastModelView) === before, reducedMotion === "reduce");
      await page.getByRole("link", { name: "Try a question" }).click();
      await page.locator(".exam-answers button").first().click();
      await page.locator(".exam-feedback strong").waitFor();
      await page.getByRole("button", { name: "Next question" }).click();
      await page.getByRole("tab", { name: "Grammar", selected: true }).waitFor();
      await page.getByRole("button", { name: "Next module" }).click();
      await page.getByRole("heading", { name: /Module 2/ }).waitFor();
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

verify().catch(error => { console.error(error); process.exitCode = 1; });
