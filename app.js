const state = { colors: [], locked: [false, false, false, false, false] };
const $ = id => document.getElementById(id);

function render() {
  $("palette").innerHTML = state.colors.map((hex, i) => {
    const fg = textColor(hex), ratio = Math.max(contrast(hex, "#FFFFFF"), contrast(hex, "#000000"));
    return `<section class="swatch" style="background:${hex};color:${fg}" data-i="${i}">
      <button class="lock${state.locked[i] ? " on" : ""}" data-i="${i}" title="Lock">${state.locked[i] ? "🔒 Locked" : "🔓"}</button>
      <div class="hex">${hex}</div>
      <div class="meta">${fg === "#FFFFFF" ? "White" : "Black"} text · ${ratio.toFixed(1)}:1 ${ratio >= 4.5 ? "✓ AA" : "⚠"}</div>
    </section>`;
  }).join("");
}

function regenerate() {
  const i = state.locked.findIndex((l, k) => l && state.colors[k]);
  const fresh = generate($("mode").value, Math.random, i >= 0 ? { index: i, hex: state.colors[i] } : null);
  state.colors = fresh.map((c, i) => (state.locked[i] && state.colors[i]) || c);
  render();
}

function toast(msg) {
  $("toast").textContent = msg;
  clearTimeout(toast.t); toast.t = setTimeout(() => ($("toast").textContent = ""), 1500);
}
const copy = text => navigator.clipboard?.writeText(text).catch(() => {});

$("palette").addEventListener("click", e => {
  const lock = e.target.closest(".lock");
  if (lock) { const i = +lock.dataset.i; state.locked[i] = !state.locked[i]; return render(); }
  const sw = e.target.closest(".swatch");
  if (sw) { copy(state.colors[sw.dataset.i]); toast(`Copied ${state.colors[sw.dataset.i]}`); }
});
$("gen").addEventListener("click", regenerate);
$("mode").addEventListener("change", regenerate);
$("export").addEventListener("click", () => {
  copy(":root {\n" + state.colors.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n") + "\n}");
  toast("Copied CSS variables");
});
document.addEventListener("keydown", e => {
  if (e.code === "Space" && e.target.tagName !== "SELECT") { e.preventDefault(); regenerate(); }
});
regenerate();
