// Streams: gather streams for a title/episode from ALL installed addons that
// support `stream` for this type, grouped by addon, then launch the player.
import { Router } from "../main.js";
import { Stremio } from "../stremio.js";
import { PlayerScreen } from "../player.js";

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function StreamsScreen({ type, videoId, title }) {
  const el = document.createElement("div");
  el.className = "screen streams-screen";
  el.innerHTML = `
    <h2 class="streams-title">${escapeHtml(title || "Streams")}</h2>
    <div class="streams-list"></div>
    <div class="status"></div>
  `;
  const list = el.querySelector(".streams-list");
  const status = el.querySelector(".status");

  let loaded = false;

  async function load() {
    status.textContent = "Finding streams across your addons…";
    try {
      const groups = await Stremio.streamsFromAll(type, videoId);
      const total = groups.reduce((n, g) => n + g.streams.length, 0);
      status.textContent = total ? "" : "No streams found in any installed addon for this title.";

      groups.forEach((group) => {
        const header = document.createElement("div");
        header.className = "stream-group";
        header.textContent = group.addonName;
        list.appendChild(header);

        group.streams.forEach((s) => {
          const playable = !!(s.url || s.externalUrl);
          const row = document.createElement("button");
          row.className = "focusable stream-row";
          row.innerHTML = `<span class="stream-name">${escapeHtml(s.title || s.name || "Stream")}</span>`
            + (playable ? "" : `<span class="stream-tag">unsupported</span>`);
          row.onclick = () => { if (playable) Router.push(PlayerScreen, { stream: s }); };
          list.appendChild(row);
        });
      });
    } catch (e) {
      status.textContent = `Failed: ${e.message}`;
    }
  }

  return {
    el,
    onEnter() { if (!loaded) { loaded = true; load(); } },
  };
}
