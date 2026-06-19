// Home: a scrolling "board" of catalog sections. Each installed catalog renders
// a labeled section with a preview slice of posters + a "See all" into the full
// (paginated) catalog. A type filter (All / Movies / Series) narrows the board.
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { DetailScreen } from "./detail.js";
import { SearchScreen } from "./search.js";
import { CatalogScreen } from "./catalog.js";

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const PREVIEW_COUNT = 12;
const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "movie", label: "Movies" },
  { id: "series", label: "Series" },
];

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
    <div id="filters" class="filters"></div>
    <div id="board" class="board"></div>
    <div id="status" class="status"></div>
  `;

  const input = el.querySelector("#addon-url");
  const addBtn = el.querySelector("#add-btn");
  const chips = el.querySelector("#chips");
  const filters = el.querySelector("#filters");
  const board = el.querySelector("#board");
  const status = el.querySelector("#status");

  let catalogEntries = []; // [{ addon, catalog }]
  let activeType = "all";
  let loaded = false;

  const setStatus = (t) => { status.textContent = t || ""; };

  function makeCard(meta, entry) {
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
    return card;
  }

  async function renderSection(entry) {
    const section = document.createElement("section");
    section.className = "board-section";
    const head = document.createElement("div");
    head.className = "section-head";
    const title = document.createElement("h3");
    title.className = "section-title";
    title.textContent = `${entry.addon.name} · ${entry.catalog.name}`;
    const seeAll = document.createElement("button");
    seeAll.className = "focusable see-all";
    seeAll.textContent = "See all ›";
    seeAll.onclick = () => Router.push(CatalogScreen, { addon: entry.addon, catalog: entry.catalog });
    head.appendChild(title);
    head.appendChild(seeAll);
    const grid = document.createElement("div");
    grid.className = "grid section-grid";
    section.appendChild(head);
    section.appendChild(grid);
    board.appendChild(section);

    try {
      const metas = await Addons.catalog(entry.addon.baseUrl, entry.catalog.type, entry.catalog.id);
      const slice = metas.slice(0, PREVIEW_COUNT);
      if (slice.length === 0) { section.remove(); return; } // hide empty catalogs
      slice.forEach((meta) => grid.appendChild(makeCard(meta, entry)));
    } catch (e) {
      section.remove(); // hide unreachable catalogs
    }
  }

  function renderBoard() {
    board.innerHTML = "";
    const shown = catalogEntries.filter((e) => activeType === "all" || e.catalog.type === activeType);
    shown.forEach((entry) => renderSection(entry));
  }

  function renderFilters() {
    filters.innerHTML = "";
    const present = new Set(catalogEntries.map((e) => e.catalog.type));
    TYPE_FILTERS.filter((f) => f.id === "all" || present.has(f.id)).forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "focusable filter" + (f.id === activeType ? " active" : "");
      btn.textContent = f.label;
      btn.onclick = () => { activeType = f.id; renderFilters(); renderBoard(); };
      filters.appendChild(btn);
    });
  }

  async function loadAddons() {
    chips.innerHTML = ""; filters.innerHTML = ""; board.innerHTML = "";
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
    setStatus("");
    renderFilters();
    renderBoard();
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
