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
      assert.equal(await page.getByText("From the question bank", {exact: false}).count(), 0);
      assert.ok((await page.locator("#passage-title").evaluate(el => getComputedStyle(el).fontFamily)).includes("Mona Sans"));
      const pathOffsets = () => page.locator(".path-ink").evaluateAll(lines => lines.map(line => Number(line.style.strokeDashoffset)));
      const pathStart = await pathOffsets();
      const plate = page.locator(".exposure-origin figure").last();
      const transform = () => plate.evaluate(el => getComputedStyle(el).transform);
      const before = await transform();
      const scrub = page.getByRole("slider", {name:"Explore ten nights"});
      const reading = page.locator(".phase-readout");
      const initial = await reading.innerText();
      assert.match(initial, /03 Jan.*14\.6% lit/i);
      const sprite = page.locator(".lunar-frame").first();
      const firstTile = await sprite.evaluate(el => getComputedStyle(el).backgroundPosition);
      await page.evaluate(() => scrollTo(0, innerHeight * .5));
      await settle(page);
      assert.equal((await reading.innerText()) === initial, reducedMotion === "reduce");
      assert.equal((await sprite.evaluate(el => getComputedStyle(el).backgroundPosition)) === firstTile, reducedMotion === "reduce");
      if (reducedMotion !== "reduce") {
        assert.ok(Math.abs((await page.locator(".atlas-stage").boundingBox()).y) < 2);
        await page.evaluate(() => {
          const cover = document.querySelector(".atlas-cover").getBoundingClientRect();
          const stage = document.querySelector(".atlas-stage").getBoundingClientRect();
          scrollTo(0, scrollY + cover.bottom - stage.height * .5);
        });
        await settle(page);
        assert.notEqual(await transform(), before);
      }
      if (reducedMotion !== "reduce") assert.ok((await pathOffsets())[0] < pathStart[0]);
      await page.evaluate(() => scrollTo(0,0));
      await settle(page);
      assert.equal(await transform(), before);
      assert.deepEqual(await pathOffsets(), pathStart);
      assert.equal(await reading.innerText(), initial);
      await scrub.focus();
      await page.keyboard.press("End");
      await settle(page);
      assert.match(await reading.innerText(), /13 Jan.*99\.6% lit/i);
      await page.keyboard.press("Home");
      await settle(page);
      assert.equal(await reading.innerText(), initial);

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
      await page.getByRole("navigation",{name:"Study options"}).getByRole("link",{name:"Mock tests"}).click();
      await page.getByRole("button",{name:"Math Module 2"}).click();
      assert.equal(await page.locator(".timer-display strong").innerText(), "35");
      assert.match(await page.locator(".module-detail").innerText(),/22 questions · 35 minutes/);
      await page.getByRole("navigation",{name:"Study options"}).getByRole("link",{name:"Study tools"}).click();
      await page.getByRole("link",{name:/Retry questions you missed/}).waitFor();
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await settle(page);
      assert.deepEqual(await pathOffsets(), [0,0,0,0,0,0]);
      const entry = page.getByRole("link",{name:"Open the question bank"});
      assert.equal(await entry.getAttribute("href"), "/practice");
      if (reducedMotion !== "reduce") {
        assert.ok(await page.evaluate(() => {
          const tip = document.querySelector(".study-path circle").getBoundingClientRect();
          const port = document.querySelector(".entry-port").getBoundingClientRect();
          return Math.hypot(tip.x + tip.width/2 - port.x - port.width/2, tip.y + tip.height/2 - port.y - port.height/2) < 2;
        }), "The final point of the path must meet the product entry");
      }
      await entry.click();
      await page.waitForURL("**/practice");
      await page.getByRole("heading", {name: "Question bank", exact: true}).waitFor();
      await page.goBack();
      await page.getByRole("navigation",{name:"Study options"}).getByRole("link",{name:"Practice sets"}).click();
      await page.locator(".subject-choices button").last().click();
      await page.getByLabel("Choose a skill").selectOption("Transitions");
      assert.match(await page.locator(".set-start").getAttribute("href"), /section=rw&skill=Transitions&limit=5/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const chosenEntry = page.locator(".journey-entry").getByRole("link", {name:"Start my set"});
      assert.equal(await chosenEntry.getAttribute("href"), await page.locator(".set-start").getAttribute("href"));
      assert.match(await page.locator(".journey-entry p").innerText(), /5-question set on Transitions/);
      await chosenEntry.click();
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
