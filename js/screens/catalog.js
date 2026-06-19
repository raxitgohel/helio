// Full catalog ("See all" from Home): all items for one addon catalog, with
// Load-More pagination via the Stremio `skip` offset.
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { DetailScreen } from "./detail.js";

const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export async function CatalogScreen({ addon, catalog }) {
  const el = document.createElement("div");
  el.className = "screen catalog-screen";
  el.innerHTML = `
    <h2 class="catalog-title">${escapeHtml(addon.name)} · ${escapeHtml(catalog.name)}</h2>
    <div class="grid catalog-grid"></div>
    <div class="catalog-foot"></div>
    <div class="status"></div>
  `;
  const grid = el.querySelector(".catalog-grid");
  const foot = el.querySelector(".catalog-foot");
  const status = el.querySelector(".status");

  let skip = 0;
  let loading = false;
  let done = false;

  const moreBtn = document.createElement("button");
  moreBtn.className = "focusable btn";
  moreBtn.textContent = "Load more";
  moreBtn.onclick = () => loadMore();

  function addCards(metas) {
    metas.forEach((meta) => {
      const card = document.createElement("button");
      card.className = "focusable card";
      card.innerHTML = meta.poster
        ? `<img class="poster" src="${meta.poster}" alt="" loading="lazy" />
           <span class="card-title">${escapeHtml(meta.name)}</span>`
        : `<span class="poster poster-empty"></span>
           <span class="card-title">${escapeHtml(meta.name)}</span>`;
      card.onclick = () => Router.push(DetailScreen, {
        addon, type: meta.type || catalog.type, id: meta.id, name: meta.name,
      });
      grid.appendChild(card);
    });
  }

  async function loadMore() {
    if (loading || done) return;
    loading = true;
    setFoot();
    status.textContent = skip === 0 ? "Loading…" : "Loading more…";
    try {
      const metas = await Addons.catalog(addon.baseUrl, catalog.type, catalog.id, skip);
      if (metas.length === 0) {
        done = true;
        status.textContent = skip === 0 ? "This catalog is empty." : "";
      } else {
        addCards(metas);
        skip += metas.length;
        status.textContent = "";
        // Heuristic: a short page means we've reached the end.
        if (metas.length < 50) done = true;
      }
    } catch (e) {
      status.textContent = `Failed to load: ${e.message}`;
    }
    loading = false;
    setFoot();
  }

  function setFoot() {
    foot.innerHTML = "";
    if (!done && !loading) foot.appendChild(moreBtn);
  }

  return {
    el,
    onEnter() { if (skip === 0) loadMore(); },
  };
}
