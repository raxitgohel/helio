// Helio's own addon client (no Stremio dependency). It speaks the open
// Stremio Addon *protocol* — predictable HTTP endpoints (manifest/catalog/
// meta/stream) — so any compatible addon works when a user pastes its URL.
// Ships EMPTY: no bundled addons.

import { Store } from "./store.js";

const ADDONS_KEY = "addons";
const MANIFEST_SUFFIX = "/manifest.json";
const manifestCache = new Map(); // baseUrl -> parsed manifest

function canonicalize(url) {
  let s = String(url || "").trim().replace(/\/+$/, "");
  if (s.toLowerCase().endsWith(MANIFEST_SUFFIX)) {
    s = s.slice(0, -MANIFEST_SUFFIX.length).replace(/\/+$/, "");
  }
  return s;
}

// Stremio encodes path segments but keeps it URL-safe; matches Nuvio's encoder.
const enc = (v) => encodeURIComponent(String(v || "")).replace(/\+/g, "%20");

// A catalog supports search if its `extra` advertises a "search" param
// (or the legacy `extraSupported` array does).
function catalogSupportsSearch(c) {
  if (Array.isArray(c.extra)) return c.extra.some((e) => e && e.name === "search");
  if (Array.isArray(c.extraSupported)) return c.extraSupported.includes("search");
  return false;
}

async function getJson(url, { timeout = 0 } = {}) {
  const ctrl = timeout && typeof AbortController !== "undefined" ? new AbortController() : null;
  const tid = ctrl ? setTimeout(() => ctrl.abort(), timeout) : null;
  try {
    const res = await fetch(url, ctrl ? { signal: ctrl.signal } : undefined);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    if (tid) clearTimeout(tid);
  }
}

const streamCache = new Map(); // `${type}:${videoId}` -> groups (per session)

export const Addons = {
  // ----- installed addon list (per profile) -----
  list() { return Store.get(ADDONS_KEY, []); },

  add(url) {
    const base = canonicalize(url);
    if (!base || !/^https?:\/\//i.test(base)) return false;
    const current = this.list();
    if (current.includes(base)) return false;
    Store.set(ADDONS_KEY, [...current, base]);
    return true;
  },

  remove(url) {
    const base = canonicalize(url);
    Store.set(ADDONS_KEY, this.list().filter((u) => u !== base));
  },

  // ----- protocol calls -----
  async manifest(base) {
    const b = canonicalize(base);
    if (manifestCache.has(b)) return manifestCache.get(b);
    const m = await getJson(`${b}/manifest.json`);
    const parsed = this._parseManifest(m, b);
    manifestCache.set(b, parsed);
    return parsed;
  },

  _parseManifest(m, b) {
    return {
      id: m.id || b,
      name: m.name || "Addon",
      baseUrl: b,
      types: Array.isArray(m.types) ? m.types : [],
      catalogs: (m.catalogs || []).map((c) => ({
        id: c.id,
        name: c.name || c.id,
        type: c.type,
        searchable: catalogSupportsSearch(c),
      })),
      resources: (m.resources || []).map((r) =>
        typeof r === "string"
          ? { name: r, types: m.types || [] }
          : { name: r.name, types: Array.isArray(r.types) ? r.types : (m.types || []) }
      ),
    };
  },

  hasResource(manifest, name, type) {
    return (manifest.resources || []).some(
      (r) => r.name === name && (!r.types.length || r.types.includes(type))
    );
  },

  async catalog(base, type, id, skip = 0) {
    const b = canonicalize(base);
    const url = skip > 0
      ? `${b}/catalog/${type}/${id}/skip=${skip}.json`
      : `${b}/catalog/${type}/${id}.json`;
    return this._fetchCatalog(url, type);
  },

  async catalogSearch(base, type, id, query) {
    const b = canonicalize(base);
    const url = `${b}/catalog/${type}/${id}/search=${enc(query)}.json`;
    return this._fetchCatalog(url, type);
  },

  async _fetchCatalog(url, type) {
    const data = await getJson(url);
    return (data.metas || []).map((m) => ({
      id: m.id,
      type: m.type || type,
      name: m.name || "Untitled",
      poster: m.poster || null,
      description: m.description || "",
      releaseInfo: m.releaseInfo || "",
    }));
  },

  // Search every installed addon's searchable catalogs (one per type per addon),
  // in parallel, and merge de-duped results. Each result carries `addonBaseUrl`
  // so the detail screen knows where to fetch full metadata from.
  async search(query, { type = null } = {}) {
    const q = String(query || "").trim();
    if (!q) return [];
    const urls = this.list();
    const seen = new Set();
    const out = [];
    await Promise.all(urls.map(async (url) => {
      try {
        const m = await this.manifest(url);
        const byType = new Map(); // first searchable catalog per type
        for (const c of m.catalogs) {
          if (!c.searchable) continue;
          if (type && c.type !== type) continue;
          if (!byType.has(c.type)) byType.set(c.type, c);
        }
        const lists = await Promise.all([...byType.values()].map((c) =>
          this.catalogSearch(m.baseUrl, c.type, c.id, q).catch(() => [])));
        lists.flat().forEach((meta) => {
          const key = `${meta.type}:${meta.id}`;
          if (seen.has(key)) return;
          seen.add(key);
          out.push({ ...meta, addonBaseUrl: m.baseUrl });
        });
      } catch (_) { /* skip unreachable addon */ }
    }));
    return out;
  },

  async meta(base, type, id) {
    const b = canonicalize(base);
    const data = await getJson(`${b}/meta/${type}/${enc(id)}.json`);
    const m = data.meta || {};
    return {
      id: m.id || id,
      type: m.type || type,
      name: m.name || "Untitled",
      poster: m.poster || null,
      background: m.background || null,
      description: m.description || "",
      releaseInfo: m.releaseInfo || "",
      genres: Array.isArray(m.genres) ? m.genres : [],
      videos: Array.isArray(m.videos) ? m.videos : [],
    };
  },

  async streamsFromAddon(base, type, videoId) {
    const b = canonicalize(base);
    const data = await getJson(`${b}/stream/${type}/${enc(videoId)}.json`, { timeout: 15000 });
    return (data.streams || []).map((s) => ({
      name: s.name || null,
      title: s.title || s.name || "Stream",
      url: s.url || null,
      externalUrl: s.externalUrl || null,
      infoHash: s.infoHash || null, // torrents: not supported in Cycle 1
      ytId: s.ytId || null,
      behaviorHints: s.behaviorHints || null,
      subtitles: Array.isArray(s.subtitles) ? s.subtitles : [], // sidecar subs
    }));
  },

  async subtitlesFromAddon(base, type, videoId) {
    const b = canonicalize(base);
    const data = await getJson(`${b}/subtitles/${type}/${enc(videoId)}.json`, { timeout: 12000 });
    return (data.subtitles || []).map((s) => ({ id: s.id || null, url: s.url || null, lang: s.lang || s.language || "??" }));
  },

  // Query EVERY installed addon that exposes a `stream` resource for this type,
  // in parallel, keyed by the content id (e.g. an IMDB id from Cinemeta).
  // - onGroup(group) fires as each addon resolves, so the UI can render
  //   progressively instead of waiting for the slowest addon.
  // - results are cached per session, so re-opening a title is instant.
  // Returns groups: [{ addonName, streams: [...] }].
  async streamsFromAll(type, videoId, { onGroup } = {}) {
    const cacheKey = `${type}:${videoId}`;
    if (streamCache.has(cacheKey)) {
      const cached = streamCache.get(cacheKey);
      if (onGroup) cached.forEach((g) => onGroup(g));
      return cached;
    }
    const urls = this.list();
    const results = await Promise.all(urls.map(async (url) => {
      try {
        const m = await this.manifest(url);
        if (!this.hasResource(m, "stream", type)) return null;
        const streams = await this.streamsFromAddon(m.baseUrl, type, videoId);
        const group = streams.length ? { addonName: m.name, streams } : null;
        if (group && onGroup) onGroup(group); // render as soon as this addon responds
        return group;
      } catch (_) {
        return null; // unreachable addon / timeout / 404 — just skip it
      }
    }));
    const groups = results.filter(Boolean);
    streamCache.set(cacheKey, groups);
    return groups;
  },
};
