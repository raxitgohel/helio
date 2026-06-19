// Search: platform-adaptive text entry.
//   • Web (mouse + keyboard): a native <input> you just type into.
//   • TV (D-pad): the on-screen keyboard.
// Both feed the same live, debounced search across all installed addons.
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { DetailScreen } from "./detail.js";
import { createKeyboard } from "../ui/keyboard.js";
import { Platform } from "../platform.js";
import { makeCard } from "../ui/card.js";

export async function SearchScreen() {
  const useNativeInput = Platform.isBrowser();

  const el = document.createElement("div");
  el.className = "screen search-screen";
  el.innerHTML = `
    <h2 class="search-title">Search</h2>
    ${useNativeInput
      ? `<input class="search-input" type="text" placeholder="Search movies, shows…" autocomplete="off" spellcheck="false" />`
      : `<div class="search-query"><span class="sq-text"></span><span class="sq-caret">|</span></div>
         <div class="search-kb"></div>`}
    <div class="search-results grid"></div>
    <div class="status"></div>
  `;
  const results = el.querySelector(".search-results");
  const status = el.querySelector(".status");

  let query = "";
  let debounce = 0;
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
        results.appendChild(makeCard(meta, () => Router.push(DetailScreen, {
          addon: { baseUrl: meta.addonBaseUrl },
          type: meta.type,
          id: meta.id,
          name: meta.name,
        })));
      });
    } catch (e) {
      status.textContent = `Search failed: ${e.message}`;
    }
  }

  // ---- Web: native input ----
  if (useNativeInput) {
    const input = el.querySelector(".search-input");
    input.addEventListener("input", () => { query = input.value; schedule(); });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); clearTimeout(debounce); runSearch(); } });
    return {
      el,
      onEnter() { try { input.focus(); } catch (_) {} },
    };
  }

  // ---- TV: on-screen keyboard ----
  const qText = el.querySelector(".sq-text");
  const render = () => { qText.textContent = query; };
  const keyboard = createKeyboard({
    onInput: (ch) => { query += ch; render(); schedule(); },
    onSpace: () => { query += " "; render(); schedule(); },
    onBackspace: () => { query = query.slice(0, -1); render(); schedule(); },
    onClear: () => { query = ""; render(); results.innerHTML = ""; status.textContent = ""; },
    onSubmit: () => runSearch(),
  });
  el.querySelector(".search-kb").appendChild(keyboard);

  return {
    el,
    onEnter() { render(); },
    // Physical / USB keyboard typing on TV (on-screen keys still work via D-pad).
    onKeyDown(k) {
      if (k.isArrow || k.isEnter || k.isBack || k.isPlayPause) return false;
      if (k.key === "Backspace") { query = query.slice(0, -1); render(); schedule(); return true; }
      if (typeof k.key === "string" && k.key.length === 1) { query += k.key; render(); schedule(); return true; }
      return false;
    },
  };
}
