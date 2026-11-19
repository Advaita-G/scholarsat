// Run against the local build with Playwright on NODE_PATH and Chrome installed.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const url = process.env.PREVIEW_URL ?? "http://127.0.0.1:3822/";
async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function verify() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const [width, height, reducedMotion] of [
      [1512, 862, "no-preference"], [1920, 1200, "no-preference"], [390, 844, "no-preference"], [320, 650, "reduce"],
    ]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(url);
      await page.locator(".atlas[data-motion]").waitFor();
      await page.evaluate(() => Promise.all([document.fonts.ready, ...Array.from(document.images, image => image.decode())]));
      assert.match(await page.getByRole("heading", { level: 1 }).innerText(), /Reading\s+the Moon/);
      const plate = page.locator(".exposure-origin figure").last();
      const transform = () => plate.evaluate(el => getComputedStyle(el).transform);
      const before = await transform();
      await page.evaluate(() => scrollTo(0, innerHeight * .5));
      await settle(page);
      assert.equal((await transform()) === before, reducedMotion === "reduce");
      await page.evaluate(() => scrollTo(0,0));
      await settle(page);
      assert.equal(await transform(), before);

      await page.getByRole("link", { name: "Enter the passage" }).click();
      await settle(page);
      if (reducedMotion !== "reduce") {
        assert.ok(await page.evaluate(() =>
          Array.from(document.querySelectorAll(".exposure-origin figure")).every((frame, i) => {
            const a = frame.getBoundingClientRect(), b = document.querySelectorAll(".archive-slot")[i].getBoundingClientRect();
            return Math.abs(a.x-b.x) < 2 && Math.abs(a.y-b.y) < 2 && Math.abs(a.width-b.width) < 2;
          })), "All four moving frames should land in their own date slots");
      }
      const contrast = page.getByRole("button", {name:"By contrast,"});
      await contrast.focus();
      assert.equal(await page.locator(".insertion").innerText(),"By contrast,");
      await page.keyboard.press("Enter");
      await page.getByText("Try another transition.").waitFor();
      await page.getByRole("button", {name:"For example,"}).click();
      await page.getByText("Exactly.").waitFor();
      assert.equal(await page.locator(".insertion").innerText(),"For example,");
      assert.ok(await page.getByRole("link",{name:"Practice five more transitions"}).isVisible());
      await page.getByRole("tab",{name:"Mock tests"}).click();
      await page.getByRole("button",{name:"Math Module 2"}).click();
      assert.match(await page.locator(".module-detail").innerText(),/22 questions · 35 minutes/);
      await page.getByRole("tab",{name:"Mock tests"}).focus();
      await page.keyboard.press("ArrowRight");
      await page.getByRole("link",{name:/Retry questions you missed/}).waitFor();
      await page.getByRole("tab",{name:"Practice sets"}).click();
      await page.locator(".subject-choices button").last().click();
      await page.getByLabel("Choose a skill").selectOption("Transitions");
      assert.match(await page.locator(".set-start").getAttribute("href"), /section=rw&skill=Transitions&limit=5/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator(".set-start").click();
      await page.getByText("Question 1 of 5",{exact:true}).first().waitFor();
      await page.locator(".practice-player fieldset label").first().click();
      await page.getByRole("button",{name:"Check",exact:true}).click();
      await page.locator(".practice-player [role=status]").first().waitFor();
      assert.deepEqual(errors, []);
      console.log(`${width}×${height} · ${reducedMotion} · passage, motion, feedback, mock modules, study tools and graded set passed`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
verify().catch(error => { console.error(error); process.exitCode = 1; });
