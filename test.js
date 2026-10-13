// Run with: node test.js
const assert = require("assert");
const { hexToHue, hslToHex, contrast, textColor, generate } = require("./color.js");
assert.strictEqual(hslToHex(0, 100, 50), "#FF0000");
assert.strictEqual(hslToHex(120, 100, 50), "#00FF00");
assert.strictEqual(hslToHex(240, 100, 50), "#0000FF");
assert.strictEqual(contrast("#000000", "#FFFFFF").toFixed(0), "21");         // WCAG maximum
assert.strictEqual(textColor("#111111"), "#FFFFFF");
assert.strictEqual(textColor("#FAFAFA"), "#000000");
for (const mode of ["analogous", "complementary", "triadic", "monochrome"]) {
  const p = generate(mode);
  assert.strictEqual(p.length, 5);
  p.forEach(c => assert.match(c, /^#[0-9A-F]{6}$/));
}
let s = 1; const rng = () => (s = (s * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 500; i++) generate("triadic", rng).forEach(c =>
  assert.ok(Math.max(contrast(c, "#FFFFFF"), contrast(c, "#000000")) >= 3, c));   // always some readable text
assert.ok(Math.abs(hexToHue("#00FF00") - 120) < 1);
// a palette built around a locked color keeps that color's hue at its position
const anchored = generate("analogous", rng, { index: 2, hex: "#2E86C1" });
const diff = Math.abs(hexToHue(anchored[2]) - hexToHue("#2E86C1"));
assert.ok(Math.min(diff, 360 - diff) < 3, "anchored hue should match");
console.log("All 11 tests passed ✓");
