// Best-effort audio-language detection from a stream's free-text title/name/
// description (Stremio has no structured language field). Returns short codes
// like ["EN","ES"] or ["MULTI"], never emoji — so users can compare streams
// before playing. Heuristic by necessity; tune the maps as addon formats vary.

// Flag emoji (regional-indicator pairs) -> country -> language code.
const COUNTRY_LANG = {
  GB: "EN", US: "EN", AU: "EN", CA: "EN", IE: "EN", NZ: "EN",
  ES: "ES", MX: "ES", AR: "ES", CO: "ES", CL: "ES",
  FR: "FR", DE: "DE", AT: "DE", CH: "DE",
  IN: "HI", IT: "IT", PT: "PT", BR: "PT", RU: "RU", UA: "UK",
  JP: "JA", KR: "KO", CN: "ZH", TW: "ZH", HK: "ZH",
  SA: "AR", AE: "AR", EG: "AR", TR: "TR", NL: "NL", BE: "NL",
  PL: "PL", SE: "SV", DK: "DA", NO: "NO", FI: "FI", GR: "EL",
  IL: "HE", TH: "TH", VN: "VI", ID: "ID", RO: "RO", HU: "HU", CZ: "CS", IR: "FA",
};

// Explicit language words / ISO codes found in titles.
const NAME_LANG = [
  [/\benglish\b|\beng\b|\ben\b/i, "EN"],
  [/\bspanish\b|espa[nñ]ol|\bspa\b|\bcastellano\b|\blatino\b|\bvose\b/i, "ES"],
  [/\bfrench\b|fran[cç]ais|\bfre\b|\bfra\b|\bvff\b|\bvostfr\b|\btruefrench\b/i, "FR"],
  [/\bgerman\b|deutsch|\bger\b|\bdeu\b/i, "DE"],
  [/\bhindi\b|\bhin\b/i, "HI"],
  [/\bitalian\b|italiano|\bita\b/i, "IT"],
  [/\bportuguese\b|portugu[eê]s|\bpor\b/i, "PT"],
  [/\brussian\b|\brus\b/i, "RU"],
  [/\bjapanese\b|\bjpn\b|\bjap\b/i, "JA"],
  [/\bkorean\b|\bkor\b/i, "KO"],
  [/\bchinese\b|mandarin|\bchi\b|\bzho\b/i, "ZH"],
  [/\barabic\b|\bara\b/i, "AR"],
  [/\bturkish\b|\btur\b/i, "TR"],
  [/\bdutch\b|\bnld\b|\bdut\b/i, "NL"],
  [/\bpolish\b|\bpol\b/i, "PL"],
  [/\btamil\b|\btam\b/i, "TA"],
  [/\btelugu\b|\btel\b/i, "TE"],
  [/\bmalayalam\b/i, "ML"],
  [/\bkannada\b/i, "KN"],
];

// Container hint from the stream text/URL. Matters for compatibility: desktop
// Chrome plays MKV, but Safari/iOS cannot open the MKV container at all —
// the classic "works on PC, playback error on iPhone".
export function parseContainer(stream) {
  const t = `${stream.title || ""} ${stream.name || ""} ${stream.url || ""}`.toLowerCase();
  if (/\.m3u8(\?|#|$)|\bhls\b/.test(t)) return "HLS";
  if (/\bmkv\b|\.mkv(\?|#|$)/.test(t)) return "MKV";
  if (/\bavi\b|\.avi(\?|#|$)/.test(t)) return "AVI";
  if (/\bmp4\b|\bm4v\b|\.mp4(\?|#|$)/.test(t)) return "MP4";
  if (/\bwebm\b|\.webm(\?|#|$)/.test(t)) return "WEBM";
  return null;
}

export function parseLanguages(stream) {
  const text = `${stream.title || ""} ${stream.name || ""} ${stream.description || ""}`;
  const langs = new Set();

  if (/\bmulti(?:[\s-]?(?:audio|lang|sub))?\b|\bdual(?:[\s-]?audio)?\b/i.test(text)) langs.add("MULTI");

  const flags = text.match(/[\u{1F1E6}-\u{1F1FF}]{2}/gu) || [];
  for (const f of flags) {
    const chars = [...f].map((c) => String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 65));
    const cc = chars.join("");
    if (COUNTRY_LANG[cc]) langs.add(COUNTRY_LANG[cc]);
  }

  for (const [re, code] of NAME_LANG) if (re.test(text)) langs.add(code);

  // Keep order stable-ish: MULTI first, then the rest.
  const list = [...langs];
  return list.includes("MULTI") ? ["MULTI", ...list.filter((l) => l !== "MULTI")] : list;
}
