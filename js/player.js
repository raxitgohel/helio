// Playback. Cycle 1 ships ONE engine — the native <video> element — behind a
// uniform engine interface, so hls.js (Cycle 2) and Tizen AVPlay (TV cycle)
// slot in later without touching the player screen.

import { Platform } from "./platform.js";
import { icon } from "./ui/icons.js";
import { WatchProgress } from "./data/watchProgress.js";
import { fetchCues, activeCueText, gatherSubtitles } from "./core/subtitles.js";

const isHls = (u) => /\.m3u8(\?|#|$)/i.test(String(u || ""));

// Lazily load hls.js from a CDN, once.
function loadHlsLib() {
  if (window.Hls) return Promise.resolve(window.Hls);
  if (loadHlsLib._p) return loadHlsLib._p;
  loadHlsLib._p = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    s.onload = () => resolve(window.Hls || null);
    s.onerror = () => reject(new Error("hls.js failed to load"));
    document.head.appendChild(s);
  });
  return loadHlsLib._p;
}

// Attach a stream URL to the <video>. HLS (.m3u8) uses native HLS on Safari/iOS,
// or hls.js everywhere else; progressive (mp4/webm/…) uses the element directly.
// Returns the hls.js instance if one was created (for track APIs), else null.
async function attachSource(video, url) {
  if (isHls(url) && video.canPlayType("application/vnd.apple.mpegurl") === "") {
    try {
      const Hls = await loadHlsLib();
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        return hls;
      }
    } catch (_) { /* fall through to native */ }
  }
  video.src = url;
  video.load();
  return null;
}

function fmtTime(total) {
  const s = Math.max(0, Math.floor(Number(total) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? h + ":" : ""}${mm}:${String(sec).padStart(2, "0")}`;
}

// Screen factory — pushed onto the router like any other screen, so Back exits
// playback and destroy() tears the engine down.
export function PlayerScreen({ stream, type, videoId, title, upNext } = {}) {
  const el = document.createElement("div");
  el.className = "screen player-screen";
  el.innerHTML = `
    <video class="player-video" playsinline></video>
    <div class="player-subs"></div>
    <div class="player-controls">
      <div class="pc-progress"><div class="pc-fill"></div></div>
      <div class="pc-buttons">
        <button class="pc-btn pc-seek" type="button" aria-label="Back 10 seconds">${icon("rewind", 22)}<span>10</span></button>
        <button class="pc-btn pc-play" type="button" aria-label="Play">${icon("play", 26)}</button>
        <button class="pc-btn pc-seek" type="button" aria-label="Forward 10 seconds"><span>10</span>${icon("forward", 22)}</button>
        <button class="pc-btn pc-opts" type="button" aria-label="Audio & subtitles">${icon("settings", 22)}</button>
      </div>
      <div class="pc-meta"><span class="pc-time">0:00 / 0:00</span></div>
    </div>
    <div class="player-panel" hidden>
      <div class="panel-sec panel-subs">
        <div class="panel-h">Subtitles</div>
        <div class="panel-list" data-k="subs"></div>
      </div>
      <div class="panel-sec panel-sync">
        <div class="panel-h">Subtitle delay</div>
        <div class="sync-row">
          <button class="focusable panel-opt sync-dec" type="button" aria-label="Subtitles earlier">&#8722;0.25s</button>
          <span class="sync-val">0.00s</span>
          <button class="focusable panel-opt sync-inc" type="button" aria-label="Subtitles later">+0.25s</button>
          <button class="focusable panel-opt sync-reset" type="button">Reset</button>
        </div>
      </div>
    </div>
    <button class="player-bigplay focusable" type="button" aria-label="Play">${icon("play", 40)}</button>
    <div class="player-upnext" hidden>
      <span class="upnext-label"></span>
      <button class="upnext-play focusable" type="button">${icon("play", 18)}<span>Play next</span></button>
    </div>
    <div class="player-hint">Loading…</div>
  `;

  const video = el.querySelector(".player-video");
  const controls = el.querySelector(".player-controls");
  const fill = el.querySelector(".pc-fill");
  const playBtn = el.querySelector(".pc-play");
  const seekButtons = el.querySelectorAll(".pc-seek");
  const seekBackBtn = seekButtons[0];
  const seekFwdBtn = seekButtons[1];
  const timeEl = el.querySelector(".pc-time");
  const hint = el.querySelector(".player-hint");
  const bigplay = el.querySelector(".player-bigplay");
  const upnextEl = el.querySelector(".player-upnext");
  const upnextLabel = el.querySelector(".upnext-label");
  const upnextPlay = el.querySelector(".upnext-play");
  const subOverlay = el.querySelector(".player-subs");
  const optsBtn = el.querySelector(".pc-opts");
  const panel = el.querySelector(".player-panel");
  const subList = el.querySelector('[data-k="subs"]');
  const syncVal = el.querySelector(".sync-val");
  video.controls = false;

  const url = stream && (stream.url || stream.externalUrl);
  let hls = null; // hls.js instance, when used
  let hideTimer = 0;

  // A browser blocks an http:// stream inside an https:// page ("mixed content").
  // We don't pre-block (the TV webview often allows it) — we only explain it if
  // playback actually fails.
  const isHttpOnHttps = () =>
    location.protocol === "https:" && typeof url === "string" && /^http:\/\//i.test(url);
  function showPlaybackError() {
    hint.classList.remove("hidden");
    hint.textContent = isHttpOnHttps()
      ? "This stream is HTTP and the browser blocked it on the secure (HTTPS) site. Open Helio on the TV, or pick an HTTPS stream."
      : "Playback error — press Back to exit.";
  }

  function showControls() {
    controls.classList.add("visible");
    clearTimeout(hideTimer);
    if (!video.paused) hideTimer = setTimeout(() => controls.classList.remove("visible"), 3500);
  }
  function refreshUI() {
    const d = Number(video.duration) || 0;
    const t = Number(video.currentTime) || 0;
    fill.style.width = d > 0 ? `${(t / d) * 100}%` : "0%";
    timeEl.textContent = `${fmtTime(t)} / ${fmtTime(d)}`;
    playBtn.innerHTML = icon(video.paused ? "play" : "pause", 26);
    playBtn.setAttribute("aria-label", video.paused ? "Play" : "Pause");
  }
  function togglePlay() {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }
  function seek(delta) {
    const d = Number(video.duration) || 0;
    if (d > 0) video.currentTime = Math.min(d - 0.5, Math.max(0, (Number(video.currentTime) || 0) + delta));
    refreshUI();
    renderSubs();
    showControls();
  }
  function enterFullscreen() {
    // Desktop browsers: true OS fullscreen (allowed here — still inside the
    // click gesture that navigated us). On a TV webview the app is already
    // fullscreen, so fullscreenEnabled is false and we simply skip.
    try {
      if (document.fullscreenEnabled && !document.fullscreenElement && el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    } catch (_) {}
  }
  function exitFullscreen() {
    try {
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (_) {}
  }

  // ----- subtitles -----
  let subCues = null;   // active track's parsed cues, or null = off
  let subOffset = 0;    // seconds; +ve = show later (manual A/V sync, Piece 5)
  let subTracks = [];
  let activeSubId = null;

  function renderSubs() {
    subOverlay.textContent = subCues ? activeCueText(subCues, video.currentTime, subOffset) : "";
  }
  function buildSubList() {
    subList.innerHTML = "";
    const off = document.createElement("button");
    off.className = "focusable panel-opt" + (activeSubId == null ? " active" : "");
    off.textContent = "Off";
    off.onclick = () => selectSub(null);
    subList.appendChild(off);
    subTracks.forEach((t) => {
      const b = document.createElement("button");
      b.className = "focusable panel-opt" + (t.id === activeSubId ? " active" : "");
      b.textContent = String(t.lang || "??").toUpperCase();
      b.onclick = () => selectSub(t);
      subList.appendChild(b);
    });
    if (subTracks.length === 0) {
      const none = document.createElement("div");
      none.className = "panel-empty";
      none.textContent = "No subtitles found.";
      subList.appendChild(none);
    }
  }
  async function selectSub(track) {
    if (!track) { subCues = null; activeSubId = null; subOverlay.textContent = ""; buildSubList(); return; }
    activeSubId = track.id; buildSubList();
    try { subCues = await fetchCues(track.url); renderSubs(); }
    catch (_) { subCues = null; subOverlay.textContent = ""; }
  }
  async function loadSubtitleTracks() {
    buildSubList();
    try { subTracks = await gatherSubtitles(type, videoId, stream); } catch (_) { subTracks = []; }
    buildSubList();
  }

  const syncBigplay = () => { bigplay.style.display = video.paused ? "" : "none"; };

  // ----- resume / continue-watching position -----
  let lastSaveAt = 0;
  let resumed = false;
  function saveProgress() {
    if (!videoId) return;
    const t = Number(video.currentTime) || 0;
    const d = Number(video.duration) || 0;
    if (t < 5) return;
    WatchProgress.save({ type, id: videoId, t, d, title });
  }
  function maybeResume() {
    if (resumed || !videoId) return;
    resumed = true;
    const saved = WatchProgress.get(type, videoId);
    const d = Number(video.duration) || 0;
    if (saved && saved.t > 15 && d > 0 && saved.t < d * 0.95) {
      try { video.currentTime = saved.t; } catch (_) {}
      hint.classList.remove("hidden");
      hint.textContent = `Resumed from ${fmtTime(saved.t)}`;
      setTimeout(() => { if ((hint.textContent || "").startsWith("Resumed")) hint.classList.add("hidden"); }, 2600);
    }
  }

  video.addEventListener("playing", () => { hint.classList.add("hidden"); refreshUI(); showControls(); syncBigplay(); });
  video.addEventListener("play", () => { refreshUI(); showControls(); syncBigplay(); });
  video.addEventListener("pause", () => { refreshUI(); clearTimeout(hideTimer); controls.classList.add("visible"); syncBigplay(); saveProgress(); });
  video.addEventListener("timeupdate", () => { refreshUI(); renderSubs(); const now = Date.now(); if (now - lastSaveAt > 5000) { lastSaveAt = now; saveProgress(); } });
  video.addEventListener("loadedmetadata", () => { maybeResume(); refreshUI(); });
  video.addEventListener("waiting", () => { hint.classList.remove("hidden"); hint.textContent = "Buffering…"; });
  video.addEventListener("error", showPlaybackError);
  video.addEventListener("ended", () => {
    saveProgress();
    if (upNext) {
      upnextLabel.textContent = `Up next: ${upNext.label}`;
      upnextEl.hidden = false;
      bigplay.style.display = "none";
      showControls();
    }
  });

  upnextPlay.onclick = () => { if (upNext) upNext.go(); };
  optsBtn.onclick = () => { panel.hidden = !panel.hidden; showControls(); };
  const updateSync = () => { syncVal.textContent = `${subOffset > 0 ? "+" : ""}${subOffset.toFixed(2)}s`; renderSubs(); };
  el.querySelector(".sync-dec").onclick = () => { subOffset = Math.round((subOffset - 0.25) * 100) / 100; updateSync(); };
  el.querySelector(".sync-inc").onclick = () => { subOffset = Math.round((subOffset + 0.25) * 100) / 100; updateSync(); };
  el.querySelector(".sync-reset").onclick = () => { subOffset = 0; updateSync(); };
  bigplay.onclick = () => { video.play().catch(() => {}); showControls(); };
  playBtn.onclick = () => { togglePlay(); showControls(); };
  seekBackBtn.onclick = () => seek(-10);
  seekFwdBtn.onclick = () => seek(10);
  el.addEventListener("mousemove", showControls); // convenience during browser dev
  // Tap the video (touch) to reveal controls and start playback if a mobile
  // browser blocked autoplay after the screen transition.
  video.addEventListener("click", () => { if (video.paused) video.play().catch(() => {}); showControls(); });

  // Click anywhere on the progress bar to jump to that point.
  const progress = el.querySelector(".pc-progress");
  progress.style.cursor = "pointer";
  progress.addEventListener("click", (e) => {
    const d = Number(video.duration) || 0;
    if (d <= 0) return;
    const rect = progress.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    video.currentTime = frac * d;
    refreshUI();
    showControls();
  });

  // Track fullscreen exits so the Esc that leaves fullscreen doesn't also exit the player.
  let justExitedFsAt = 0;
  const onFsChange = () => { if (!document.fullscreenElement) justExitedFsAt = Date.now(); };
  document.addEventListener("fullscreenchange", onFsChange);

  return {
    el,
    // Back/Esc: if we're in OS fullscreen (or just left it via this same Esc),
    // only leave fullscreen and keep playing. A second Back then exits the player.
    onBack() {
      if (document.fullscreenElement) { exitFullscreen(); return true; }
      if (Date.now() - justExitedFsAt < 500) return true;
      return false;
    },
    onEnter() {
      enterFullscreen();
      loadSubtitleTracks();
      if (!url) {
        hint.classList.remove("hidden");
        hint.textContent = "This stream has no direct URL (torrent/debrid isn't supported in Cycle 1).";
        return;
      }
      attachSource(video, url)
        .then((instance) => { hls = instance; return video.play(); })
        .then(() => showControls())
        .catch(() => {
          if (isHttpOnHttps()) { showPlaybackError(); return; }
          // Autoplay was blocked (common on mobile after a screen transition).
          // The big Play overlay is already showing (video is paused) — a tap
          // there or on the video starts playback within a fresh user gesture.
          hint.classList.add("hidden");
          syncBigplay();
          showControls();
        });
    },
    onKeyDown(k) {
      if (k.isEnter || k.isPlayPause) { togglePlay(); showControls(); return true; }
      if (k.dir === "left") { seek(-10); return true; }
      if (k.dir === "right") { seek(10); return true; }
      if (k.dir === "up" || k.dir === "down") { showControls(); return true; }
      return false;
    },
    destroy() {
      saveProgress();
      clearTimeout(hideTimer);
      document.removeEventListener("fullscreenchange", onFsChange);
      exitFullscreen();
      if (hls) { try { hls.destroy(); } catch (_) {} hls = null; }
      try { video.pause(); } catch (_) {}
      video.removeAttribute("src");
      try { video.load(); } catch (_) {}
    },
  };
}
