// Search: on-screen keyboard + a results grid, fully D-pad navigable.
// Queries every installed addon's searchable catalogs via Addons.search().
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { DetailScreen } from "./detail.js";
import { createKeyboard } from "../ui/keyboard.js";

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function SearchScreen() {
  const el = document.createElement("div");
  el.className = "screen search-screen";
  el.innerHTML = `
    <h2 class="search-title">Search</h2>
    <div class="search-query"><span class="sq-text"></span><span class="sq-caret">|</span></div>
    <div class="search-kb"></div>
    <div class="search-results grid"></div>
    <div class="status"></div>
  `;
  const qText = el.querySelector(".sq-text");
  const kbWrap = el.querySelector(".search-kb");
  const results = el.querySelector(".search-results");
  const status = el.querySelector(".status");

  let query = "";
  let debounce = 0;

  const render = () => { qText.textContent = query; };
  const schedule = () => { clearTimeout(debounce); debounce = setTimeout(runSearch, 350); };

  async function runSearch() {
    const q = query.trim();
    results.innerHTML = "";
    if (q.length < 2) { status.textContent = q.length ? "Keep typing…" : ""; return; }
    status.textContent = "Searching…";
    try {
      const metas = await Addons.search(q);
      status.textContent = metas.length ? "" : `No results for “${q}”.`;
      metas.forEach((meta) => {
        const card = document.createElement("button");
        card.className = "focusable card";
        card.innerHTML = meta.poster
          ? `<img class="poster" src="${meta.poster}" alt="" loading="lazy" />
             <span class="card-title">${escapeHtml(meta.name)}</span>`
          : `<span class="poster poster-empty"></span>
             <span class="card-title">${escapeHtml(meta.name)}</span>`;
        card.onclick = () => Router.push(DetailScreen, {
          addon: { baseUrl: meta.addonBaseUrl },
          type: meta.type,
          id: meta.id,
          name: meta.name,
        });
        results.appendChild(card);
      });
    } catch (e) {
      status.textContent = `Search failed: ${e.message}`;
    }
  }

  const keyboard = createKeyboard({
    onInput: (ch) => { query += ch; render(); schedule(); },
    onSpace: () => { query += " "; render(); schedule(); },
    onBackspace: () => { query = query.slice(0, -1); render(); schedule(); },
    onClear: () => { query = ""; render(); results.innerHTML = ""; status.textContent = ""; },
    onSubmit: () => runSearch(),
  });
  kbWrap.appendChild(keyboard);

  return {
    el,
    onEnter() { render(); },
    // Physical / USB keyboard typing (desktop dev + TVs with a keyboard).
    // The on-screen keys still work via click + D-pad Enter.
    onKeyDown(k) {
      if (k.isArrow || k.isEnter || k.isBack || k.isPlayPause) return false; // let nav/back handle
      if (k.key === "Backspace") { query = query.slice(0, -1); render(); schedule(); return true; }
      if (typeof k.key === "string" && k.key.length === 1) { query += k.key; render(); schedule(); return true; }
      return false;
    },
  };
}
