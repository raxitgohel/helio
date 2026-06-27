// Playback. Cycle 1 ships ONE engine — the native <video> element — behind a
// uniform engine interface, so hls.js (Cycle 2) and Tizen AVPlay (TV cycle)
// slot in later without touching the player screen.

import { Platform } from "./platform.js";
import { icon } from "./ui/icons.js";

// Engine interface: { name, canPlay(url), load(video, url) -> Promise, destroy(video) }
const nativeEngine = {
  name: "native",
  canPlay() { return true; }, // Cycle 1: let the browser/TV webview try anything.
  load(video, url) {
    video.src = url;
    video.load();
    return video.play();
  },
  destroy(video) {
    try { video.pause(); } catch (_) {}
    video.removeAttribute("src");
    try { video.load(); } catch (_) {}
  },
};

function pickEngine(/* url, capabilities */) {
  return nativeEngine; // Cycle 2+: hls.js for .m3u8, AVPlay on Tizen, etc.
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
export function PlayerScreen({ stream }) {
  const el = document.createElement("div");
  el.className = "screen player-screen";
  el.innerHTML = `
    <video class="player-video" playsinline></video>
    <div class="player-controls">
      <div class="pc-progress"><div class="pc-fill"></div></div>
      <div class="pc-buttons">
        <button class="pc-btn pc-seek" type="button" aria-label="Back 10 seconds">${icon("rewind", 22)}<span>10</span></button>
        <button class="pc-btn pc-play" type="button" aria-label="Play">${icon("play", 26)}</button>
        <button class="pc-btn pc-seek" type="button" aria-label="Forward 10 seconds"><span>10</span>${icon("forward", 22)}</button>
      </div>
      <div class="pc-meta"><span class="pc-time">0:00 / 0:00</span></div>
    </div>
    <button class="player-bigplay focusable" type="button" aria-label="Play">${icon("play", 40)}</button>
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
  video.controls = false;

  const url = stream && (stream.url || stream.externalUrl);
  const engine = pickEngine();
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

  const syncBigplay = () => { bigplay.style.display = video.paused ? "" : "none"; };

  video.addEventListener("playing", () => { hint.classList.add("hidden"); refreshUI(); showControls(); syncBigplay(); });
  video.addEventListener("play", () => { refreshUI(); showControls(); syncBigplay(); });
  video.addEventListener("pause", () => { refreshUI(); clearTimeout(hideTimer); controls.classList.add("visible"); syncBigplay(); });
  video.addEventListener("timeupdate", refreshUI);
  video.addEventListener("loadedmetadata", refreshUI);
  video.addEventListener("waiting", () => { hint.classList.remove("hidden"); hint.textContent = "Buffering…"; });
  video.addEventListener("error", showPlaybackError);

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
      if (!url) {
        hint.classList.remove("hidden");
        hint.textContent = "This stream has no direct URL (torrent/debrid isn't supported in Cycle 1).";
        return;
      }
      Promise.resolve(engine.load(video, url))
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
      clearTimeout(hideTimer);
      document.removeEventListener("fullscreenchange", onFsChange);
      exitFullscreen();
      engine.destroy(video);
    },
  };
}
