// Home: a scrolling "board" of catalog sections. Each installed catalog renders
// a labeled section with a preview slice of posters + a "See all" into the full
// (paginated) catalog. A type filter (All / Movies / Series) narrows the board.
// Addon management lives in Settings, not here.
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { DetailScreen } from "./detail.js";
import { SearchScreen } from "./search.js";
import { StreamsScreen } from "./streams.js";
import { CatalogScreen } from "./catalog.js";
import { SettingsScreen } from "./settings.js";
import { PlayerScreen } from "../player.js";
import { makeCard, makeSkeleton } from "../ui/card.js";
import { icon } from "../ui/icons.js";
import { Watchlist } from "../data/watchlist.js";
import { WatchProgress } from "../data/watchProgress.js";

const PREVIEW_COUNT = 20; // horizontal rows show a longer slice
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
      <button id="search-btn" class="focusable btn">${icon("search")}<span>Search</span></button>
      <button id="settings-btn" class="focusable btn">${icon("settings")}<span>Settings</span></button>
    </header>
    <div id="hero" class="hero"></div>
    <div id="personal" class="board personal"></div>
    <div id="filters" class="filters"></div>
    <div id="board" class="board"></div>
    <div id="status" class="status"></div>
  `;

  const hero = el.querySelector("#hero");
  const personal = el.querySelector("#personal");
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

  // ----- shared horizontal row (Netflix-style) with mouse chevrons -----
  function makeRow(titleText, { onSeeAll } = {}) {
    const section = document.createElement("section");
    section.className = "board-section";
    const head = document.createElement("div");
    head.className = "section-head";
    const h = document.createElement("h3");
    h.className = "section-title";
    h.textContent = titleText;
    head.appendChild(h);
    if (onSeeAll) {
      const seeAll = document.createElement("button");
      seeAll.className = "focusable see-all";
      seeAll.innerHTML = `<span>See all</span>${icon("chevronRight", 16)}`;
      seeAll.onclick = onSeeAll;
      head.appendChild(seeAll);
    }
    const wrap = document.createElement("div");
    wrap.className = "row-wrap";
    const row = document.createElement("div");
    row.className = "hrow";
    wrap.appendChild(row);
    // Chevron paddles for mouse users (not focusable — D-pad scrolls by focus).
    [["chevronLeft", -1, "row-nav-left"], ["chevronRight", 1, "row-nav-right"]].forEach(([ic, dir, cls]) => {
      const b = document.createElement("button");
      b.className = `row-nav ${cls}`;
      b.type = "button";
      b.tabIndex = -1;
      b.innerHTML = icon(ic, 20);
      // Instant paging: smooth programmatic scroll is unreliable with scroll-snap
      // (and on TV webviews); snap makes the jump land on card boundaries anyway.
      b.onclick = () => row.scrollBy({ left: dir * row.clientWidth * 0.9 });
      wrap.appendChild(b);
    });
    section.appendChild(head);
    section.appendChild(wrap);
    return { section, row };
  }

  // ----- hero billboard: first item of the first catalog with wide art -----
  async function renderHero() {
    hero.innerHTML = "";
    const entry = catalogEntries[0];
    if (!entry) return;
    try {
      const metas = await Addons.catalog(entry.addon.baseUrl, entry.catalog.type, entry.catalog.id);
      const item = metas.find((x) => x.background || x.poster);
      if (!item) return;
      const type = item.type || entry.catalog.type;
      const art = (item.background || item.poster).replace(/'/g, "%27");
      hero.innerHTML = `
        <div class="hero-bg" style="background-image:url('${art}')"></div>
        <div class="hero-scrim"></div>
        <div class="hero-content">
          <h2 class="hero-title"></h2>
          <p class="hero-desc"></p>
          <div class="hero-actions"></div>
        </div>`;
      hero.querySelector(".hero-title").textContent = item.name;
      hero.querySelector(".hero-desc").textContent = item.description || item.releaseInfo || "";
      const actions = hero.querySelector(".hero-actions");
      const primary = document.createElement("button");
      primary.className = "focusable btn btn-primary";
      primary.innerHTML = `${icon("play", 18)}<span>${type === "movie" ? "Play" : "Episodes"}</span>`;
      primary.onclick = () => type === "movie"
        ? Router.push(StreamsScreen, { type, videoId: item.id, title: item.name, poster: item.poster })
        : Router.push(DetailScreen, { addon: entry.addon, type, id: item.id, name: item.name });
      const more = document.createElement("button");
      more.className = "focusable btn hero-more";
      more.innerHTML = `${icon("info", 18)}<span>More info</span>`;
      more.onclick = () => Router.push(DetailScreen, { addon: entry.addon, type, id: item.id, name: item.name });
      actions.append(primary, more);
    } catch (_) { /* hero is optional; rows still render */ }
  }

  function renderPersonal() {
    personal.innerHTML = "";

    // Continue watching — entries need a saved stream to be resumable in one tap.
    const cw = WatchProgress.list(12).filter((e) => e.stream && (e.stream.url || e.stream.externalUrl));
    if (cw.length) {
      const { section, row: grid } = makeRow("Continue watching");
      cw.forEach((e) => {
        const wrap = document.createElement("div");
        wrap.className = "cw-card";
        const card = makeCard({ name: e.title, poster: e.poster }, () =>
          Router.push(PlayerScreen, { stream: e.stream, type: e.type, videoId: e.id, title: e.title, poster: e.poster }));
        const bar = document.createElement("div");
        bar.className = "cw-bar";
        bar.innerHTML = `<span style="width:${Math.min(100, Math.round((e.t / (e.d || 1)) * 100))}%"></span>`;
        const rm = document.createElement("button");
        rm.className = "focusable cw-remove";
        rm.type = "button";
        rm.innerHTML = icon("close", 13);
        rm.title = "Remove from Continue watching";
        rm.onclick = (ev) => { ev.stopPropagation(); WatchProgress.remove(e.type, e.id); renderPersonal(); };
        wrap.appendChild(card);
        wrap.appendChild(bar);
        wrap.appendChild(rm);
        grid.appendChild(wrap);
      });
      personal.appendChild(section);
    }

    const wl = Watchlist.list();
    if (wl.length) {
      const { section, row: grid } = makeRow("My list");
      wl.forEach((e) => {
        grid.appendChild(makeCard({ name: e.name, poster: e.poster }, () =>
          Router.push(DetailScreen, { addon: { baseUrl: e.addonBaseUrl }, type: e.type, id: e.id, name: e.name })));
      });
      personal.appendChild(section);
    }
  }

  async function renderSection(entry) {
    const { section, row } = makeRow(`${entry.addon.name} · ${entry.catalog.name}`, {
      onSeeAll: () => Router.push(CatalogScreen, { addon: entry.addon, catalog: entry.catalog }),
    });
    board.appendChild(section);

    for (let i = 0; i < PREVIEW_COUNT; i++) row.appendChild(makeSkeleton());

    try {
      const metas = await Addons.catalog(entry.addon.baseUrl, entry.catalog.type, entry.catalog.id);
      const slice = metas.slice(0, PREVIEW_COUNT);
      if (slice.length === 0) { section.remove(); return; }
      row.innerHTML = "";
      slice.forEach((meta) => row.appendChild(makeCard(meta, openDetail(meta, entry))));
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
    hero.innerHTML = ""; filters.innerHTML = ""; board.innerHTML = "";
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
    renderHero();
    renderFilters();
    renderBoard();
  }

  el.querySelector("#search-btn").onclick = () => Router.push(SearchScreen);
  el.querySelector("#settings-btn").onclick = () => Router.push(SettingsScreen);

  return {
    el,
    onEnter() {
      renderPersonal(); // cheap + local; picks up new progress/watchlist on every return
      // (Re)load when first shown, or when the installed-addon list changed
      // since we last rendered (e.g. returning from Settings after adding one).
      const sig = JSON.stringify(Addons.list());
      if (sig !== lastSig) { lastSig = sig; loadAddons(); }
    },
  };
}
