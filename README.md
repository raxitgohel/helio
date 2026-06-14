# Helio

A **neutral, Stremio-addon-compatible media player** for Samsung Tizen TV (and, later, the
web). Helio ships **empty** — no bundled addons, no content. You add Stremio addons by URL;
data stays local. Built from scratch; see `../TV/NUVIO-ARCHITECTURE.md` for the reference notes
on Nuvio that informed the design.

## Status — Cycle 1 (minimal vertical slice)

Goal: prove the whole loop end-to-end in a desktop browser.

**In:** add/remove an addon → browse a catalog (poster grid) → detail page → stream list →
play one HTTP stream via the native `<video>` element. D-pad/keyboard navigation, Back to go up.

**Not yet (later cycles):** hls.js / dash.js / Tizen AVPlay engines · torrents (`infoHash`),
debrid, plugins · multiple profiles · accounts / backend / sync · search · settings · themes ·
the TizenBrew wrapper.

## Run it (browser-first)

ES modules need to be served over HTTP (not opened as a `file://`). From this folder:

```sh
python scripts/devserver.py 8137 .
```

Then open http://localhost:8137 in a desktop browser.

`devserver.py` is a tiny static server that sends `Cache-Control: no-store`, so every
reload picks up your latest code. (Plain `python -m http.server` caches ES modules and
will serve **stale JS** on reload — if you use it, you must hard-refresh with Ctrl+Shift+R.)

### Try the loop
1. Paste a Stremio addon manifest URL into the box and press Enter. For a quick test, Cinemeta
   (`https://v3-cinemeta.strem.io/manifest.json`) provides catalogs + metadata. Note: Cinemeta
   has **no streams** — to actually play something you also need a stream-providing addon, or
   test the player with any addon that returns a direct `url` stream.
2. Pick a catalog tab → click a poster → open detail → **Find streams** (or pick an episode).
3. Click a stream with a direct URL to play. Streams marked *unsupported* are torrent/debrid-only
   (out of scope for Cycle 1).

## Layout

```
index.html            app shell (1280px design width)
css/app.css           TV styling + focus highlight
js/main.js            bootstrap + screen-stack router
js/platform.js        platform detect, capabilities, key normalization
js/input.js           centralized D-pad spatial navigation
js/store.js           profile-namespaced localStorage
js/addons.js          addon client — Stremio protocol (manifest/catalog/meta/stream)
js/player.js          engine interface (native only) + player screen
js/screens/home.js    addon management + catalog grid
js/screens/detail.js  meta + episodes
js/screens/streams.js stream list → player
```

## Design choices (vs. Nuvio)

- **Local-first**: works with no account; sync/accounts are a later cycle.
- **Small player + uniform engine interface** instead of one giant controller — new engines
  (hls.js, AVPlay) slot in without touching screens.
- **Profile-namespaced storage keys** (`helio:p:<id>:<key>`) so multi-profile is first-class.
- **Centralized geometry-based focus navigation** instead of per-screen key handling.
- **Ships empty** (`DEFAULT_ADDON_URLS` equivalent is `[]`).
