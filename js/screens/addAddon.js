// Add-addon screen for the TV: enter a manifest URL with the on-screen keyboard
// (the web build types into the inline field on Home instead). Prefilled with
// "https://" to save remote keystrokes. On success, returns to Home (which
// refreshes because its installed-addon list changed).
import { Router } from "../main.js";
import { Addons } from "../addons.js";
import { createKeyboard } from "../ui/keyboard.js";

export async function AddAddonScreen() {
  const el = document.createElement("div");
  el.className = "screen add-addon-screen";
  el.innerHTML = `
    <h2 class="search-title">Add addon</h2>
    <p class="add-hint">Enter a Stremio addon manifest URL, then press Add.</p>
    <div class="search-query"><span class="sq-text"></span><span class="sq-caret">|</span></div>
    <div class="search-kb"></div>
    <div class="status"></div>
  `;
  const qText = el.querySelector(".sq-text");
  const status = el.querySelector(".status");

  let url = "https://";
  const render = () => { qText.textContent = url; };

  function submit() {
    const value = url.trim();
    if (!value) return;
    if (Addons.add(value)) {
      Router.back(); // Home re-reads its addon list on return and re-renders
    } else {
      status.textContent = "Already installed, or invalid URL (must start with http:// or https://).";
    }
  }

  const keyboard = createKeyboard({
    onInput: (ch) => { url += ch; render(); },
    onSpace: () => {}, // URLs have no spaces
    onBackspace: () => { url = url.slice(0, -1); render(); },
    onClear: () => { url = ""; render(); status.textContent = ""; },
    onSubmit: submit,
    submitLabel: "Add",
  });
  el.querySelector(".search-kb").appendChild(keyboard);

  return {
    el,
    onEnter() { render(); },
    onKeyDown(k) {
      if (k.isArrow || k.isEnter || k.isBack || k.isPlayPause) return false;
      if (k.key === "Backspace") { url = url.slice(0, -1); render(); return true; }
      if (typeof k.key === "string" && k.key.length === 1) { url += k.key; render(); return true; }
      return false;
    },
  };
}
