// Home: add/remove Stremio addons + browse their catalogs as a poster grid.
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { DetailScreen } from "./detail.js";
import { SearchScreen } from "./search.js";

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function HomeScreen() {
  const el = document.createElement("div");
  el.className = "screen home-screen";
  el.innerHTML = `
    <header class="topbar">
      <h1 class="logo">Helio</h1>
      <div class="addbar">
        <input id="addon-url" class="addon-input" type="text"
          placeholder="Paste a Stremio addon URL (…/manifest.json) and press Enter" />
        <button id="add-btn" class="focusable btn">Add</button>
      </div>
      <button id="search-btn" class="focusable btn">🔍 Search</button>
    </header>
    <div id="chips" class="chips"></div>
    <div id="tabs" class="tabs"></div>
    <div id="grid" class="grid"></div>
    <div id="status" class="status"></div>
  `;

  const input = el.querySelector("#addon-url");
  const addBtn = el.querySelector("#add-btn");
  const chips = el.querySelector("#chips");
  const tabs = el.querySelector("#tabs");
  const grid = el.querySelector("#grid");
  const status = el.querySelector("#status");

  let catalogEntries = []; // flat list of { addon, catalog }
  let activeIndex = 0;
  let loaded = false;

  const setStatus = (t) => { status.textContent = t || ""; };

  async function loadAddons() {
    chips.innerHTML = ""; tabs.innerHTML = ""; grid.innerHTML = "";
    catalogEntries = [];

    const urls = Addons.list();
    if (urls.length === 0) {
      setStatus("No addons yet. Paste an addon manifest URL above to begin — Helio ships empty by design.");
      return;
    }

    setStatus("Loading addons…");
    const manifests = [];
    for (const url of urls) {
      try {
        const m = await Addons.manifest(url);
        manifests.push(m);
        const chip = document.createElement("div");
        chip.className = "chip";
        chip.textContent = m.name;
        const rm = document.createElement("button");
        rm.className = "focusable chip-remove";
        rm.textContent = "✕";
        rm.title = `Remove ${m.name}`;
        rm.onclick = () => { Addons.remove(m.baseUrl); loadAddons(); };
        chip.appendChild(rm);
        chips.appendChild(chip);
      } catch (e) {
        const chip = document.createElement("div");
        chip.className = "chip chip-error";
        chip.textContent = `${url} (failed)`;
        chips.appendChild(chip);
      }
    }

    manifests.forEach((m) =>
      (m.catalogs || []).forEach((catalog) => catalogEntries.push({ addon: m, catalog })));

    if (catalogEntries.length === 0) {
      setStatus("Addon loaded, but it exposes no catalogs.");
      return;
    }

    catalogEntries.forEach((entry, i) => {
      const tab = document.createElement("button");
      tab.className = "focusable tab";
      tab.textContent = entry.catalog.name;
      tab.onclick = () => { activeIndex = i; renderTabs(); loadCatalog(i); };
      tabs.appendChild(tab);
    });
    renderTabs();
    activeIndex = 0;
    loadCatalog(0);
  }

  function renderTabs() {
    Array.from(tabs.children).forEach((t, i) => t.classList.toggle("active", i === activeIndex));
  }

  async function loadCatalog(i) {
    const entry = catalogEntries[i];
    if (!entry) return;
    grid.innerHTML = "";
    setStatus(`Loading ${entry.catalog.name}…`);
    try {
      const metas = await Addons.catalog(entry.addon.baseUrl, entry.catalog.type, entry.catalog.id);
      setStatus(metas.length ? "" : "Empty catalog.");
      metas.forEach((meta) => {
        const card = document.createElement("button");
        card.className = "focusable card";
        card.innerHTML = meta.poster
          ? `<img class="poster" src="${meta.poster}" alt="" loading="lazy" />
             <span class="card-title">${escapeHtml(meta.name)}</span>`
          : `<span class="poster poster-empty"></span>
             <span class="card-title">${escapeHtml(meta.name)}</span>`;
        card.onclick = () => Router.push(DetailScreen, {
          addon: entry.addon,
          type: meta.type || entry.catalog.type,
          id: meta.id,
          name: meta.name,
        });
        grid.appendChild(card);
      });
    } catch (e) {
      setStatus(`Failed to load catalog: ${e.message}`);
    }
  }

  function submitAdd() {
    const value = input.value.trim();
    if (!value) return;
    if (Addons.add(value)) { input.value = ""; loadAddons(); }
    else setStatus("That addon is already installed, or the URL is invalid.");
  }

  addBtn.onclick = submitAdd;
  el.querySelector("#search-btn").onclick = () => Router.push(SearchScreen);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); submitAdd(); input.blur(); }
  });

  return {
    el,
    onEnter() { if (!loaded) { loaded = true; loadAddons(); } },
  };
}
