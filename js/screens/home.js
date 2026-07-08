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

// Horizontal rows show a longer slice on desktop/TV; phones get fewer items —
// image decode memory is the main iOS Safari crash risk on an 8-row home.
const isSmallScreen = () => {
  try { return window.matchMedia("(max-width: 640px)").matches; } catch (_) { return false; }
};
const previewCount = () => (isSmallScreen() ? 10 : 20);
const SKELETON_COUNT = 8;
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
    <div id="genres" class="genre-pills"></div>
    <div id="board" class="board"></div>
    <div id="status" class="status"></div>
  `;

  const hero = el.querySelector("#hero");
  const genres = el.querySelector("#genres");
  const personal = el.querySelector("#personal");
  const filters = el.querySelector("#filters");
  const board = el.querySelector("#board");
  const status = el.querySelector("#status");

  let catalogEntries = []; // [{ addon, catalog }]
  let activeType = "all";
  let activeGenre = null;
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

  // ----- hero billboard: rotating picks, biased toward the user's taste -----
  let heroItems = [];
  let heroIndex = 0;
  let heroTimer = 0;

  async function buildHeroPool() {
    const entries = catalogEntries.slice(0, 3);
    const lists = await Promise.all(entries.map((e) =>
      Addons.catalog(e.addon.baseUrl, e.catalog.type, e.catalog.id).catch(() => [])));
    const pool = [];
    const seen = new Set();
    lists.forEach((metas, i) => metas.slice(0, 12).forEach((m) => {
      if (!(m.background || m.poster) || seen.has(m.id)) return;
      seen.add(m.id);
      pool.push({ item: m, entry: entries[i] });
    }));
    // Taste profile: genres of pool items the user has watched or listed boost
    // similar titles; already-seen titles are demoted; a random nudge keeps the
    // billboard fresh between visits.
    const libIds = new Set([
      ...Watchlist.list().map((e) => e.id),
      ...WatchProgress.list(30).map((e) => e.id),
    ]);
    const affinity = {};
    pool.forEach(({ item }) => {
      if (libIds.has(item.id)) (item.genres || []).forEach((g) => { affinity[g] = (affinity[g] || 0) + 1; });
    });
    const score = ({ item }) =>
      (item.genres || []).reduce((s, g) => s + (affinity[g] || 0), 0)
      - (libIds.has(item.id) ? 2 : 0)
      + Math.random() * 1.5;
    return pool.sort((a, b) => score(b) - score(a)).slice(0, 5);
  }

  function renderHeroItem(instant = false) {
    const pick = heroItems[heroIndex];
    if (!pick) { hero.innerHTML = ""; return; }
    const { item, entry } = pick;
    const type = item.type || entry.catalog.type;
    const art = (item.background || item.poster).replace(/'/g, "%27");

    const paint = () => {
      hero.innerHTML = `
        <div class="hero-bg" style="background-image:url('${art}')"></div>
        <div class="hero-scrim"></div>
        <div class="hero-content">
          <h2 class="hero-title"></h2>
          <p class="hero-desc"></p>
          <div class="hero-actions"></div>
        </div>
        <div class="hero-dots"></div>`;
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
      const dots = hero.querySelector(".hero-dots");
      heroItems.forEach((_, i) => {
        const d = document.createElement("button");
        d.className = "hero-dot" + (i === heroIndex ? " active" : "");
        d.type = "button";
        d.tabIndex = -1;
        d.setAttribute("aria-label", `Featured ${i + 1}`);
        d.onclick = () => { heroIndex = i; renderHeroItem(); restartHeroRotation(); };
        dots.appendChild(d);
      });
      hero.classList.remove("hero-swap");
    };

    if (instant) { paint(); return; }
    hero.classList.add("hero-swap"); // crossfade: fade out, repaint, fade in
    setTimeout(paint, 220);
  }

  function restartHeroRotation() {
    clearInterval(heroTimer);
    if (heroItems.length > 1) {
      heroTimer = setInterval(() => {
        if (!document.contains(hero)) return; // home not on screen; skip the tick
        heroIndex = (heroIndex + 1) % heroItems.length;
        renderHeroItem();
      }, 8000);
    }
  }

  async function renderHero() {
    try {
      heroItems = await buildHeroPool();
    } catch (_) { heroItems = []; }
    heroIndex = 0;
    hero.innerHTML = "";
    if (heroItems.length) renderHeroItem(true);
    restartHeroRotation();
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

    for (let i = 0; i < SKELETON_COUNT; i++) row.appendChild(makeSkeleton());

    try {
      const metas = await Addons.catalog(
        entry.addon.baseUrl, entry.catalog.type, entry.catalog.id, 0,
        activeGenre ? { genre: activeGenre } : {});
      const slice = metas.slice(0, previewCount());
      if (slice.length === 0) { section.remove(); return; }
      row.innerHTML = "";
      slice.forEach((meta) => row.appendChild(makeCard(meta, openDetail(meta, entry))));
    } catch (e) {
      section.remove();
    }
  }

  function renderBoard() {
    board.innerHTML = "";
    const shown = catalogEntries
      .filter((e) => activeType === "all" || e.catalog.type === activeType)
      .filter((e) => !activeGenre || (e.catalog.genres || []).includes(activeGenre));
    shown.forEach((entry) => renderSection(entry));
    if (!shown.length && activeGenre) setStatus(`No catalogs support the "${activeGenre}" genre.`);
  }

  function renderFilters() {
    filters.innerHTML = "";
    const present = new Set(catalogEntries.map((e) => e.catalog.type));
    TYPE_FILTERS.filter((f) => f.id === "all" || present.has(f.id)).forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "focusable filter" + (f.id === activeType ? " active" : "");
      btn.textContent = f.label;
      btn.onclick = () => {
        activeType = f.id;
        if (activeGenre && !availableGenres().includes(activeGenre)) activeGenre = null;
        renderFilters(); renderGenres(); renderBoard();
      };
      filters.appendChild(btn);
    });
  }

  // ----- genre pills (catalogs advertising the `genre` extra) -----
  function availableGenres() {
    const set = new Set();
    catalogEntries
      .filter((e) => activeType === "all" || e.catalog.type === activeType)
      .forEach((e) => (e.catalog.genres || []).forEach((g) => set.add(g)));
    return [...set].slice(0, 24);
  }

  function renderGenres() {
    genres.innerHTML = "";
    const opts = availableGenres();
    if (!opts.length) return;
    const mk = (label, value) => {
      const b = document.createElement("button");
      b.className = "focusable genre-pill" + (value === activeGenre ? " active" : "");
      b.type = "button";
      b.textContent = label;
      b.onclick = () => { activeGenre = value; renderGenres(); renderBoard(); };
      genres.appendChild(b);
    };
    mk("All genres", null);
    opts.forEach((g) => mk(g, g));
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
    renderGenres();
    renderBoard();
  }

  el.querySelector("#search-btn").onclick = () => Router.push(SearchScreen);
  el.querySelector("#settings-btn").onclick = () => Router.push(SettingsScreen);

  // Sticky top bar auto-hide: stays pinned while scrolling, fades out after 3s
  // of no interaction, and wakes on any touch/scroll/mouse/key input.
  const topbar = el.querySelector(".topbar");
  let tbTimer = 0;
  let lastInputType = "";
  let lastMouse = null;
  const wakeTopbar = (ev) => {
    if (!document.contains(el)) return; // home not mounted — ignore global events
    if (ev && ev.type) lastInputType = ev.type;
    topbar.classList.remove("tb-hidden");
    clearTimeout(tbTimer);
    tbTimer = setTimeout(() => {
      // Keep visible only for D-pad users parked on it (last input was a key);
      // the default initial focus must not pin the bar open forever.
      if (lastInputType === "keydown" && topbar.querySelector(".focused")) return;
      topbar.classList.add("tb-hidden");
    }, 3000);
  };
  // Only REAL user input wakes the bar. No `scroll` (layout shifts, momentum,
  // and scroll-anchoring fire it without a touch) and no bare `mousemove`
  // (Chromium re-dispatches it when content changes under the cursor — e.g.
  // the hero rotating every 8s would keep the bar awake forever).
  ["pointerdown", "touchstart", "touchmove", "wheel", "keydown"].forEach((ev) =>
    window.addEventListener(ev, wakeTopbar, { passive: true }));
  window.addEventListener("mousemove", (ev) => {
    if (lastMouse && (Math.abs(ev.clientX - lastMouse.x) > 2 || Math.abs(ev.clientY - lastMouse.y) > 2)) {
      wakeTopbar(ev);
    }
    lastMouse = { x: ev.clientX, y: ev.clientY };
  }, { passive: true });
  // NOTE: the initial arm happens in onEnter — at factory time the screen isn't
  // mounted yet, so document.contains(el) would bail and no hide timer would run.

  return {
    el,
    onEnter() {
      wakeTopbar(); // (re)arm the auto-hide — the screen is mounted now
      renderPersonal(); // cheap + local; picks up new progress/watchlist on every return
      // (Re)load when first shown, or when the installed-addon list changed
      // since we last rendered (e.g. returning from Settings after adding one).
      const sig = JSON.stringify(Addons.list());
      if (sig !== lastSig) { lastSig = sig; loadAddons(); }
    },
  };
}
