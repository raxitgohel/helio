// Detail: show meta for one title. Movies get a "Find streams" action;
// series get an episode list (from meta.videos), each leading to streams.
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { StreamsScreen } from "./streams.js";

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function DetailScreen({ addon, type, id, name }) {
  const el = document.createElement("div");
  el.className = "screen detail-screen";
  el.innerHTML = `
    <div class="detail-bg"></div>
    <div class="detail-content">
      <h2 class="detail-title">${escapeHtml(name || "Loading…")}</h2>
      <div class="detail-meta"></div>
      <p class="detail-desc"></p>
      <div class="detail-actions"></div>
      <div class="detail-episodes"></div>
    </div>
  `;

  const bg = el.querySelector(".detail-bg");
  const titleEl = el.querySelector(".detail-title");
  const metaEl = el.querySelector(".detail-meta");
  const descEl = el.querySelector(".detail-desc");
  const actions = el.querySelector(".detail-actions");
  const episodes = el.querySelector(".detail-episodes");

  let loaded = false;

  async function load() {
    try {
      const meta = await Addons.meta(addon.baseUrl, type, id);
      titleEl.textContent = meta.name;
      if (meta.background) bg.style.backgroundImage = `url("${meta.background}")`;
      metaEl.textContent = [meta.releaseInfo, (meta.genres || []).slice(0, 3).join(", ")]
        .filter(Boolean).join("  ·  ");
      descEl.textContent = meta.description || "";

      const isSeries = type === "series" || (meta.videos && meta.videos.length > 0);
      if (isSeries && meta.videos.length) {
        episodes.innerHTML = `<h3 class="eps-title">Episodes</h3>`;
        const list = document.createElement("div");
        list.className = "eps-list";
        meta.videos.forEach((v) => {
          const btn = document.createElement("button");
          btn.className = "focusable ep";
          const label = (v.season != null && v.episode != null)
            ? `S${v.season}E${v.episode}  ${v.name || v.title || ""}`.trim()
            : (v.name || v.title || v.id);
          btn.textContent = label;
          btn.onclick = () => Router.push(StreamsScreen, {
            type, videoId: v.id, title: label,
          });
          list.appendChild(btn);
        });
        episodes.appendChild(list);
      } else {
        const play = document.createElement("button");
        play.className = "focusable btn btn-primary";
        play.textContent = "Find streams";
        play.onclick = () => Router.push(StreamsScreen, {
          type, videoId: id, title: meta.name,
        });
        actions.appendChild(play);
      }
    } catch (e) {
      descEl.textContent = `Failed to load details: ${e.message}`;
    }
  }

  return {
    el,
    onEnter() { if (!loaded) { loaded = true; load(); } },
  };
}
