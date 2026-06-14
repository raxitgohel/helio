// Platform abstraction (Cycle 1: browser + Tizen-aware key handling).
// Mirrors Nuvio's adapter idea but kept tiny. Capabilities() will drive engine
// selection once hls.js / AVPlay engines are added in later cycles.

export const Platform = {
  name: "browser",

  init() {
    const params = new URLSearchParams(location.search);
    const ua = String(navigator.userAgent || "").toLowerCase();
    const looksTizen =
      params.get("wrapper") === "tizen" ||
      params.get("source") === "tizenbrew" ||
      !!window.tizen ||
      !!(window.webapis && window.webapis.avplay) ||
      ua.includes("tizen");
    if (looksTizen) {
      this.name = "tizen";
      this._initTizen();
    }
    document.documentElement.classList.add(this.name);
  },

  isTizen() { return this.name === "tizen"; },
  isBrowser() { return this.name === "browser"; },

  _initTizen() {
    try {
      const dev = window.tizen && window.tizen.tvinputdevice;
      ["Back", "Return", "MediaPlay", "MediaPause", "MediaPlayPause", "MediaStop"]
        .forEach((k) => { try { dev && dev.registerKey(k); } catch (_) {} });
    } catch (_) { /* older firmware */ }
  },

  // What playback machinery is available. Cycle 1 only uses nativeVideo.
  capabilities() {
    const v = document.createElement("video");
    return {
      nativeVideo: true,
      nativeHls: v.canPlayType("application/vnd.apple.mpegurl") !== "",
      hlsJs: !!(window.Hls && window.Hls.isSupported && window.Hls.isSupported()),
      tizenAvplay: this.isTizen() && !!(window.webapis && window.webapis.avplay),
    };
  },

  // Normalize a raw KeyboardEvent into a small, intent-level descriptor.
  normalizeKey(e) {
    const code = Number(e.keyCode || e.which || 0);
    const key = String(e.key || "");
    const byCode = { 37: "left", 38: "up", 39: "right", 40: "down" };
    const byKey = { ArrowLeft: "left", ArrowUp: "up", ArrowRight: "right", ArrowDown: "down" };
    const dir = byCode[code] || byKey[key] || null;
    const isEnter = code === 13 || key === "Enter";
    const backCodes = [27, 10009, 461]; // Esc, Tizen Return, Tizen Back
    const isBack =
      backCodes.includes(code) ||
      key === "Escape" ||
      key === "XF86Back" ||
      String(key).toLowerCase() === "back";
    // Remote media keys (registered on Tizen in _initTizen). Treat play/pause as a toggle.
    const playPauseCodes = [415, 19, 10252, 179]; // MediaPlay, MediaPause, MediaPlayPause
    const isPlayPause =
      playPauseCodes.includes(code) ||
      ["MediaPlayPause", "MediaPlay", "MediaPause"].includes(key);
    return { dir, isArrow: !!dir, isEnter, isBack, isPlayPause, code, key };
  },
};
