// Subtitle support: gather available subtitle tracks for an item, and parse
// SRT/WebVTT into a simple cue list the player renders itself (so we control
// timing offset, language switching, and styling — independent of <track>).
import { Addons } from "../addons.js";

const TIME = /((?:\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3})\s*-->\s*((?:\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3})/;

function toSeconds(str) {
  const parts = String(str).replace(",", ".").split(":").map(parseFloat);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

// Strip markup (VTT tags, SRT/ASS overrides) — we render as plain text.
function clean(t) {
  return t.replace(/<[^>]+>/g, "").replace(/\{[^}]*\}/g, "").trim();
}

// Parse SRT or WebVTT text into [{ start, end, text }] sorted by start.
export function parseCues(text) {
  const body = String(text || "").replace(/\r/g, "");
  const cues = [];
  for (const block of body.split(/\n\s*\n/)) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    const ti = lines.findIndex((l) => TIME.test(l));
    if (ti < 0) continue;
    const m = lines[ti].match(TIME);
    if (!m) continue;
    const txt = clean(lines.slice(ti + 1).join("\n"));
    if (!txt) continue;
    cues.push({ start: toSeconds(m[1]), end: toSeconds(m[2]), text: txt });
  }
  return cues.sort((a, b) => a.start - b.start);
}

export async function fetchCues(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseCues(await res.text());
}

// Active cue at a given time, applying a delay offset (seconds; +ve = later).
export function activeCueText(cues, time, offset = 0) {
  const t = time - offset;
  for (const c of cues) {
    if (c.start <= t && t <= c.end) return c.text;
    if (c.start > t) break; // sorted — no later cue can match
  }
  return "";
}

// Collect subtitle tracks for an item: the chosen stream's sidecar subs plus
// any installed addon exposing a `subtitles` resource. De-duped by URL.
export async function gatherSubtitles(type, videoId, stream) {
  const out = [];
  const seen = new Set();
  const add = (s) => {
    if (!s || !s.url || seen.has(s.url)) return;
    seen.add(s.url);
    out.push({ id: s.id || s.url, lang: String(s.lang || s.language || "??"), url: s.url });
  };
  (stream && Array.isArray(stream.subtitles) ? stream.subtitles : []).forEach(add);
  await Promise.all(Addons.list().map(async (u) => {
    try {
      const m = await Addons.manifest(u);
      if (!Addons.hasResource(m, "subtitles", type)) return;
      (await Addons.subtitlesFromAddon(m.baseUrl, type, videoId)).forEach(add);
    } catch (_) { /* skip */ }
  }));
  return out;
}
