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
        // Group episodes by season (season 0 = specials), sorted.
        const bySeason = new Map();
        meta.videos.forEach((v) => {
          const s = Number(v.season != null ? v.season : 0);
          if (!bySeason.has(s)) bySeason.set(s, []);
          bySeason.get(s).push(v);
        });
        const seasons = Array.from(bySeason.keys()).sort((a, b) => a - b);
        seasons.forEach((s) => bySeason.get(s).sort((a, b) => Number(a.episode || 0) - Number(b.episode || 0)));
        // Default to the first real season (skip specials/0 if a numbered season exists).
        let activeSeason = seasons.find((s) => s >= 1);
        if (activeSeason == null) activeSeason = seasons[0];

        episodes.innerHTML = `<h3 class="eps-title">Episodes</h3>
          <div class="season-tabs"></div>
          <div class="eps-list"></div>`;
        const tabs = episodes.querySelector(".season-tabs");
        const list = episodes.querySelector(".eps-list");

        const renderTabs = () => {
          tabs.innerHTML = "";
          if (seasons.length <= 1) return; // no selector needed for a single season
          seasons.forEach((s) => {
            const t = document.createElement("button");
            t.className = "focusable season-tab" + (s === activeSeason ? " active" : "");
            t.textContent = s === 0 ? "Specials" : `Season ${s}`;
            t.onclick = () => { activeSeason = s; renderTabs(); renderEpisodes(); };
            tabs.appendChild(t);
          });
        };
        const renderEpisodes = () => {
          list.innerHTML = "";
          (bySeason.get(activeSeason) || []).forEach((v) => {
            const btn = document.createElement("button");
            btn.className = "focusable ep";
            const epPrefix = v.episode != null ? `E${v.episode} · ` : "";
            btn.textContent = `${epPrefix}${v.name || v.title || v.id}`;
            const fullTitle = `S${activeSeason}E${v.episode != null ? v.episode : ""} ${v.name || v.title || ""}`.trim();
            btn.onclick = () => Router.push(StreamsScreen, { type, videoId: v.id, title: fullTitle });
            list.appendChild(btn);
          });
        };
        renderTabs();
        renderEpisodes();
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
