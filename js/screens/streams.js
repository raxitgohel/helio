// Streams: gather streams from all installed addons, then present them in a
// device-aware, low-confusion way:
//   • a single "Recommended" pick — best playable quality that fits this display
//   • "Available now" — playable (direct-URL) streams, sorted best-first
//   • "Needs a debrid service" — torrent-only streams, summarized (not playable yet)
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { Platform } from "../platform.js";
import { PlayerScreen } from "../player.js";
import { icon } from "../ui/icons.js";

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function parseQuality(s) {
  const t = `${s.title || ""} ${s.name || ""}`.toLowerCase();
  if (/2160p?|\b4k\b|uhd/.test(t)) return 2160;
  if (/1440p?|\b2k\b/.test(t)) return 1440;
  if (/1080p?|fhd/.test(t)) return 1080;
  if (/720p?|\bhd\b/.test(t)) return 720;
  if (/480p?|\bsd\b/.test(t)) return 480;
  return null;
}
const qLabel = (q) => (q === 2160 ? "4K" : q ? `${q}p` : "SD");
const capLabel = (c) => (c >= 2160 ? "4K" : `${c}p`);

function parseSize(s) {
  const m = `${s.title || ""} ${s.name || ""}`.match(/(\d+(?:\.\d+)?)\s?(gb|mb)\b/i);
  return m ? `${m[1]} ${m[2].toUpperCase()}` : null;
}
const hasHDR = (s) => /\bhdr|dolby\s?vision|\bdv\b|\bhdr10/i.test(`${s.title || ""} ${s.name || ""}`);
const isPlayable = (s) => !!(s.url || s.externalUrl);

export async function StreamsScreen({ type, videoId, title }) {
  const el = document.createElement("div");
  el.className = "screen streams-screen";
  el.innerHTML = `
    <h2 class="streams-title">${escapeHtml(title || "Streams")}</h2>
    <div class="streams-body"></div>
    <div class="status"></div>
  `;
  const body = el.querySelector(".streams-body");
  const status = el.querySelector(".status");
  let loaded = false;

  function play(stream) { Router.push(PlayerScreen, { stream }); }

  function badge(q) {
    return `<span class="q-badge${q && q >= 1080 ? " hi" : ""}">${qLabel(q)}</span>`;
  }

  function streamRow(item, { clickable }) {
    const row = document.createElement(clickable ? "button" : "div");
    row.className = "stream-row" + (clickable ? " focusable" : " is-disabled");
    const meta = [item.addonName, item.size, item.hdr ? "HDR" : null].filter(Boolean).join(" · ");
    row.innerHTML = `
      ${badge(item.quality)}
      <span class="stream-main">
        <span class="stream-name">${escapeHtml(item.title || item.name || "Stream")}</span>
        <span class="stream-sub">${escapeHtml(meta)}</span>
      </span>
      ${clickable ? "" : '<span class="stream-tag">needs debrid</span>'}`;
    if (clickable) row.onclick = () => play(item);
    return row;
  }

  async function load() {
    const cap = Platform.maxVideoHeight();
    status.textContent = "Finding streams across your addons…";
    try {
      const groups = await Addons.streamsFromAll(type, videoId);
      const items = [];
      groups.forEach((g) => g.streams.forEach((s) => items.push({
        ...s, addonName: g.addonName,
        quality: parseQuality(s), size: parseSize(s), hdr: hasHDR(s), playable: isPlayable(s),
      })));

      status.textContent = "";
      if (items.length === 0) { status.textContent = "No streams found in any installed addon."; return; }

      const playable = items.filter((i) => i.playable)
        .sort((a, b) => (b.quality || 0) - (a.quality || 0));
      const torrents = items.filter((i) => !i.playable)
        .sort((a, b) => (b.quality || 0) - (a.quality || 0));

      // Recommendation: best playable quality that fits the display; else the
      // lowest known-quality playable (avoid over-spec), else just the first.
      let rec = null;
      if (playable.length) {
        const fit = playable.filter((i) => i.quality != null && i.quality <= cap);
        if (fit.length) rec = fit[0];
        else {
          const known = playable.filter((i) => i.quality != null).sort((a, b) => a.quality - b.quality);
          rec = known[0] || playable[0];
        }
      }

      body.innerHTML = "";

      // Device note
      const note = document.createElement("p");
      note.className = "streams-note";
      note.textContent = `Matched to your display — up to ${capLabel(cap)}.`;
      body.appendChild(note);

      // Recommended card
      if (rec) {
        const card = document.createElement("button");
        card.className = "focusable stream-rec";
        card.innerHTML = `
          <span class="rec-icon">${icon("sparkle", 22)}</span>
          <span class="rec-main">
            <span class="rec-label">Recommended</span>
            <span class="rec-name">${escapeHtml(rec.title || rec.name || "Stream")}</span>
            <span class="rec-sub">${escapeHtml([qLabel(rec.quality) + (rec.quality ? "" : " quality"), rec.addonName, rec.size].filter(Boolean).join(" · "))} — best fit for your screen</span>
          </span>
          <span class="rec-play">${icon("play", 20)}<span>Play</span></span>`;
        card.onclick = () => play(rec);
        body.appendChild(card);
      }

      // Available now (playable)
      if (playable.length) {
        const h = document.createElement("div");
        h.className = "stream-group";
        h.textContent = "Available now";
        body.appendChild(h);
        playable.forEach((i) => body.appendChild(streamRow(i, { clickable: true })));
      }

      // Torrent-only (needs debrid) — summarized to avoid a wall of 50 rows
      if (torrents.length) {
        const h = document.createElement("div");
        h.className = "stream-group";
        h.textContent = playable.length ? "Needs a debrid service" : "Found, but not playable yet";
        body.appendChild(h);
        const intro = document.createElement("p");
        intro.className = "streams-note";
        intro.textContent = "These are torrent sources. Helio plays direct (HTTP) streams only for now — set up a debrid service in your addon to make these playable.";
        body.appendChild(intro);
        const SHOW = playable.length ? 5 : 12;
        torrents.slice(0, SHOW).forEach((i) => body.appendChild(streamRow(i, { clickable: false })));
        if (torrents.length > SHOW) {
          const more = document.createElement("p");
          more.className = "streams-note";
          more.textContent = `+ ${torrents.length - SHOW} more torrent source${torrents.length - SHOW === 1 ? "" : "s"}.`;
          body.appendChild(more);
        }
      }
    } catch (e) {
      status.textContent = `Failed: ${e.message}`;
    }
  }

  return {
    el,
    onEnter() { if (!loaded) { loaded = true; load(); } },
  };
}
