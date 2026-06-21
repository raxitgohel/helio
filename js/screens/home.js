// Home: a scrolling "board" of catalog sections. Each installed catalog renders
// a labeled section with a preview slice of posters + a "See all" into the full
// (paginated) catalog. A type filter (All / Movies / Series) narrows the board.
// Addon management lives in Settings, not here.
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { DetailScreen } from "./detail.js";
import { SearchScreen } from "./search.js";
import { CatalogScreen } from "./catalog.js";
import { SettingsScreen } from "./settings.js";
import { makeCard, makeSkeleton } from "../ui/card.js";

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
      <span class="topbar-spacer"></span>
      <button id="search-btn" class="focusable btn">🔍 Search</button>
      <button id="settings-btn" class="focusable btn">⚙ Settings</button>
    </header>
    <div id="filters" class="filters"></div>
    <div id="board" class="board"></div>
    <div id="status" class="status"></div>
  `;

  const filters = el.querySelector("#filters");
  const board = el.querySelector("#board");
  const status = el.querySelector("#status");

  let catalogEntries = []; // [{ addon, catalog }]
  let activeType = "all";
  let lastSig = null; // installed-addon-list signature, to refresh on return

  const setStatus = (t) => { status.textContent = t || ""; };

  const openDetail = (meta, entry) => () => Router.push(DetailScreen, {
    addon: entry.addon,
    type: meta.type || entry.catalog.type,
    id: meta.id,
    name: meta.name,
  });

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

    for (let i = 0; i < PREVIEW_COUNT; i++) grid.appendChild(makeSkeleton());

    try {
      const metas = await Addons.catalog(entry.addon.baseUrl, entry.catalog.type, entry.catalog.id);
      const slice = metas.slice(0, PREVIEW_COUNT);
      if (slice.length === 0) { section.remove(); return; }
      grid.innerHTML = "";
      slice.forEach((meta) => grid.appendChild(makeCard(meta, openDetail(meta, entry))));
    } catch (e) {
      section.remove();
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
    filters.innerHTML = ""; board.innerHTML = "";
    catalogEntries = [];

    const urls = Addons.list();
    if (urls.length === 0) {
      setStatus("No addons yet. Open ⚙ Settings → Addons to add a Stremio addon — Helio ships empty by design.");
      return;
    }

    setStatus("Loading addons…");
    const manifests = [];
    for (const url of urls) {
      try { manifests.push(await Addons.manifest(url)); } catch (e) { /* skip unreachable */ }
    }
    manifests.forEach((m) =>
      (m.catalogs || []).forEach((catalog) => catalogEntries.push({ addon: m, catalog })));

    if (catalogEntries.length === 0) {
      setStatus("Your addons expose no catalogs. Add a catalog addon in ⚙ Settings → Addons.");
      return;
    }
    setStatus("");
    renderFilters();
    renderBoard();
  }

  el.querySelector("#search-btn").onclick = () => Router.push(SearchScreen);
  el.querySelector("#settings-btn").onclick = () => Router.push(SettingsScreen);

  return {
    el,
    onEnter() {
      // (Re)load when first shown, or when the installed-addon list changed
      // since we last rendered (e.g. returning from Settings after adding one).
      const sig = JSON.stringify(Addons.list());
      if (sig !== lastSig) { lastSig = sig; loadAddons(); }
    },
  };
}
