// Color math, no DOM, so it can be tested in Node.
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return "#" + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// WCAG relative luminance and contrast ratio (the accessibility standard for readable text)
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
// Pick white or black text, whichever is more readable on this background
function textColor(bg) {
  return contrast(bg, "#FFFFFF") >= contrast(bg, "#000000") ? "#FFFFFF" : "#000000";
}

// Harmony rules: hue offsets on the color wheel (degrees)
const HARMONIES = {
  analogous:     [0, 25, 50, -25, -50],
  complementary: [0, 180, 15, 195, -15],
  triadic:       [0, 120, 240, 20, 140],
  monochrome:    [0, 0, 0, 0, 0],
};

// Hue (0-360) of a hex color
function hexToHue(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

// anchor = { index, hex } of a locked color: the new palette is built around it so it stays harmonious
function generate(mode = "analogous", rng = Math.random, anchor = null) {
  const base = anchor ? (hexToHue(anchor.hex) - HARMONIES[mode][anchor.index] + 360) % 360 : Math.floor(rng() * 360);
  const sat = 55 + Math.floor(rng() * 30);
  return HARMONIES[mode].map((off, i) => {
    const l = mode === "monochrome" ? 20 + i * 15 : 35 + Math.floor(rng() * 35);
    return hslToHex((base + off + 360) % 360, sat, l);
  });
}

if (typeof module !== "undefined") module.exports = { hexToHue, hslToHex, luminance, contrast, textColor, generate, HARMONIES };
