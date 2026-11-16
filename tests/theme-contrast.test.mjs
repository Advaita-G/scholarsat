import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const glossOpacity = Number(css.match(/background: rgb\(255 255 255 \/ ([\d.]+)\);/)[1]);
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)];
const rgb = (hex) => hex.match(/[a-f\d]{2}/gi).map((v) => parseInt(v, 16));
const blend = (fg, bg, alpha) => fg.map((v, i) => v * alpha + bg[i] * (1 - alpha));
const luminance = (color) => color.map((v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
  const [lo, hi] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (hi + 0.05) / (lo + 0.05);
};

function palette(dark, accent) {
  const selectors = [":root", `html[data-accent="${accent}"]`];
  if (dark) selectors.push("html.dark", `html.dark[data-accent="${accent}"]`);
  const tokens = {};
  for (const [, selector, body] of rules) {
    if (!selector.slice(selector.lastIndexOf(";") + 1).split(",").some((s) => selectors.includes(s.trim()))) continue;
    for (const [, name, hex] of body.matchAll(/--([\w-]+):\s*(#[a-f\d]{6});/gi)) {
      tokens[name] = rgb(hex);
    }
  }
  return tokens;
}

test("contrast calculation reference pairs", () => {
  assert.equal(contrast(rgb("#000000"), rgb("#ffffff")), 21);
  assert.equal(contrast(rgb("#76551a"), rgb("#76551a")), 1);
});

test("surfaces use theme tokens and dark variants follow the app theme", () => {
  assert.match(css, /@custom-variant dark \(&:where\(\.dark, \.dark \*\)\);/);
  const src = new URL("../src/", import.meta.url);
  for (const file of readdirSync(src, { recursive: true }).filter((f) => f.endsWith(".tsx"))) {
    const source = readFileSync(new URL(file, src), "utf8");
    assert.doesNotMatch(source, /\bbg-white(?![\w/-])|\bbg-ink text-white\b/, `${file}: use bg-bg for surfaces and bg-inverse for dark fills`);
  }
});

for (const dark of [false, true]) {
  for (const accent of ["red", "gold", "blue", "green", "purple", "rose"]) {
    test(`${dark ? "dark" : "light"}/${accent}: readable text and filled controls`, () => {
      const p = palette(dark, accent);
      const check = (fg, bg, label, minimum = 4.5) => {
        const ratio = contrast(fg, bg);
        assert.ok(ratio >= minimum, `${label}: ${ratio.toFixed(2)}:1 < ${minimum}:1`);
      };
      for (const surface of ["bg", "canvas", "surface", "surface-2"]) {
        for (const ink of ["ink", "ink-2", "muted", "faint", "red"]) {
          check(p[ink], p[surface], `${ink} on ${surface}`);
        }
      }
      for (const [ink, surface] of [
        ["red", "red-50"], ["gold-600", "gold-50"], ["gold-700", "gold-50"],
        ["ok", "ok-50"], ["ok-700", "ok-50"], ["bad", "bad-50"], ["warn", "warn-50"],
      ]) check(p[ink], p[surface], `${ink} badge`);
      check(rgb("#ffffff"), p["red-700"], "sidebar gradient endpoint");
      for (const fill of ["accent-fill", "gold-fill", "ok-fill", "bad-fill", "inverse"]) {
        check(rgb("#ffffff"), p[fill], `white on ${fill}`);
        check(blend(rgb("#ffffff"), p[fill], 0.75), p[fill], `secondary white on ${fill}`);
        // The button gloss covers the upper half, including text; hover brightens both.
        const gloss = blend(rgb("#ffffff"), p[fill], glossOpacity).map((v) => Math.min(255, v * 1.1));
        check(rgb("#ffffff"), gloss, `gloss + hover on ${fill}`);
      }
    });
  }
}
