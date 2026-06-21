// Settings: Appearance (color-theme picker) + Addons (add/remove). This is the
// dedicated home for addon-link pasting — it no longer lives on the Home screen.
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { Theme } from "../theme.js";
import { Platform } from "../platform.js";
import { AddAddonScreen } from "./addAddon.js";
import { icon } from "../ui/icons.js";

export async function SettingsScreen() {
  const el = document.createElement("div");
  el.className = "screen settings-screen";
  el.innerHTML = `
    <h2 class="settings-title">Settings</h2>

    <section class="settings-section">
      <h3 class="settings-h">Appearance</h3>
      <p class="settings-hint">Pick a color theme.</p>
      <div class="theme-list" id="theme-list"></div>
    </section>

    <section class="settings-section">
      <h3 class="settings-h">Addons</h3>
      <p class="settings-hint">Add Stremio addon manifest URLs. Helio ships with none — what you add is yours, stored on this device.</p>
      <div id="addon-add"></div>
      <div class="chips" id="addon-list"></div>
      <div class="status" id="s-status"></div>
    </section>
  `;

  const themeList = el.querySelector("#theme-list");
  const addonAdd = el.querySelector("#addon-add");
  const addonList = el.querySelector("#addon-list");
  const status = el.querySelector("#s-status");

  // ---- Appearance ----
  function renderThemes() {
    themeList.innerHTML = "";
    const active = Theme.active();
    Theme.list().forEach((th) => {
      const opt = document.createElement("button");
      opt.className = "focusable theme-opt" + (th.id === active ? " active" : "");
      opt.type = "button";
      const sw = th.swatches.map((c) => `<span class="theme-swatch" style="background:${c}"></span>`).join("");
      opt.innerHTML = `
        <span class="theme-swatches">${sw}</span>
        <span class="theme-meta">
          <span class="theme-name">${th.name}</span>
          <span class="theme-note">${th.note}</span>
        </span>
        ${th.id === active ? `<span class="theme-check">${icon("check", 18)}</span>` : ""}`;
      opt.onclick = () => { Theme.set(th.id); renderThemes(); };
      themeList.appendChild(opt);
    });
  }

  // ---- Addons ----
  function renderAddControl() {
    addonAdd.innerHTML = "";
    if (Platform.isBrowser()) {
      const bar = document.createElement("div");
      bar.className = "addbar";
      bar.innerHTML = `
        <input id="addon-url" class="addon-input" type="text"
          placeholder="https://…/manifest.json" autocomplete="off" spellcheck="false" />
        <button id="add-btn" class="focusable btn btn-primary" type="button">Add</button>`;
      addonAdd.appendChild(bar);
      const input = bar.querySelector("#addon-url");
      const submit = () => {
        const v = input.value.trim();
        if (!v) return;
        if (Addons.add(v)) { input.value = ""; loadAddonList(); }
        else { status.textContent = "Already installed, or invalid URL."; }
      };
      bar.querySelector("#add-btn").onclick = submit;
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submit(); input.blur(); } });
    } else {
      const btn = document.createElement("button");
      btn.className = "focusable btn btn-primary";
      btn.innerHTML = `${icon("plus")}<span>Add addon</span>`;
      btn.onclick = () => Router.push(AddAddonScreen);
      addonAdd.appendChild(btn);
    }
  }

  async function loadAddonList() {
    addonList.innerHTML = "";
    const urls = Addons.list();
    if (urls.length === 0) { status.textContent = "No addons installed yet."; return; }
    status.textContent = "";
    for (const url of urls) {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.textContent = url; // replaced with the friendly name once the manifest loads
      const rm = document.createElement("button");
      rm.className = "focusable chip-remove";
      rm.type = "button";
      rm.innerHTML = icon("close", 14);
      rm.title = "Remove";
      rm.onclick = () => { Addons.remove(url); loadAddonList(); };
      chip.appendChild(rm);
      addonList.appendChild(chip);
      Addons.manifest(url)
        .then((m) => { chip.firstChild.textContent = m.name + "  "; })
        .catch(() => { chip.classList.add("chip-error"); chip.firstChild.textContent = url + " (unreachable)  "; });
    }
  }

  let lastSig = JSON.stringify(Addons.list());
  renderThemes();
  renderAddControl();
  loadAddonList();

  return {
    el,
    onEnter() {
      // Refresh the addon list if it changed (e.g. returning from Add-addon on TV).
      const sig = JSON.stringify(Addons.list());
      if (sig !== lastSig) { lastSig = sig; renderAddControl(); loadAddonList(); }
    },
  };
}
